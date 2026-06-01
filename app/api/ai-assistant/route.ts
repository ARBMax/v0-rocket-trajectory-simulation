import {
  consumeStream,
  convertToModelMessages,
  streamText,
  UIMessage,
} from 'ai'

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  console.log('[v0] API route POST called. messages:', messages)

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
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
  })

  console.log('[v0] streamText initialized')

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    consumeSseStream: consumeStream,
  })
}
