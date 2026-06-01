import { streamText } from 'ai'

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { messages } = body as { messages: Array<{ role: string; content: string }> }

    const systemPrompt = `You are an AI assistant for the Ozone Labs Rocket Trajectory Simulation. Help users understand rocket physics, orbital mechanics, Hohmann transfers, and mission planning. Provide clear, educational explanations about trajectory optimization, planet targeting, fuel management, and launch windows.`

    // Convert messages to the format streamText expects
    const formattedMessages = messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    }))

    const result = streamText({
      model: 'xai/grok-2',
      system: systemPrompt,
      messages: formattedMessages,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('[v0 API] Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error', details: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
