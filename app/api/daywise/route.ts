import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI("AIzaSyA36xC5MCb26dhfllQhWD4VRofM72UQ7ug")

export async function POST(request: Request) {
  try {
    const { action, data } = await request.json()

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    let prompt = ""

    switch (action) {
      case "prioritize":
        prompt = `You are DayWise, an AI productivity assistant. Analyze these tasks and provide a prioritized list with reasoning. Format your response as a numbered list with brief explanations for each priority.

Tasks to prioritize:
${data.tasks.map((t: { title: string; description?: string }) => `- ${t.title}${t.description ? `: ${t.description}` : ""}`).join("\n")}

Provide a prioritized order with brief reasoning for each task's priority level.`
        break

      case "suggest":
        prompt = `You are DayWise, an AI productivity assistant. Based on the user's current tasks and schedule, suggest 3-5 additional tasks or improvements they might want to consider. Be specific and actionable.

Current tasks:
${data.tasks.map((t: { title: string }) => `- ${t.title}`).join("\n")}

${data.context ? `Additional context: ${data.context}` : ""}

Provide helpful, specific suggestions.`
        break

      case "breakdown":
        prompt = `You are DayWise, an AI productivity assistant. Break down this task into smaller, actionable subtasks. Each subtask should be specific and completable in 15-30 minutes.

Task to break down: ${data.task}

Provide a numbered list of 4-8 subtasks.`
        break

      case "schedule":
        prompt = `You are DayWise, an AI productivity assistant. Create an optimized daily schedule based on these tasks. Consider task priority, estimated duration, and energy levels throughout the day.

Tasks to schedule:
${data.tasks.map((t: { title: string; duration?: string }) => `- ${t.title}${t.duration ? ` (${t.duration})` : ""}`).join("\n")}

Working hours: ${data.workingHours || "9 AM - 5 PM"}

Create a time-blocked schedule with specific time slots.`
        break

      default:
        return Response.json({ error: "Invalid action" }, { status: 400 })
    }

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    return Response.json({ result: response })
  } catch (error: any) {
    console.error("DayWise API error:", error)
    return Response.json({ error: error.message || "Failed to process request" }, { status: 500 })
  }
}
