import {
  consumeStream,
  convertToModelMessages,
  streamText,
  UIMessage,
} from 'ai'

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const systemPrompt = `You are an AI assistant for the Ozone Labs Rocket Trajectory Simulation. You help users understand and analyze rocket trajectories, orbital mechanics, Hohmann transfers, and mission parameters.

When answering questions:
- Provide clear, educational explanations about rocket physics and orbital mechanics
- Reference specific mission parameters when relevant (thrust, fuel mass, orbital radius, etc.)
- Explain concepts like apogee, burnout, trajectory, drag coefficient, and orbital positioning
- Help users understand how different parameters affect mission outcomes
- Provide guidance on optimizing missions for specific targets (Mars, Venus, Mercury, etc.)
- Be encouraging and help users learn through interactive simulation

The simulation tracks:
- Real-time rocket position and velocity
- Orbital mechanics and gravitational effects
- Atmospheric drag effects
- Planet orbital positions for precise launch windows
- Mission telemetry and trajectory visualization`

  const result = streamText({
    model: 'openai/gpt-5',
    system: systemPrompt,
    // Note: convertToModelMessages is async in version 6
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    // Pass original messages for persistence - onFinish receives complete history
    originalMessages: messages,
    onFinish: async ({ messages: allMessages, isAborted }) => {
      if (isAborted) return
      // allMessages includes the new AI response as UIMessage[]
      // await saveChat({ chatId, messages: allMessages })
    },
    consumeSseStream: consumeStream,
  })
}
