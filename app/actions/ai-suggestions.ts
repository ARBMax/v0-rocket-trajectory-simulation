"use server"

import { generateText } from "ai"
import { RocketParams, SimulationResult, calculateTheoreticalValues } from "@/lib/rocket-physics"

export interface AISuggestion {
  title: string
  description: string
  parameterChanges?: Partial<RocketParams>
  priority: "high" | "medium" | "low"
  category: "performance" | "safety" | "efficiency" | "optimization"
}

export interface AIAnalysis {
  overallAssessment: string
  safetyRating: number // 1-10
  efficiencyRating: number // 1-10
  suggestions: AISuggestion[]
  predictedImprovement: string
}

export async function generateAISuggestions(
  params: RocketParams,
  result: SimulationResult | null
): Promise<AIAnalysis> {
  const theoretical = calculateTheoreticalValues(params)
  
  const thrustToWeightRatio = params.thrust / ((params.mass + params.fuelMass) * 9.81)
  const fuelFraction = params.fuelMass / (params.mass + params.fuelMass)
  const burnTime = params.fuelMass / params.burnRate
  
  const prompt = `You are an aerospace engineer AI analyzing a rocket trajectory simulation. Analyze the following rocket parameters and simulation results, then provide specific, actionable recommendations.

CURRENT ROCKET PARAMETERS:
- Dry Mass: ${params.mass} kg
- Fuel Mass: ${params.fuelMass} kg
- Total Mass: ${params.mass + params.fuelMass} kg
- Thrust: ${params.thrust} N
- Burn Rate: ${params.burnRate} kg/s
- Drag Coefficient: ${params.dragCoefficient}
- Cross-sectional Area: ${params.crossSectionalArea} m²

CALCULATED METRICS:
- Thrust-to-Weight Ratio: ${thrustToWeightRatio.toFixed(2)}
- Fuel Fraction: ${(fuelFraction * 100).toFixed(1)}%
- Burn Time: ${burnTime.toFixed(1)} seconds
- Theoretical Max Height (no drag): ${theoretical.idealMaxHeight.toFixed(0)} m
- Theoretical Burnout Velocity: ${theoretical.idealBurnoutVelocity.toFixed(1)} m/s

${result ? `SIMULATION RESULTS:
- Actual Max Height: ${result.maxHeight.toFixed(0)} m
- Max Velocity: ${result.maxVelocity.toFixed(1)} m/s
- Total Flight Time: ${result.flightTime.toFixed(1)} s
- Burnout Height: ${result.burnoutHeight.toFixed(0)} m
- Burnout Time: ${result.burnoutTime.toFixed(1)} s
- Drag Efficiency Loss: ${(((theoretical.idealMaxHeight - result.maxHeight) / theoretical.idealMaxHeight) * 100).toFixed(1)}%` : "No simulation run yet."}

Provide your analysis as a JSON object with this exact structure:
{
  "overallAssessment": "Brief 1-2 sentence assessment of the rocket configuration",
  "safetyRating": <number 1-10>,
  "efficiencyRating": <number 1-10>,
  "suggestions": [
    {
      "title": "Short actionable title",
      "description": "Detailed explanation of the recommendation",
      "priority": "high" | "medium" | "low",
      "category": "performance" | "safety" | "efficiency" | "optimization"
    }
  ],
  "predictedImprovement": "Summary of expected improvements if suggestions are followed"
}

Focus on:
1. Thrust-to-weight ratio optimization (should be >1.5 for good performance)
2. Fuel efficiency and burn rate optimization
3. Aerodynamic improvements (drag coefficient)
4. Safety considerations (structural integrity, stability)
5. Trajectory optimization for maximum altitude

Provide 3-5 specific, actionable suggestions. Be technical but concise.`

  try {
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      maxOutputTokens: 1500,
    })

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]) as AIAnalysis
      return analysis
    }
    
    throw new Error("Failed to parse AI response")
  } catch (error) {
    console.error("AI suggestion error:", error)
    
    // Return fallback analysis based on calculations
    return generateFallbackAnalysis(params, result, thrustToWeightRatio, fuelFraction, theoretical)
  }
}

function generateFallbackAnalysis(
  params: RocketParams,
  result: SimulationResult | null,
  twr: number,
  fuelFraction: number,
  theoretical: { idealMaxHeight: number; idealBurnoutVelocity: number; burnTime: number }
): AIAnalysis {
  const suggestions: AISuggestion[] = []
  
  // Check thrust-to-weight ratio
  if (twr < 1.5) {
    suggestions.push({
      title: "Increase Thrust-to-Weight Ratio",
      description: `Current TWR of ${twr.toFixed(2)} is below optimal. Consider increasing thrust to ${Math.ceil((params.mass + params.fuelMass) * 9.81 * 1.8)} N for better liftoff performance.`,
      priority: "high",
      category: "performance",
      parameterChanges: { thrust: Math.ceil((params.mass + params.fuelMass) * 9.81 * 1.8) }
    })
  }
  
  // Check fuel fraction
  if (fuelFraction < 0.3) {
    suggestions.push({
      title: "Optimize Fuel Fraction",
      description: `Fuel fraction of ${(fuelFraction * 100).toFixed(1)}% is low. For better delta-v, aim for 40-60% fuel fraction. Consider increasing fuel mass.`,
      priority: "medium",
      category: "efficiency",
      parameterChanges: { fuelMass: params.mass * 0.8 }
    })
  }
  
  // Check drag coefficient
  if (params.dragCoefficient > 0.4) {
    suggestions.push({
      title: "Reduce Aerodynamic Drag",
      description: `Drag coefficient of ${params.dragCoefficient} is high. Streamlining the rocket body could reduce Cd to 0.3-0.35, improving altitude by 10-15%.`,
      priority: "medium",
      category: "optimization",
      parameterChanges: { dragCoefficient: 0.35 }
    })
  }
  
  // Check burn rate
  const burnTime = params.fuelMass / params.burnRate
  if (burnTime < 2) {
    suggestions.push({
      title: "Extend Burn Duration",
      description: `Burn time of ${burnTime.toFixed(1)}s is very short. Consider reducing burn rate for a longer, more efficient powered ascent.`,
      priority: "low",
      category: "efficiency",
      parameterChanges: { burnRate: params.fuelMass / 5 }
    })
  }
  
  // Add general optimization suggestion
  if (result && result.maxHeight < theoretical.idealMaxHeight * 0.7) {
    suggestions.push({
      title: "Significant Drag Losses Detected",
      description: `Actual altitude is ${((result.maxHeight / theoretical.idealMaxHeight) * 100).toFixed(0)}% of theoretical. Consider reducing cross-sectional area or drag coefficient for better efficiency.`,
      priority: "high",
      category: "optimization"
    })
  }
  
  const safetyRating = twr > 1.2 && twr < 5 ? 8 : twr > 5 ? 5 : 4
  const efficiencyRating = Math.min(10, Math.round((fuelFraction * 10) + (1 / params.dragCoefficient)))
  
  return {
    overallAssessment: `Rocket configuration is ${twr > 1.5 ? "adequate" : "suboptimal"} for achieving target altitude. ${suggestions.length > 0 ? "Several optimizations recommended." : "Performance is within acceptable parameters."}`,
    safetyRating,
    efficiencyRating,
    suggestions: suggestions.length > 0 ? suggestions : [{
      title: "Configuration Optimal",
      description: "Current parameters are well-balanced for the rocket class. Consider fine-tuning for specific mission requirements.",
      priority: "low",
      category: "optimization"
    }],
    predictedImprovement: suggestions.length > 0 
      ? `Implementing these changes could improve maximum altitude by 15-30% and overall flight efficiency.`
      : "No significant improvements identified. Current configuration is optimized."
  }
}
