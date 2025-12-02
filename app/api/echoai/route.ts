import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI("AIzaSyALS_BNkL4WYWlnFUy8TrsKlNwywtQ9eVs")

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "Invalid messages format" }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })

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

    const history = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }))

    const latestMessage = messages[messages.length - 1].content

    const systemContext = `You are EchoAI, a helpful AI assistant created by Strata Systems. 
Current date and time: ${dateString} at ${timeString}.
You are knowledgeable, friendly, and helpful. When asked about the current date or time, use the information provided above.`

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemContext }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I am EchoAI, ready to assist you!" }],
        },
        ...history,
      ],
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
      },
    })

    const result = await chat.sendMessage(latestMessage)
    const response = await result.response
    const text = response.text()

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
