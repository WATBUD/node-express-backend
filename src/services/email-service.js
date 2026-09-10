import nodemailer from 'nodemailer'

const gmailConfigured = () =>
  process.env.EMAIL_PROVIDER?.toLowerCase() === 'gmail' &&
  Boolean(process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD)

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

export const isEmailConfigured = () => gmailConfigured() || brevoConfigured()

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

export const sendVerificationEmail = async ({ destination, code }) => {
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
