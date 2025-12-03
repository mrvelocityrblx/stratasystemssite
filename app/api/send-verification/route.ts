import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json()

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "stratasystemscorp@gmail.com",
        pass: "owNWeP-NGLmI8hN",
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
    })

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .code-box { background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Strata Systems!</h1>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Thank you for signing up with Strata Systems. To complete your registration, please verify your email address using the code below:</p>
              
              <div class="code-box">
                <p style="margin: 0; color: #666; font-size: 14px;">Your Verification Code</p>
                <p class="code">${code}</p>
                <p style="margin: 0; color: #666; font-size: 12px;">This code will expire in 10 minutes</p>
              </div>
              
              <p>If you didn't create an account with Strata Systems, please ignore this email.</p>
              
              <p>Best regards,<br>The Strata Systems Team</p>
            </div>
            <div class="footer">
              <p>© 2025 Strata Systems. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const mailOptions = {
      from: '"Strata Systems" <stratasystemscorp@gmail.com>',
      to: email,
      subject: "Verify Your Strata Systems Account",
      html: emailHtml,
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({ success: true, message: "Verification code sent to email" })
  } catch (error) {
    console.error("[v0] Error sending verification email:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send verification email",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
