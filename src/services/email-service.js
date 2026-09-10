import nodemailer from 'nodemailer'

const gmailConfigured = () =>
  process.env.EMAIL_PROVIDER?.toLowerCase() === 'gmail' &&
  Boolean(process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD)

const gmailApiConfigured = () =>
  process.env.EMAIL_PROVIDER?.toLowerCase() === 'gmail_api' &&
  Boolean(
    process.env.EMAIL_USER &&
      process.env.GMAIL_CLIENT_ID &&
      process.env.GMAIL_CLIENT_SECRET &&
      process.env.GMAIL_REFRESH_TOKEN,
  )

const brevoConfigured = () =>
  process.env.EMAIL_PROVIDER?.toLowerCase() === 'brevo' &&
  Boolean(process.env.BREVO_API_KEY && process.env.EMAIL_FROM)

const senderFromEnvironment = () => {
  const value = process.env.EMAIL_FROM || process.env.EMAIL_USER || ''
  const match = value.match(/^\s*(.*?)\s*<([^>]+)>\s*$/)
  return match
    ? { name: match[1] || 'INI Dating', email: match[2] }
    : { name: 'INI Dating', email: value }
}

export const isEmailConfigured = () =>
  gmailApiConfigured() || gmailConfigured() || brevoConfigured()

const emailContents = code => ({
  subject: 'INI Dating Email 驗證碼',
  text: `你的 INI Dating 驗證碼是 ${code}。驗證碼將於 10 分鐘後失效，請勿提供給其他人。`,
  html: `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:28px;color:#29252a">
      <p style="color:#ed5874;font-weight:700;letter-spacing:1px">INI DATING</p>
      <h2>驗證你的 Email</h2>
      <p>請在 App 輸入以下驗證碼：</p>
      <p style="font-size:30px;font-weight:800;letter-spacing:8px;color:#ed5874">${code}</p>
      <p style="color:#777">驗證碼將於 10 分鐘後失效，請勿提供給其他人。</p>
    </div>
  `,
})

const sendWithBrevo = async ({ destination, code }) => {
  const contents = emailContents(code)
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    signal: AbortSignal.timeout(15_000),
    headers: {
      accept: 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: senderFromEnvironment(),
      to: [{ email: destination }],
      subject: contents.subject,
      textContent: contents.text,
      htmlContent: contents.html,
    }),
  })
  if (!response.ok) {
    const error = new Error(`Brevo email API returned HTTP ${response.status}.`)
    error.code = 'EMAIL_PROVIDER_REJECTED'
    throw error
  }
}

const encodeBase64Url = value =>
  Buffer.from(value).toString('base64url')

const gmailRawMessage = ({ destination, code }) => {
  const contents = emailContents(code)
  const sender = senderFromEnvironment()
  const senderName = sender.name.replace(/[\r\n"]/g, '')
  const encodedSubject = Buffer.from(contents.subject).toString('base64')
  const encodedBody = Buffer.from(contents.html).toString('base64')
  return encodeBase64Url(
    [
      `From: "${senderName}" <${sender.email}>`,
      `To: ${destination}`,
      `Subject: =?UTF-8?B?${encodedSubject}?=`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      encodedBody,
    ].join('\r\n'),
  )
}

const sendWithGmailApi = async ({ destination, code }) => {
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    signal: AbortSignal.timeout(15_000),
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GMAIL_CLIENT_ID,
      client_secret: process.env.GMAIL_CLIENT_SECRET,
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  })
  if (!tokenResponse.ok) {
    const error = new Error(`Google OAuth returned HTTP ${tokenResponse.status}.`)
    error.code = 'EMAIL_AUTH_FAILED'
    throw error
  }
  const token = await tokenResponse.json()
  if (!token.access_token) {
    const error = new Error('Google OAuth response did not contain an access token.')
    error.code = 'EMAIL_AUTH_FAILED'
    throw error
  }

  const sendResponse = await fetch(
    'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    {
      method: 'POST',
      signal: AbortSignal.timeout(15_000),
      headers: {
        authorization: `Bearer ${token.access_token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ raw: gmailRawMessage({ destination, code }) }),
    },
  )
  if (!sendResponse.ok) {
    const error = new Error(`Gmail API returned HTTP ${sendResponse.status}.`)
    error.code = 'EMAIL_PROVIDER_REJECTED'
    throw error
  }
}

export const sendVerificationEmail = async ({ destination, code }) => {
  if (gmailApiConfigured()) {
    await sendWithGmailApi({ destination, code })
    return true
  }
  if (brevoConfigured()) {
    await sendWithBrevo({ destination, code })
    return true
  }
  if (!gmailConfigured()) return false

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    // Avoid leaving the mobile UI waiting indefinitely when the SMTP provider
    // is unreachable. The caller converts this failure into a stable 502 code.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  })

  const contents = emailContents(code)
  await transporter.sendMail({
    from:
      process.env.EMAIL_FROM ||
      `INI Dating <${process.env.EMAIL_USER}>`,
    to: destination,
    subject: contents.subject,
    text: contents.text,
    html: contents.html,
  })
  return true
}
