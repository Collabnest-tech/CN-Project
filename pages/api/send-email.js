// pages/api/send-email.js
import sendgrid from '@sendgrid/mail'

sendgrid.setApiKey(process.env.SENDGRID_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }
  const { to, subject, html } = req.body
  try {
    await sendgrid.send({ to, from: process.env.EMAIL_SENDER, subject, html })
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('SendGrid Error:', err)
    return res.status(500).json({ error: 'Error sending email' })
  }
}

export const config = {
  api: { bodyParser: true }
}
