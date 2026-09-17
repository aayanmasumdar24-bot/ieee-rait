import { Router, Request, Response } from 'express'
import nodemailer from 'nodemailer'
import { z } from 'zod'

export const contactRouter = Router()

const ContactSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  track: z.enum(['core', 'associate']),
  message: z.string().max(500).optional(),
})

contactRouter.post('/', async (req: Request, res: Response) => {
  const parsed = ContactSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() })
    return
  }

  const { name, email, track, message } = parsed.data

  // Only send if SMTP is configured — otherwise just log
  if (process.env.SMTP_HOST) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    await transporter.sendMail({
      from: `"IEEE RAIT Site" <${process.env.SMTP_USER}>`,
      to: process.env.NOTIFY_EMAIL ?? 'ieee@rait.ac.in',
      subject: `[IEEE RAIT] New application — ${track} track`,
      html: `
        <h2>New application received</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Track:</strong> ${track}</p>
        ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
        <hr/>
        <small>Sent from the IEEE RAIT recruitment site at ${new Date().toISOString()}</small>
      `,
    })
  } else {
    console.log('[contact] Submission (SMTP not configured):', { name, email, track })
  }

  res.json({ success: true })
})
