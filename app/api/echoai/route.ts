import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI("AIzaSyA36xC5MCb26dhfllQhWD4VRofM72UQ7ug")

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

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
      },
    })

    // Generate a response
    const result = await chat.sendMessage(latestMessage)
    const response = result.response.text()

    return Response.json({ message: response })
  } catch (error: any) {
    console.error("EchoAI API error:", error)
    return Response.json({ error: error.message || "Failed to generate response" }, { status: 500 })
  }
}
