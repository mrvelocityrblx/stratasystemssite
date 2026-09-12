import { NextResponse } from "next/server"
import { Resend } from "resend"

const recipient = "clay16182@gmail.com"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const subject = typeof body?.subject === "string" ? body.subject.trim() : ""
  const message = typeof body?.message === "string" ? body.message.trim() : ""
  const priority = body?.priority
  const userEmail = typeof body?.userEmail === "string" ? body.userEmail.trim() : ""
  const userName = typeof body?.userName === "string" ? body.userName.trim() : "User"

  if (!subject || !message || !userEmail || !["low", "medium", "high"].includes(priority)) {
    return NextResponse.json({ error: "Please provide valid ticket details." }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "Support email is not configured." }, { status: 503 })
  }

  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send(
    {
      from: "Strata Systems Support <onboarding@resend.dev>",
      to: [recipient],
      replyTo: userEmail,
      subject: `[${priority.toUpperCase()}] Support ticket: ${subject}`,
      text: `New support ticket\n\nFrom: ${userName} <${userEmail}>\nPriority: ${priority}\nSubject: ${subject}\n\n${message}`,
    },
    { idempotencyKey: `support-ticket/${userEmail}/${subject}/${message}`.slice(0, 256) },
  )

  if (error) {
    console.error("[v0] Support ticket email failed:", error.message)
    return NextResponse.json({ error: "We could not send your ticket. Please try again." }, { status: 502 })
  }

  return NextResponse.json({ success: true })
}
