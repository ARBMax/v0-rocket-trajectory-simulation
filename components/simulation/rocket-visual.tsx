"use client"

import { SimulationState, SimulationResult } from "@/lib/rocket-physics"
import { useMemo } from "react"

interface RocketVisualProps {
  currentState: SimulationState | null
  result: SimulationResult | null
}

const STARS = [
  { left: 5, top: 3, size: 1.5, opacity: 0.7 }, { left: 12, top: 8, size: 1, opacity: 0.5 },
  { left: 18, top: 15, size: 2, opacity: 0.8 }, { left: 25, top: 5, size: 1, opacity: 0.4 },
  { left: 32, top: 22, size: 1.5, opacity: 0.6 }, { left: 40, top: 12, size: 1, opacity: 0.5 },
  { left: 48, top: 28, size: 2, opacity: 0.7 }, { left: 55, top: 8, size: 1, opacity: 0.4 },
  { left: 62, top: 35, size: 1.5, opacity: 0.6 }, { left: 70, top: 18, size: 1, opacity: 0.5 },
  { left: 78, top: 42, size: 2, opacity: 0.8 }, { left: 85, top: 10, size: 1, opacity: 0.4 },
  { left: 92, top: 25, size: 1.5, opacity: 0.6 }, { left: 8, top: 45, size: 1, opacity: 0.5 },
  { left: 15, top: 52, size: 2, opacity: 0.7 }, { left: 22, top: 38, size: 1, opacity: 0.4 },
  { left: 30, top: 58, size: 1.5, opacity: 0.6 }, { left: 38, top: 48, size: 1, opacity: 0.5 },
  { left: 45, top: 62, size: 2, opacity: 0.8 }, { left: 52, top: 42, size: 1, opacity: 0.4 },
  { left: 60, top: 55, size: 1.5, opacity: 0.6 }, { left: 68, top: 65, size: 1, opacity: 0.5 },
  { left: 75, top: 50, size: 2, opacity: 0.7 }, { left: 82, top: 58, size: 1, opacity: 0.4 },
  { left: 90, top: 45, size: 1.5, opacity: 0.6 }, { left: 3, top: 62, size: 1, opacity: 0.5 },
  { left: 10, top: 68, size: 2, opacity: 0.8 }, { left: 17, top: 55, size: 1, opacity: 0.4 },
  { left: 95, top: 15, size: 1.5, opacity: 0.7 }, { left: 88, top: 32, size: 1, opacity: 0.5 },
  { left: 2, top: 20, size: 1.5, opacity: 0.6 }, { left: 97, top: 55, size: 1, opacity: 0.4 },
  { left: 35, top: 10, size: 2, opacity: 0.7 }, { left: 65, top: 5, size: 1.5, opacity: 0.5 },
  { left: 50, top: 20, size: 1, opacity: 0.6 }, { left: 28, top: 68, size: 1.5, opacity: 0.4 },
]

function formatHeight(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(2)} km`
  return `${value.toFixed(0)} m`
}

export function RocketVisual({ currentState, result }: RocketVisualProps) {
  const maxHeight = result?.maxHeight ?? 1000

  const rocketPosition = useMemo(() => {
    if (!currentState || maxHeight === 0) return 0
    return Math.min(100, (currentState.height / maxHeight) * 100)
  }, [currentState, maxHeight])

  const isThrusting = !!(currentState?.thrust && currentState.thrust > 0)
  const isDescending = !!(currentState && currentState.velocity < 0)
  const phase = currentState?.phase ?? "idle"

  const phaseColor: Record<string, string> = {
    powered:    "#00e5ff",
    coasting:   "#69ff74",
    descending: "#ff4757",
    landed:     "#ffd32a",
    idle:       "#546e7a",
  }
  const pColor = phaseColor[phase] ?? "#546e7a"

  // rocket Y: goes from bottom-64px to bottom-80% of panel height
  const bottomPx = 64 + (rocketPosition / 100) * 380

  return (
    <div className="relative w-full min-h-[480px] h-full rounded-sm overflow-hidden border border-border bg-black">

      {/* Deep space gradient */}
      <div
        className="absolute inset-0 transition-colors duration-1000"
        style={{
          background: `radial-gradient(ellipse at 50% 100%, rgba(0,60,80,${0.3 + rocketPosition * 0.003}) 0%, transparent 70%),
                       linear-gradient(to bottom, #000005 0%, #00050f 50%, #000c18 100%)`,
        }}
      />

      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {STARS.map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              background: `rgba(255,255,255,${s.opacity})`,
              boxShadow: s.size > 1.5 ? `0 0 ${s.size * 3}px rgba(180,220,255,0.6)` : "none",
              animation: `twinkle ${2 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${(i % 5) * 0.4}s`,
            }}
          />
        ))}
      </div>

      {/* Altitude scale ticks */}
      <div className="absolute right-3 top-4 bottom-24 flex flex-col justify-between pointer-events-none z-10">
        {[100, 80, 60, 40, 20, 0].map((pct) => (
          <div key={pct} className="flex items-center gap-1.5">
            <div className="h-px w-4 bg-white/15" />
            <span className="font-mono text-[9px] text-white/35">{formatHeight((pct / 100) * maxHeight)}</span>
          </div>
        ))}
      </div>

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-16 z-20">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, #0a0d10 0%, #0f1419 55%, transparent 100%)",
          }}
        />
        {/* Launch pad base */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-4 rounded-t-sm"
          style={{ background: "linear-gradient(to top, #1c2128, #2d3748)" }} />
        {/* Pad surface lines */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-px bg-white/10" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-1 h-10"
          style={{ background: "linear-gradient(to top, #263040, transparent)" }} />
        {/* Support arms */}
        {[-20, 20].map((offset) => (
          <div
            key={offset}
            className="absolute bottom-4 h-12 w-px"
            style={{
              left: `calc(50% + ${offset}px)`,
              background: "linear-gradient(to top, #2d3748, transparent)",
            }}
          />
        ))}
        {/* Cross arms */}
        {[6, 10].map((h) => (
          <div
            key={h}
            className="absolute left-1/2 -translate-x-1/2 h-px w-10 bg-white/10"
            style={{ bottom: `${h * 4}px` }}
          />
        ))}
      </div>

      {/* ── ROCKET ── */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-30 transition-[bottom] duration-75 ease-linear"
        style={{ bottom: `${bottomPx}px` }}
      >
        <svg
          width="60"
          height="160"
          viewBox="0 0 60 160"
          className="overflow-visible"
          style={{
            transform: isDescending ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.6s ease",
            filter: isThrusting
              ? "drop-shadow(0 0 18px rgba(0,229,255,0.25)) drop-shadow(0 6px 24px rgba(255,120,30,0.5))"
              : "drop-shadow(0 0 10px rgba(0,229,255,0.12))",
          }}
        >
          <defs>
            {/* Fairing / upper body */}
            <linearGradient id="rv-fairing" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#101820" />
              <stop offset="18%"  stopColor="#1e2d40" />
              <stop offset="40%"  stopColor="#c8d8e8" />
              <stop offset="50%"  stopColor="#e8f4ff" />
              <stop offset="62%"  stopColor="#b0c8d8" />
              <stop offset="82%"  stopColor="#1e2d40" />
              <stop offset="100%" stopColor="#101820" />
            </linearGradient>

            {/* First stage body */}
            <linearGradient id="rv-stage1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#0d1520" />
              <stop offset="12%"  stopColor="#182535" />
              <stop offset="35%"  stopColor="#a0b8c8" />
              <stop offset="50%"  stopColor="#d0e4f0" />
              <stop offset="65%"  stopColor="#8098a8" />
              <stop offset="88%"  stopColor="#182535" />
              <stop offset="100%" stopColor="#0d1520" />
            </linearGradient>

            {/* Interstage band */}
            <linearGradient id="rv-band" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#080e14" />
              <stop offset="40%"  stopColor="#1a2840" />
              <stop offset="50%"  stopColor="#243550" />
              <stop offset="60%"  stopColor="#1a2840" />
              <stop offset="100%" stopColor="#080e14" />
            </linearGradient>

            {/* Fins */}
            <linearGradient id="rv-fin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#1e2d3d" />
              <stop offset="50%"  stopColor="#0d1a28" />
              <stop offset="100%" stopColor="#060e18" />
            </linearGradient>

            {/* Thrust puck */}
            <linearGradient id="rv-puck" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#080c10" />
              <stop offset="45%"  stopColor="#2a3848" />
              <stop offset="50%"  stopColor="#3a4858" />
              <stop offset="55%"  stopColor="#2a3848" />
              <stop offset="100%" stopColor="#080c10" />
            </linearGradient>

            {/* Engine bell */}
            <linearGradient id="rv-bell" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#060a0d" />
              <stop offset="30%"  stopColor="#1a2530" />
              <stop offset="50%"  stopColor="#253540" />
              <stop offset="70%"  stopColor="#1a2530" />
              <stop offset="100%" stopColor="#060a0d" />
            </linearGradient>

            {/* Porthole window */}
            <radialGradient id="rv-window" cx="35%" cy="35%" r="65%">
              <stop offset="0%"   stopColor="#a8e4f8" />
              <stop offset="45%"  stopColor="#2a7090" />
              <stop offset="100%" stopColor="#0a2030" />
            </radialGradient>

            {/* Cyan stripe */}
            <linearGradient id="rv-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="transparent" />
              <stop offset="20%"  stopColor="#00b8d4" />
              <stop offset="50%"  stopColor="#00e5ff" />
              <stop offset="80%"  stopColor="#00b8d4" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>

            {/* Flame outer */}
            <radialGradient id="rv-f-outer" cx="50%" cy="5%" r="95%">
              <stop offset="0%"   stopColor="#ff8c00" stopOpacity="0.9" />
              <stop offset="35%"  stopColor="#ff4500" stopOpacity="0.8" />
              <stop offset="70%"  stopColor="#cc1100" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#550000" stopOpacity="0" />
            </radialGradient>
            {/* Flame mid */}
            <radialGradient id="rv-f-mid" cx="50%" cy="5%" r="80%">
              <stop offset="0%"   stopColor="#ffc200" />
              <stop offset="50%"  stopColor="#ff6600" />
              <stop offset="100%" stopColor="#ff2200" stopOpacity="0" />
            </radialGradient>
            {/* Flame inner */}
            <radialGradient id="rv-f-core" cx="50%" cy="20%" r="60%">
              <stop offset="0%"   stopColor="#ffffff" />
              <stop offset="25%"  stopColor="#ffffc0" />
              <stop offset="60%"  stopColor="#ffcc00" />
              <stop offset="100%" stopColor="#ff8800" stopOpacity="0.5" />
            </radialGradient>
            {/* Engine ambient glow */}
            <radialGradient id="rv-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#ff6030" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#ff6030" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="rv-exhaust-glow" cx="50%" cy="0%" r="100%">
              <stop offset="0%"   stopColor="#00e5ff" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* === PLUME / FLAME === */}
          {isThrusting && (
            <g>
              {/* ambient engine glow circle */}
              <ellipse cx="30" cy="148" rx="16" ry="8" fill="url(#rv-glow)" />
              {/* outer plume */}
              <ellipse cx="30" cy="160" rx="13" ry="26" fill="url(#rv-f-outer)">
                <animate attributeName="ry" values="26;32;22;28;26" dur="0.18s" repeatCount="indefinite" />
                <animate attributeName="rx" values="13;15;11;14;13" dur="0.14s" repeatCount="indefinite" />
              </ellipse>
              {/* mid plume */}
              <ellipse cx="30" cy="157" rx="9" ry="20" fill="url(#rv-f-mid)">
                <animate attributeName="ry" values="20;24;17;22;20" dur="0.12s" repeatCount="indefinite" />
              </ellipse>
              {/* inner core */}
              <ellipse cx="30" cy="153" rx="5" ry="14" fill="url(#rv-f-core)">
                <animate attributeName="ry" values="14;16;12;15;14" dur="0.09s" repeatCount="indefinite" />
              </ellipse>
              {/* white hot center */}
              <ellipse cx="30" cy="150" rx="2.5" ry="7" fill="white" opacity="0.95">
                <animate attributeName="ry" values="7;9;6;8;7" dur="0.07s" repeatCount="indefinite" />
              </ellipse>
            </g>
          )}

          {/* === GRID FINS (folded flat when ascending, extended icon when descending) === */}
          {/* Left grid fin */}
          <g opacity={isDescending ? 1 : 0.55}>
            <rect x="5" y="88" width="10" height="14" rx="1" fill="url(#rv-fin)" stroke="#0d1e2e" strokeWidth="0.4" />
            <line x1="5" y1="91" x2="15" y2="91" stroke="#1a3040" strokeWidth="0.5"/>
            <line x1="5" y1="95" x2="15" y2="95" stroke="#1a3040" strokeWidth="0.5"/>
            <line x1="5" y1="99" x2="15" y2="99" stroke="#1a3040" strokeWidth="0.5"/>
            <line x1="8"  y1="88" x2="8"  y2="102" stroke="#1a3040" strokeWidth="0.5"/>
            <line x1="12" y1="88" x2="12" y2="102" stroke="#1a3040" strokeWidth="0.5"/>
          </g>
          {/* Right grid fin */}
          <g opacity={isDescending ? 1 : 0.55}>
            <rect x="45" y="88" width="10" height="14" rx="1" fill="url(#rv-fin)" stroke="#0d1e2e" strokeWidth="0.4" />
            <line x1="45" y1="91" x2="55" y2="91" stroke="#1a3040" strokeWidth="0.5"/>
            <line x1="45" y1="95" x2="55" y2="95" stroke="#1a3040" strokeWidth="0.5"/>
            <line x1="45" y1="99" x2="55" y2="99" stroke="#1a3040" strokeWidth="0.5"/>
            <line x1="48" y1="88" x2="48" y2="102" stroke="#1a3040" strokeWidth="0.5"/>
            <line x1="52" y1="88" x2="52" y2="102" stroke="#1a3040" strokeWidth="0.5"/>
          </g>

          {/* === LANDING LEGS (deployed only when descending/landing) === */}
          {isDescending && (
            <g>
              <path d="M19 142 L8 158" stroke="#1e2d3d" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M41 142 L52 158" stroke="#1e2d3d" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M8 158 L14 158" stroke="#2a3d50" strokeWidth="2" strokeLinecap="round"/>
              <path d="M46 158 L52 158" stroke="#2a3d50" strokeWidth="2" strokeLinecap="round"/>
            </g>
          )}

          {/* === BOOSTER FINS (lower stage) === */}
          {/* Left */}
          <path d="M19 130 L7 152 L13 152 L19 138 Z" fill="url(#rv-fin)" stroke="#0a1520" strokeWidth="0.5" />
          <path d="M19 132 L10 148 L12 148 L19 136 Z" fill="rgba(255,255,255,0.05)" />
          {/* Right */}
          <path d="M41 130 L53 152 L47 152 L41 138 Z" fill="url(#rv-fin)" stroke="#0a1520" strokeWidth="0.5" />
          <path d="M41 132 L50 148 L48 148 L41 136 Z" fill="rgba(255,255,255,0.05)" />

          {/* === ENGINE CLUSTER / THRUST PUCK === */}
          <rect x="15" y="138" width="30" height="8" rx="2" fill="url(#rv-puck)" />
          {/* 3 engine bell nozzles */}
          {[20, 30, 40].map((cx) => (
            <g key={cx}>
              <path
                d={`M${cx - 4} 146 L${cx - 5.5} 154 L${cx + 5.5} 154 L${cx + 4} 146 Z`}
                fill="url(#rv-bell)"
                stroke="#050a0f"
                strokeWidth="0.4"
              />
              <ellipse cx={cx} cy="154" rx="5.5" ry="1.5" fill="#040810" />
              {isThrusting && (
                <ellipse cx={cx} cy="154" rx="4" ry="1.2" fill="#ff6030" opacity="0.7">
                  <animate attributeName="opacity" values="0.7;1;0.5;0.9;0.7" dur="0.1s" repeatCount="indefinite" />
                </ellipse>
              )}
            </g>
          ))}

          {/* === FIRST STAGE BODY === */}
          <rect x="19" y="80" width="22" height="60" fill="url(#rv-stage1)" />
          {/* Panel seams */}
          {[96, 110, 124].map((y) => (
            <line key={y} x1="19" y1={y} x2="41" y2={y} stroke="#0d1a25" strokeWidth="0.6" />
          ))}
          {/* Body center line */}
          <line x1="30" y1="80" x2="30" y2="138" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          {/* Edge light left */}
          <rect x="19" y="80" width="1.5" height="60" fill="rgba(255,255,255,0.08)" />
          {/* Edge shadow right */}
          <rect x="39.5" y="80" width="1.5" height="60" fill="rgba(0,0,0,0.35)" />

          {/* OZONE LABS logo text on stage 1 */}
          <text x="30" y="115" textAnchor="middle" fontSize="3.5" fill="rgba(0,229,255,0.55)" fontFamily="monospace" letterSpacing="0.8">OZONE</text>
          <text x="30" y="120" textAnchor="middle" fontSize="3.5" fill="rgba(0,229,255,0.55)" fontFamily="monospace" letterSpacing="0.8">LABS</text>

          {/* === INTERSTAGE BAND === */}
          <rect x="17" y="75" width="26" height="7" rx="0.5" fill="url(#rv-band)" />
          {/* Cyan accent stripe */}
          <rect x="17" y="77.5" width="26" height="1" fill="url(#rv-cyan)" opacity="0.7" />
          <rect x="17" y="79.5" width="26" height="0.5" fill="url(#rv-cyan)" opacity="0.35" />

          {/* === SECOND STAGE / FAIRING BODY === */}
          <rect x="19" y="38" width="22" height="39" fill="url(#rv-fairing)" />
          {/* Panel seams */}
          {[52, 63].map((y) => (
            <line key={y} x1="19" y1={y} x2="41" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          ))}
          {/* Highlight left */}
          <rect x="19" y="38" width="1.5" height="39" fill="rgba(255,255,255,0.07)" />
          {/* Shadow right */}
          <rect x="39.5" y="38" width="1.5" height="39" fill="rgba(0,0,0,0.28)" />

          {/* Stage 2 cyan stripe */}
          <rect x="19" y="54" width="22" height="1" fill="url(#rv-cyan)" opacity="0.5" />

          {/* === NOSE CONE / FAIRING === */}
          {/* Main cone shape */}
          <path
            d="M30 3 C26 10 20 22 19 38 L41 38 C40 22 34 10 30 3 Z"
            fill="url(#rv-fairing)"
          />
          {/* Nose cone highlight */}
          <path
            d="M30 5 C27 11 22 22 20.5 37 L23 37 C24 24 28 12 30 7 Z"
            fill="rgba(255,255,255,0.12)"
          />
          {/* Tip */}
          <circle cx="30" cy="4" r="1.5" fill="#c8d8e8" />

          {/* Nose taper seam lines */}
          <path d="M30 3 L19 38" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          <path d="M30 3 L41 38" stroke="rgba(0,0,0,0.2)" strokeWidth="0.5" />

          {/* === PORTHOLE WINDOW === */}
          <circle cx="30" cy="47" r="4.5" fill="#060f18" />
          <circle cx="30" cy="47" r="3.8" fill="url(#rv-window)" />
          <circle cx="30" cy="47" r="3.8" fill="none" stroke="rgba(0,229,255,0.35)" strokeWidth="0.6" />
          {/* Window reflection glint */}
          <ellipse cx="28.5" cy="45.5" rx="1.5" ry="1" fill="rgba(255,255,255,0.45)" />
          <circle cx="31" cy="48.5" r="0.6" fill="rgba(255,255,255,0.15)" />

          {/* === CYAN ACCENT RING at fairing base === */}
          <rect x="19" y="37" width="22" height="1.5" fill="url(#rv-cyan)" opacity="0.8" />

          {/* === ATTITUDE THRUSTERS (small nubs on interstage) === */}
          {[[-3, 73], [3, 73]].map(([dx, y], i) => (
            <rect key={i} x={30 + dx - 1} y={y} width="2" height="3" rx="0.5" fill="#101c28" />
          ))}

        </svg>

        {/* Exhaust smoke cloud when thrusting */}
        {isThrusting && (
          <div className="absolute top-[148px] left-1/2 -translate-x-1/2 pointer-events-none">
            {[0,1,2,3,4,5].map((i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${14 + i * 8}px`,
                  height: `${14 + i * 8}px`,
                  background: `radial-gradient(circle, rgba(160,170,180,${0.25 - i * 0.035}) 0%, transparent 70%)`,
                  top: `${i * 22}px`,
                  left: `${-(7 + i * 4)}px`,
                  animation: `smoke 1s ease-out infinite`,
                  animationDelay: `${i * 120}ms`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* HUD — top left telemetry */}
      <div className="absolute top-3 left-3 z-40 rounded-sm bg-black/70 backdrop-blur-sm border border-white/8 p-3 min-w-[130px]">
        <div className="text-[9px] font-mono uppercase tracking-[0.18em] text-white/40 mb-0.5">Altitude</div>
        <div className="text-2xl font-bold font-mono text-white leading-none">
          {currentState ? formatHeight(currentState.height) : "0 m"}
        </div>
        <div className="mt-2 flex items-center gap-3">
          <div>
            <div className="text-[9px] font-mono uppercase tracking-wider text-white/40">Vel</div>
            <div className="text-xs font-mono text-white/80">
              {currentState ? `${Math.abs(currentState.velocity).toFixed(1)} m/s` : "—"}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-mono uppercase tracking-wider text-white/40">Acc</div>
            <div className="text-xs font-mono text-white/80">
              {currentState ? `${currentState.acceleration.toFixed(1)} m/s²` : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Flight phase badge */}
      <div
        className="absolute bottom-20 left-3 z-40 rounded-sm px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.15em] border backdrop-blur-sm"
        style={{
          color: pColor,
          borderColor: `${pColor}55`,
          backgroundColor: `${pColor}18`,
        }}
      >
        <span
          className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle"
          style={{ background: pColor, boxShadow: `0 0 6px ${pColor}` }}
        />
        {phase}
      </div>

      {/* CSS keyframes */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 1; }
        }
        @keyframes smoke {
          0%   { opacity: 0.5; transform: translateY(0) scale(1); }
          100% { opacity: 0;   transform: translateY(50px) scale(2.2); }
        }
      `}</style>
    </div>
  )
}
