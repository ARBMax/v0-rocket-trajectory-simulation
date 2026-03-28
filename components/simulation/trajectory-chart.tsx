"use client"

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

function ChartWrapper({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="border-b border-border/50 bg-secondary/30 px-4 py-2">
        <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-primary">
          {title}
        </span>
      </div>
      <div className="p-4">
        <div className="h-[280px]">{children}</div>
      </div>
    </div>
  )
}

export function TrajectoryChart({ result, currentIndex }: TrajectoryChartProps) {
  const displayData =
    result?.states.filter((_, i) => i % 10 === 0 || i === currentIndex) ?? []
  const currentState = result?.states[currentIndex]

  const formatHeight = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}km`
    }
    return `${value.toFixed(0)}m`
  }

  return (
    <ChartWrapper title="Altitude vs Time">
      {result ? (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={displayData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
            <XAxis
              dataKey="time"
              stroke="var(--muted-foreground)"
              tickFormatter={(v) => `${v}s`}
              fontSize={10}
              fontFamily="var(--font-mono)"
            />
            <YAxis
              stroke="var(--muted-foreground)"
              tickFormatter={formatHeight}
              fontSize={10}
              fontFamily="var(--font-mono)"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                color: "var(--foreground)",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
              }}
              labelFormatter={(v) => `T+ ${v}s`}
              formatter={(value: number, name: string) => {
                if (name === "height") return [formatHeight(value), "ALT"]
                return [value, name]
              }}
            />
            <Legend
              wrapperStyle={{ 
                color: "var(--foreground)",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                textTransform: "uppercase",
              }}
              formatter={(value) => (value === "height" ? "Altitude" : value)}
            />
            <defs>
              <linearGradient id="heightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
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
              stroke="var(--primary)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "var(--primary)", strokeWidth: 0 }}
            />
            {currentState && (
              <ReferenceLine
                x={currentState.time}
                stroke="var(--foreground)"
                strokeDasharray="3 3"
                strokeWidth={1}
                strokeOpacity={0.5}
              />
            )}
            {result.apogeeTime > 0 && (
              <ReferenceLine
                x={result.apogeeTime}
                stroke="var(--chart-2)"
                strokeDasharray="3 3"
                label={{
                  value: "APOGEE",
                  position: "top",
                  fill: "var(--chart-2)",
                  fontSize: 9,
                  fontFamily: "var(--font-mono)",
                }}
              />
            )}
            {result.burnoutTime > 0 && (
              <ReferenceLine
                x={result.burnoutTime}
                stroke="var(--chart-3)"
                strokeDasharray="3 3"
                label={{
                  value: "MECO",
                  position: "insideTopRight",
                  fill: "var(--chart-3)",
                  fontSize: 9,
                  fontFamily: "var(--font-mono)",
                }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Awaiting simulation data
          </span>
        </div>
      )}
    </ChartWrapper>
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
    <ChartWrapper title="Velocity vs Time">
      {result ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
            <XAxis
              dataKey="time"
              stroke="var(--muted-foreground)"
              tickFormatter={(v) => `${v}s`}
              fontSize={10}
              fontFamily="var(--font-mono)"
            />
            <YAxis
              stroke="var(--muted-foreground)"
              tickFormatter={(v) => `${v.toFixed(0)}`}
              fontSize={10}
              fontFamily="var(--font-mono)"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                color: "var(--foreground)",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
              }}
              labelFormatter={(v) => `T+ ${v}s`}
              formatter={(value: number) => [`${value.toFixed(2)} m/s`, "VEL"]}
            />
            <Legend
              wrapperStyle={{ 
                color: "var(--foreground)",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                textTransform: "uppercase",
              }}
              formatter={() => "Velocity (m/s)"}
            />
            <Line
              type="monotone"
              dataKey="velocity"
              stroke="var(--chart-2)"
              strokeWidth={2}
              dot={false}
            />
            <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeDasharray="3 3" strokeOpacity={0.5} />
            {currentState && (
              <ReferenceLine
                x={currentState.time}
                stroke="var(--foreground)"
                strokeDasharray="3 3"
                strokeWidth={1}
                strokeOpacity={0.5}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Awaiting simulation data
          </span>
        </div>
      )}
    </ChartWrapper>
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
    <ChartWrapper title="Forces vs Time">
      {result ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={displayData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
            <XAxis
              dataKey="time"
              stroke="var(--muted-foreground)"
              tickFormatter={(v) => `${v}s`}
              fontSize={10}
              fontFamily="var(--font-mono)"
            />
            <YAxis
              stroke="var(--muted-foreground)"
              tickFormatter={(v) => `${v.toFixed(0)}`}
              fontSize={10}
              fontFamily="var(--font-mono)"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                color: "var(--foreground)",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
              }}
              labelFormatter={(v) => `T+ ${v}s`}
              formatter={(value: number, name: string) => [`${value.toFixed(2)} N`, name.toUpperCase()]}
            />
            <Legend
              wrapperStyle={{ 
                color: "var(--foreground)",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                textTransform: "uppercase",
              }}
            />
            <Line
              type="monotone"
              dataKey="thrust"
              name="Thrust"
              stroke="var(--primary)"
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
            <ReferenceLine y={0} stroke="var(--muted-foreground)" strokeDasharray="3 3" strokeOpacity={0.5} />
            {currentState && (
              <ReferenceLine
                x={currentState.time}
                stroke="var(--foreground)"
                strokeDasharray="3 3"
                strokeWidth={1}
                strokeOpacity={0.5}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-full items-center justify-center">
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            Awaiting simulation data
          </span>
        </div>
      )}
    </ChartWrapper>
  )
}
