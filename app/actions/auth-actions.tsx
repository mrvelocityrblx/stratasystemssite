"use server"

import { Resend } from "resend"

const resend = new Resend("re_T7YfRniE_Pa9pAdFVzejfjcS2Ase4rZZU")

export async function sendVerificationEmail(email: string, code: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Strata Systems <onboarding@resend.dev>",
      to: email,
      subject: "Verify Your Email - Strata Systems",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Strata Systems</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Verify Your Email Address</h2>
              <p style="font-size: 16px; color: #666;">Thank you for signing up! Please use the verification code below to complete your registration:</p>
              <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                <div style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${code}
                </div>
              </div>
              <p style="font-size: 14px; color: #666;">This code will expire in 10 minutes for security purposes.</p>
              <p style="font-size: 14px; color: #666;">If you didn't request this code, please ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              <p style="font-size: 12px; color: #999; text-align: center;">
                © ${new Date().getFullYear()} Strata Systems. All rights reserved.
              </p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error("[v0] Resend error:", error)
      return { success: false, error: error.message }
    }

    console.log("[v0] Email sent successfully:", data)
    return { success: true }
  } catch (error: any) {
    console.error("[v0] Error sending email:", error)
    return { success: false, error: error.message }
  }
}

export async function checkIfBanned(email: string): Promise<boolean> {
  // Check local storage for bans
  if (typeof window !== "undefined") {
    const bansJson = localStorage.getItem("bannedUsers")
    if (bansJson) {
      try {
        const bans = JSON.parse(bansJson)
        if (Array.isArray(bans) && bans.some((ban) => ban.email === email)) {
          return true
        }
      } catch (e) {
        console.error("[v0] Error parsing banned users:", e)
      }
    }
  }

  return false
}

export async function checkGlobalBan(email: string): Promise<boolean> {
  return checkIfBanned(email)
}
