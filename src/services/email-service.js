import nodemailer from 'nodemailer'

const gmailConfigured = () =>
  process.env.EMAIL_PROVIDER?.toLowerCase() === 'gmail' &&
  Boolean(process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD)

export const isEmailConfigured = () => gmailConfigured()

export const sendVerificationEmail = async ({ destination, code }) => {
  if (!gmailConfigured()) return false

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  })

  await transporter.sendMail({
    from:
      process.env.EMAIL_FROM ||
      `INI Dating <${process.env.EMAIL_USER}>`,
    to: destination,
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
  return true
}
