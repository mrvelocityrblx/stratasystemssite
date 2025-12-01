import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI("AIzaSyALS_BNkL4WYWlnFUy8TrsKlNwywtQ9eVs")

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "Invalid messages format" }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

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

    // Build the conversation history for Gemini
    const history = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }))

    // Get the latest user message
    const latestMessage = messages[messages.length - 1].content

    const systemContext = `You are EchoAI, a helpful AI assistant created by Strata Systems. 
Current date and time: ${dateString} at ${timeString}.
You are knowledgeable, friendly, and helpful. When asked about the current date or time, use the information provided above.`

    // Start a chat session with history
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: "What is your name and what can you do?" }],
        },
        {
          role: "model",
          parts: [{ text: systemContext }],
        },
        ...history,
      ],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.9,
      },
    })

    const result = await chat.sendMessage(latestMessage)

    if (!result || !result.response) {
      throw new Error("No response from AI model")
    }

    const response = await result.response.text()

    if (!response || response.trim() === "") {
      throw new Error("Empty response from AI model")
    }

    return Response.json({ message: response })
  } catch (error: any) {
    console.error("EchoAI API error:", error)

    let errorMessage = "Failed to generate response. Please try again."

    if (error.message?.includes("API key")) {
      errorMessage = "API configuration error. Please contact support."
    } else if (error.message?.includes("quota") || error.message?.includes("limit")) {
      errorMessage = "Service temporarily unavailable. Please try again in a moment."
    } else if (error.message?.includes("Invalid")) {
      errorMessage = "Invalid request. Please try rephrasing your message."
    }

    return Response.json({ error: errorMessage }, { status: 500 })
  }
}
