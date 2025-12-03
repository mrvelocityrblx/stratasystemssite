"use server"

import { Resend } from "resend"

// Initialize Resend with your API key
const resend = new Resend("re_T7YfRniE_Pa9pAdFVzejfjcS2Ase4rZZU")

/**
 * Send verification email with code
 */
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
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .container {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 12px;
                padding: 40px;
                text-align: center;
              }
              .logo {
                width: 80px;
                height: 80px;
                margin: 0 auto 20px;
              }
              h1 {
                color: #ffffff;
                margin: 0 0 10px;
                font-size: 28px;
              }
              p {
                color: #f0f0f0;
                margin: 0 0 30px;
                font-size: 16px;
              }
              .code-container {
                background: #ffffff;
                border-radius: 8px;
                padding: 30px;
                margin: 30px 0;
              }
              .code {
                font-size: 48px;
                font-weight: bold;
                letter-spacing: 8px;
                color: #667eea;
                font-family: 'Courier New', monospace;
              }
              .footer {
                color: #ffffff;
                font-size: 14px;
                margin-top: 30px;
              }
              .warning {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 6px;
                padding: 15px;
                margin-top: 20px;
                font-size: 14px;
                color: #ffffff;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🚀 Welcome to Strata Systems!</h1>
              <p>You're just one step away from accessing your account.</p>
              
              <div class="code-container">
                <p style="color: #666; margin: 0 0 10px; font-size: 14px;">Your verification code is:</p>
                <div class="code">${code}</div>
                <p style="color: #999; margin: 10px 0 0; font-size: 12px;">This code expires in 10 minutes</p>
              </div>
              
              <p>Enter this code in the signup form to verify your email address and complete your registration.</p>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong><br>
                If you didn't request this code, please ignore this email. Never share your verification code with anyone.
              </div>
              
              <div class="footer">
                <p>© ${new Date().getFullYear()} Strata Systems. All rights reserved.</p>
                <p style="font-size: 12px; margin-top: 10px;">
                  Sent from: stratasystemscorp@gmail.com
                </p>
              </div>
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
    return { success: true, data }
  } catch (error: any) {
    console.error("[v0] Error sending verification email:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Check if a user is globally banned
 */
export async function checkGlobalBan(email: string): Promise<boolean> {
  try {
    // This will be implemented with Firestore when available
    // For now, return false
    return false
  } catch (error) {
    console.error("[v0] Error checking global ban:", error)
    return false
  }
}

// Alias for compatibility
export const checkIfBanned = checkGlobalBan
