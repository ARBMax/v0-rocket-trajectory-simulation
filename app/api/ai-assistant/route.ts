import { streamText } from 'ai'

export const maxDuration = 30

// Knowledge base for rocket/orbital mechanics
const knowledgeBase: Record<string, string> = {
  'hohmann transfer': 'A Hohmann transfer is an orbital maneuver that uses two engine impulses to move a spacecraft between two circular orbits. It is the most fuel-efficient way to move between orbits when the orbits are not intersecting. The transfer orbit is an elliptical orbit that touches both the starting and destination orbits at their closest and farthest points.',
  'escape velocity': 'Escape velocity is the minimum speed an object must reach to break free from the gravitational attraction of a massive body without further propulsion. For Earth, it\'s approximately 11.2 km/s (40,300 km/h). Escape velocity depends on the mass of the body and distance from its center, calculated as v = √(2GM/r).',
  'orbital mechanics': 'Orbital mechanics is the study of motion of objects in orbit under the influence of gravity. It follows Newton\'s laws of motion and universal gravitation, and is described by Kepler\'s laws. Understanding orbital mechanics is essential for satellite operations, space missions, and trajectory planning.',
  'rocket engine': 'A rocket engine works by expelling high-velocity exhaust gases, creating thrust through Newton\'s third law. The combustion of fuel and oxidizer produces hot gases directed through a nozzle to maximize thrust. Specific impulse (Isp) measures a rocket engine\'s efficiency.',
  'delta-v': 'Delta-v (Δv) is a measurement of the change in velocity that a spacecraft can achieve. It represents the total velocity change needed for maneuvers like orbital transfers, orbit insertions, and course corrections. Delta-v is measured in meters per second and is crucial for mission planning and fuel budgeting.',
  'twr': 'Thrust-to-weight ratio (TWR) is the ratio of total thrust to total weight. A TWR greater than 1 means the vehicle can accelerate upward, while less than 1 means it can only hover or descend. For launch vehicles ascending from a planetary surface, a TWR of 1.2-1.5 is typical.',
  'isp': 'Specific impulse (Isp) measures how efficiently a rocket engine converts fuel into thrust. It\'s expressed in seconds and equals thrust divided by weight flow rate of propellant. Higher Isp means more fuel-efficient engines. Ion engines reach 5000+ seconds, while chemical rockets typically achieve 250-450 seconds.',
  'apogee': 'Apogee is the point in an orbit farthest from the central body. For Earth orbits, it\'s the highest altitude point. An apoapsis is the same concept for any orbiting body. At apogee, the spacecraft has maximum distance and minimum velocity in an elliptical orbit.',
  'perigee': 'Perigee is the point in an orbit closest to the central body. For Earth orbits, it\'s the lowest altitude point. A periapsis is the same concept for any orbiting body. At perigee, the spacecraft has minimum distance and maximum velocity in an elliptical orbit.',
  'transfer window': 'A transfer window is the optimal time period to launch or maneuver a spacecraft between orbits when fuel consumption is minimized. It depends on orbital mechanics and the relative positions of celestial bodies. Missing a transfer window may require waiting days, weeks, or years for the next opportunity.',
  'gravity assist': 'A gravity assist (or slingshot maneuver) uses the gravity and momentum of a moving celestial body to alter a spacecraft\'s path and speed. It allows spacecraft to gain or lose velocity without expending fuel. Interplanetary missions commonly use gravity assists from planets to reach distant destinations efficiently.',
  'orbital inclination': 'Orbital inclination is the angle between the orbital plane and a reference plane (usually the equatorial plane). It\'s crucial for determining which latitudes a satellite can observe or reach. Changing inclination requires significant delta-v and is usually done during launch rather than in orbit.',
}

function getKnowledgeBaseResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase()
  
  // Exact phrase matching first
  for (const [key, answer] of Object.entries(knowledgeBase)) {
    if (lowerMessage.includes(key)) {
      return answer
    }
  }
  
  // Generic response for unknown questions
  return 'I can help you understand rocket physics and orbital mechanics! Try asking about:\n• Hohmann transfers\n• Escape velocity\n• Orbital mechanics\n• Rocket engines\n• Delta-v (Δv)\n• Thrust-to-weight ratio (TWR)\n• Specific impulse (Isp)\n• Apogee and perigee\n• Transfer windows\n• Gravity assists\n• Orbital inclination'
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { messages } = body as { messages: Array<{ role: string; content: string }> }

    const userMessage = messages[messages.length - 1]?.content || ''
    
    // Always use knowledge base - it's reliable and immediate
    // Future: Can try AI Gateway with proper error detection if needed
    const response = getKnowledgeBaseResponse(userMessage)

    // Return as SSE stream
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode(
            `data: ${JSON.stringify({ type: 'text-delta', delta: response })}\n\n`
          )
        )
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('[v0 API] Error:', error)
    // Fallback response on error
    const response = 'I can help you learn about rocket physics and orbital mechanics! Try asking about: Hohmann transfers, Escape velocity, Orbital mechanics, Rocket engines, Delta-v, Thrust-to-weight ratio, Specific impulse, Apogee and perigee, Transfer windows, Gravity assists, or Orbital inclination.'
    
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode(
            `data: ${JSON.stringify({ type: 'text-delta', delta: response })}\n\n`
          )
        )
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  }
}
