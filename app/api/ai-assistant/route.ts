import { streamText, convertToModelMessages, UIMessage } from 'ai'

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const systemPrompt = `You are an AI assistant for the Ozone Labs Rocket Trajectory Simulation. Help users understand rocket physics, orbital mechanics, Hohmann transfers, and mission planning. Provide clear, educational explanations about trajectory optimization, planet targeting, fuel management, and launch windows.`

  const result = streamText({
    model: 'openai/gpt-5',
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse()
}
