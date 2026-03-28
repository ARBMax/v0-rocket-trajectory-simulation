"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SimulationResult, SimulationState } from "@/lib/rocket-physics"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from "recharts"

interface TrajectoryChartProps {
  result: SimulationResult | null
  currentIndex: number
}

export function TrajectoryChart({ result, currentIndex }: TrajectoryChartProps) {
  // Sample data for display (every 10th point for performance)
  const displayData =
    result?.states.filter((_, i) => i % 10 === 0 || i === currentIndex) ?? []

  // Get current position for indicator
  const currentState = result?.states[currentIndex]

  // Format height for display
  const formatHeight = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}km`
    }
    return `${value.toFixed(0)}m`
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-foreground">Altitude vs Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {result ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                <XAxis
                  dataKey="time"
                  stroke="var(--muted-foreground)"
                  tickFormatter={(v) => `${v}s`}
                  fontSize={12}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  tickFormatter={formatHeight}
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    color: "var(--foreground)",
                  }}
                  labelFormatter={(v) => `Time: ${v}s`}
                  formatter={(value: number, name: string) => {
                    if (name === "height") return [formatHeight(value), "Altitude"]
                    return [value, name]
                  }}
                />
                <Legend
                  wrapperStyle={{ color: "var(--foreground)" }}
                  formatter={(value) => (value === "height" ? "Altitude" : value)}
                />
                <defs>
                  <linearGradient id="heightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="height"
                  fill="url(#heightGradient)"
                  stroke="none"
                />
                <Line
                  type="monotone"
                  dataKey="height"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, fill: "var(--chart-1)" }}
                />
                {/* Current position marker */}
                {currentState && (
                  <ReferenceLine
                    x={currentState.time}
                    stroke="var(--primary)"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                  />
                )}
                {/* Apogee marker */}
                {result.apogeeTime > 0 && (
                  <ReferenceLine
                    x={result.apogeeTime}
                    stroke="var(--chart-2)"
                    strokeDasharray="3 3"
                    label={{
                      value: "Apogee",
                      position: "top",
                      fill: "var(--chart-2)",
                      fontSize: 12,
                    }}
                  />
                )}
                {/* Burnout marker */}
                {result.burnoutTime > 0 && (
                  <ReferenceLine
                    x={result.burnoutTime}
                    stroke="var(--chart-3)"
                    strokeDasharray="3 3"
                    label={{
                      value: "Burnout",
                      position: "insideTopRight",
                      fill: "var(--chart-3)",
                      fontSize: 12,
                    }}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Run simulation to see trajectory
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface VelocityChartProps {
  result: SimulationResult | null
  currentIndex: number
}

export function VelocityChart({ result, currentIndex }: VelocityChartProps) {
  const displayData =
    result?.states.filter((_, i) => i % 10 === 0 || i === currentIndex) ?? []
  const currentState = result?.states[currentIndex]

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-foreground">Velocity vs Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          {result ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                <XAxis
                  dataKey="time"
                  stroke="var(--muted-foreground)"
                  tickFormatter={(v) => `${v}s`}
                  fontSize={12}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  tickFormatter={(v) => `${v.toFixed(0)} m/s`}
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    color: "var(--foreground)",
                  }}
                  labelFormatter={(v) => `Time: ${v}s`}
                  formatter={(value: number) => [`${value.toFixed(2)} m/s`, "Velocity"]}
                />
                <Legend
                  wrapperStyle={{ color: "var(--foreground)" }}
                  formatter={() => "Velocity"}
                />
                <Line
                  type="monotone"
                  dataKey="velocity"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  dot={false}
                />
                {/* Zero line */}
                <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeDasharray="3 3" />
                {currentState && (
                  <ReferenceLine
                    x={currentState.time}
                    stroke="var(--primary)"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Run simulation to see velocity
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface ForcesChartProps {
  result: SimulationResult | null
  currentIndex: number
}

export function ForcesChart({ result, currentIndex }: ForcesChartProps) {
  const displayData =
    result?.states.filter((_, i) => i % 10 === 0 || i === currentIndex) ?? []
  const currentState = result?.states[currentIndex]

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-foreground">Forces vs Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          {result ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                <XAxis
                  dataKey="time"
                  stroke="var(--muted-foreground)"
                  tickFormatter={(v) => `${v}s`}
                  fontSize={12}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  tickFormatter={(v) => `${v.toFixed(0)} N`}
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    color: "var(--foreground)",
                  }}
                  labelFormatter={(v) => `Time: ${v}s`}
                  formatter={(value: number, name: string) => [`${value.toFixed(2)} N`, name]}
                />
                <Legend wrapperStyle={{ color: "var(--foreground)" }} />
                <Line
                  type="monotone"
                  dataKey="thrust"
                  name="Thrust"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="gravityForce"
                  name="Gravity"
                  stroke="var(--chart-3)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="dragForce"
                  name="Drag"
                  stroke="var(--chart-4)"
                  strokeWidth={2}
                  dot={false}
                />
                <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeDasharray="3 3" />
                {currentState && (
                  <ReferenceLine
                    x={currentState.time}
                    stroke="var(--primary)"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Run simulation to see forces
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
