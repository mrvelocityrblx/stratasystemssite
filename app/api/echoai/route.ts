import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "Invalid messages format" }, { status: 400 })
    }

    const now = new Date()
    const dateString = now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    const timeString = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })

    const systemPrompt = `You are EchoAI, a helpful AI assistant created by Strata Systems. 
Current date and time: ${dateString} at ${timeString}.
You are knowledgeable, friendly, and helpful. When asked about the current date or time, use the information provided above.`

    // Convert messages to the format expected by the AI SDK
    const formattedMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }))

    const { text } = await generateText({
      model: xai("grok-4", {
        apiKey: process.env.XAI_API_KEY,
      }),
      system: systemPrompt,
      messages: formattedMessages,
    })

    if (!text || text.trim() === "") {
      return Response.json({
        message: "I apologize, but I couldn't generate a proper response. Could you please rephrase your question?",
      })
    }

    return Response.json({ message: text })
  } catch (error: any) {
    console.error("[v0] EchoAI API error:", error)

    let errorMessage = "I apologize, but I'm having trouble responding right now. Please try again."

    if (error.message?.includes("API key") || error.status === 403) {
      errorMessage = "API configuration issue detected. Please try again in a moment."
    } else if (error.message?.includes("quota") || error.message?.includes("limit") || error.status === 429) {
      errorMessage = "Service is currently busy. Please wait a moment and try again."
    } else if (error.message?.includes("timeout") || error.code === "ETIMEDOUT") {
      errorMessage = "Request timed out. Please try again with a shorter message."
    } else if (error.message?.includes("Invalid") || error.status === 400) {
      errorMessage = "Invalid request. Please try rephrasing your message."
    }

    return Response.json({ message: errorMessage })
  }
}
