import { streamText } from 'ai'
import { createXai } from '@ai-sdk/xai'

export const maxDuration = 30

const xai = createXai({
  apiKey: process.env.GROK_API_KEY,
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { messages } = body as { messages: Array<{ role: string; content: string }> }

    const systemPrompt = `You are an AI assistant for the Ozone Labs Rocket Trajectory Simulation. Help users understand rocket physics, orbital mechanics, Hohmann transfers, and mission planning. You can answer any question the user asks, not just about rockets. Provide clear, educational explanations and be helpful and friendly.`

    const formattedMessages = messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    }))

    const result = streamText({
      model: xai('grok-2'),
      system: systemPrompt,
      messages: formattedMessages,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('[v0 API] Error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to get response from AI', details: String(error) }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
