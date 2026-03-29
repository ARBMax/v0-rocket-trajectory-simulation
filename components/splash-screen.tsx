"use client"

import { useEffect, useState, useRef } from "react"
import { Orbit } from "lucide-react"

const LOADING_MESSAGES = [
  { text: "OZONE LABS V1.0 — Initializing...", delay: 400 },
  { text: "Loading trajectory engine...", delay: 800 },
  { text: "Calibrating sensors...", delay: 1200 },
  { text: "Flight dynamics module ready", delay: 1600 },
  { text: "Telemetry subsystem online", delay: 2000 },
  { text: "All systems nominal", delay: 2400, success: true },
]

function SpaceCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animFrameId: number
    let t = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    // --- Star layers (3 depths) ---
    const makeStar = (seed: number, i: number) => {
      const s = (n: number) => { const x = Math.sin(n) * 43758.5453; return x - Math.floor(x) }
      return {
        x: s(seed + i * 7.13) * canvas.width,
        y: s(seed + i * 3.77) * canvas.height,
        r: s(seed + i * 5.91) * 1.4 + 0.2,
        twinkle: s(seed + i * 11.3) * Math.PI * 2,
        speed: s(seed + i * 2.61) * 0.4 + 0.05,
        layer: Math.floor(s(seed + i * 9.1) * 3),
      }
    }
    const STAR_COUNT = 280
    const stars = Array.from({ length: STAR_COUNT }, (_, i) => makeStar(1.618, i))

    // --- Shooting stars (pool of 3) ---
    type Shooter = { x: number; y: number; vx: number; vy: number; startT: number; active: boolean }
    const shooters: Shooter[] = Array.from({ length: 3 }, () => ({
      x: 0, y: 0, vx: 0, vy: 0, startT: -9999, active: false,
    }))

    const fireShooter = () => {
      const s = shooters.find(s => !s.active) ?? shooters[0]
      s.x = Math.random() * canvas.width * 0.6 + canvas.width * 0.05
      s.y = Math.random() * canvas.height * 0.35
      // angle: roughly 20-40 degrees downward to the right
      const angle = (Math.random() * 20 + 20) * (Math.PI / 180)
      const speed = 420 + Math.random() * 200   // px/s equivalent — scaled by t step
      s.vx = Math.cos(angle) * speed * 0.012
      s.vy = Math.sin(angle) * speed * 0.012
      s.startT = t
      s.active = true
    }
    const shootInterval = setInterval(fireShooter, 2000)
    // Stagger two initial shots so one fires right away, another at 1s
    fireShooter()
    setTimeout(fireShooter, 900)

    // --- Planet (bottom-right, slow parallax) ---
    const planet = { cx: 0.82, cy: 0.78, r: 90, hue: 195 }

    const draw = () => {
      t += 0.012
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Deep space background gradient
      const bg = ctx.createRadialGradient(
        canvas.width * 0.5, canvas.height * 0.4, 0,
        canvas.width * 0.5, canvas.height * 0.4, canvas.width * 0.9
      )
      bg.addColorStop(0, "#071420")
      bg.addColorStop(0.5, "#050d18")
      bg.addColorStop(1, "#020810")
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Nebula wisps (two large blobs)
      const nebula = (cx: number, cy: number, rx: number, ry: number, hue: number, alpha: number) => {
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx)
        g.addColorStop(0, `hsla(${hue},70%,45%,${alpha})`)
        g.addColorStop(0.5, `hsla(${hue + 20},60%,35%,${alpha * 0.4})`)
        g.addColorStop(1, `hsla(${hue + 40},50%,20%,0)`)
        ctx.save()
        ctx.scale(1, ry / rx)
        ctx.beginPath()
        ctx.arc(cx, cy * (rx / ry), rx, 0, Math.PI * 2)
        ctx.fillStyle = g
        ctx.fill()
        ctx.restore()
      }
      nebula(canvas.width * 0.18, canvas.height * 0.3, 340, 200, 200, 0.07)
      nebula(canvas.width * 0.75, canvas.height * 0.55, 280, 180, 260, 0.06)
      nebula(canvas.width * 0.5, canvas.height * 0.15, 220, 120, 180, 0.05)

      // Stars
      stars.forEach((s) => {
        const twinkle = 0.55 + 0.45 * Math.sin(t * 1.4 + s.twinkle)
        const px = (s.x + t * s.speed * (s.layer + 1) * 0.6) % canvas.width
        const py = s.y
        const brightness = s.layer === 2 ? 1 : s.layer === 1 ? 0.8 : 0.55
        const alpha = twinkle * brightness
        const radius = s.r * (s.layer === 2 ? 1.3 : 1)

        // Glow for brighter stars
        if (s.r > 1.0 && s.layer === 2) {
          const glow = ctx.createRadialGradient(px, py, 0, px, py, radius * 4)
          glow.addColorStop(0, `rgba(150,230,255,${alpha * 0.35})`)
          glow.addColorStop(1, "rgba(0,0,0,0)")
          ctx.beginPath()
          ctx.arc(px, py, radius * 4, 0, Math.PI * 2)
          ctx.fillStyle = glow
          ctx.fill()
        }

        ctx.beginPath()
        ctx.arc(px, py, radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200,235,255,${alpha})`
        ctx.fill()
      })

      // Shooting stars
      shooters.forEach((s) => {
        if (!s.active) return
        const dt = t - s.startT
        const dur = 1.6
        if (dt > dur) { s.active = false; return }

        const progress = dt / dur
        // Head position travels along vx/vy direction over time
        const steps = dt / 0.012
        const headX = s.x + s.vx * steps
        const headY = s.y + s.vy * steps

        // Tail length grows then shrinks
        const tailMult = Math.sin(progress * Math.PI)
        const tailLen = 180 * tailMult
        const tailX = headX - (s.vx / Math.hypot(s.vx, s.vy)) * tailLen
        const tailY = headY - (s.vy / Math.hypot(s.vx, s.vy)) * tailLen

        const alpha = Math.sin(progress * Math.PI)
        const grad = ctx.createLinearGradient(tailX, tailY, headX, headY)
        grad.addColorStop(0, `rgba(100,220,255,0)`)
        grad.addColorStop(0.4, `rgba(180,240,255,${alpha * 0.4})`)
        grad.addColorStop(0.8, `rgba(220,248,255,${alpha * 0.85})`)
        grad.addColorStop(1, `rgba(255,255,255,${alpha})`)

        ctx.beginPath()
        ctx.moveTo(tailX, tailY)
        ctx.lineTo(headX, headY)
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.8
        ctx.shadowColor = "rgba(120,230,255,0.9)"
        ctx.shadowBlur = 6
        ctx.stroke()
        ctx.shadowBlur = 0

        // Bright head dot
        const headGlow = ctx.createRadialGradient(headX, headY, 0, headX, headY, 8)
        headGlow.addColorStop(0, `rgba(255,255,255,${alpha})`)
        headGlow.addColorStop(0.4, `rgba(180,240,255,${alpha * 0.5})`)
        headGlow.addColorStop(1, `rgba(0,0,0,0)`)
        ctx.beginPath()
        ctx.arc(headX, headY, 8, 0, Math.PI * 2)
        ctx.fillStyle = headGlow
        ctx.fill()

        ctx.beginPath()
        ctx.arc(headX, headY, 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${alpha})`
        ctx.fill()
      })

      // Planet
      const px = canvas.width * planet.cx
      const py = canvas.height * planet.cy + Math.sin(t * 0.18) * 8
      const pr = planet.r

      // Planet atmosphere glow
      const atmGlow = ctx.createRadialGradient(px, py, pr * 0.8, px, py, pr * 1.6)
      atmGlow.addColorStop(0, `hsla(${planet.hue},80%,55%,0.18)`)
      atmGlow.addColorStop(1, `hsla(${planet.hue},70%,40%,0)`)
      ctx.beginPath()
      ctx.arc(px, py, pr * 1.6, 0, Math.PI * 2)
      ctx.fillStyle = atmGlow
      ctx.fill()

      // Planet body
      const planetGrad = ctx.createRadialGradient(px - pr * 0.3, py - pr * 0.3, pr * 0.1, px, py, pr)
      planetGrad.addColorStop(0, `hsla(${planet.hue},60%,55%,1)`)
      planetGrad.addColorStop(0.5, `hsla(${planet.hue + 15},55%,35%,1)`)
      planetGrad.addColorStop(1, `hsla(${planet.hue + 30},50%,12%,1)`)
      ctx.beginPath()
      ctx.arc(px, py, pr, 0, Math.PI * 2)
      ctx.fillStyle = planetGrad
      ctx.fill()

      // Planet surface bands
      ctx.save()
      ctx.beginPath()
      ctx.arc(px, py, pr, 0, Math.PI * 2)
      ctx.clip()
      for (let b = 0; b < 5; b++) {
        const by = py - pr + (b / 4) * pr * 2
        const bh = pr * 0.18
        ctx.beginPath()
        ctx.ellipse(px, by, pr, bh, 0, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${planet.hue + b * 8},50%,${25 + b * 5}%,0.25)`
        ctx.fill()
      }
      // Shadow side
      const shadow = ctx.createRadialGradient(px + pr * 0.5, py + pr * 0.3, 0, px + pr * 0.5, py, pr * 1.2)
      shadow.addColorStop(0, "rgba(0,0,0,0)")
      shadow.addColorStop(0.5, "rgba(0,0,0,0.3)")
      shadow.addColorStop(1, "rgba(0,0,0,0.75)")
      ctx.beginPath()
      ctx.arc(px, py, pr, 0, Math.PI * 2)
      ctx.fillStyle = shadow
      ctx.fill()
      ctx.restore()

      // Planet ring
      ctx.save()
      ctx.translate(px, py)
      ctx.scale(1, 0.28)
      const ringGrad = ctx.createRadialGradient(0, 0, pr * 1.1, 0, 0, pr * 1.8)
      ringGrad.addColorStop(0, `hsla(${planet.hue},60%,70%,0.55)`)
      ringGrad.addColorStop(0.5, `hsla(${planet.hue},50%,55%,0.3)`)
      ringGrad.addColorStop(1, `hsla(${planet.hue},40%,40%,0)`)
      ctx.beginPath()
      ctx.arc(0, 0, pr * 1.8, 0, Math.PI * 2)
      ctx.arc(0, 0, pr * 1.05, 0, Math.PI * 2, true)
      ctx.fillStyle = ringGrad
      ctx.fill()
      ctx.restore()

      // Scan-line overlay (subtle)
      ctx.fillStyle = "rgba(0,30,50,0.03)"
      for (let y = 0; y < canvas.height; y += 4) {
        ctx.fillRect(0, y, canvas.width, 2)
      }

      animFrameId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animFrameId)
      clearInterval(shootInterval)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  )
}

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"init" | "loading" | "fadeout">("init")
  const [visibleMessages, setVisibleMessages] = useState<number>(0)
  const [progress, setProgress] = useState(0)
  const onCompleteRef = useRef(onComplete)
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    timers.push(setTimeout(() => setPhase("loading"), 300))
    LOADING_MESSAGES.forEach((msg, index) => {
      timers.push(setTimeout(() => {
        setVisibleMessages(index + 1)
        setProgress(((index + 1) / LOADING_MESSAGES.length) * 100)
      }, msg.delay))
    })
    timers.push(setTimeout(() => setPhase("fadeout"), 3000))
    timers.push(setTimeout(() => onCompleteRef.current(), 3600))
    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden transition-opacity duration-600 ${
        phase === "fadeout" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{ background: "#050d18" }}
    >
      {/* Animated space canvas */}
      <SpaceCanvas />

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(2,8,16,0.85) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Orbital Logo */}
        <div
          className={`relative transition-all duration-700 ease-out ${
            phase === "init" ? "scale-50 opacity-0" : "scale-100 opacity-100"
          }`}
        >
          <div className="relative h-28 w-28">
            {/* Glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-24 w-24 rounded-full bg-primary/25 blur-2xl" />
            </div>
            {/* Outer dashed ring */}
            <svg
              className="absolute inset-0 h-full w-full animate-spin"
              style={{ animationDuration: "10s" }}
              viewBox="0 0 100 100"
            >
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor"
                strokeWidth="0.8" className="text-primary/50" strokeDasharray="6 3" />
            </svg>
            {/* Inner ring */}
            <svg
              className="absolute inset-0 h-full w-full animate-spin"
              style={{ animationDuration: "6s", animationDirection: "reverse" }}
              viewBox="0 0 100 100"
            >
              <circle cx="50" cy="50" r="36" fill="none" stroke="currentColor"
                strokeWidth="0.6" className="text-primary/25" strokeDasharray="3 6" />
            </svg>
            {/* Orbiting dots */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: "4s" }}>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full bg-primary shadow-lg shadow-primary/80" />
            </div>
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: "4s", animationDelay: "-1.3s" }}>
              <div className="absolute top-1/2 right-0 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary/70" />
            </div>
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: "4s", animationDelay: "-2.6s" }}>
              <div className="absolute bottom-1 left-3 h-1.5 w-1.5 rounded-full bg-primary/60" />
            </div>
            {/* Center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full"
                style={{ background: "rgba(5,20,35,0.9)", border: "1px solid rgba(0,210,200,0.35)" }}>
                <Orbit className="h-7 w-7 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <div
          className={`flex flex-col items-center gap-2 transition-all duration-500 delay-100 ${
            phase === "init" ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
          }`}
        >
          <h1 className="text-3xl font-mono font-bold tracking-[0.35em] text-primary uppercase"
            style={{ textShadow: "0 0 30px rgba(0,210,200,0.5)" }}>
            Ozone Labs
          </h1>
          <p className="text-xs text-muted-foreground tracking-[0.25em] uppercase font-mono">
            Trajectory Simulation &amp; Flight Dynamics
          </p>
        </div>

        {/* Terminal Console */}
        <div
          className={`w-80 sm:w-96 transition-all duration-500 delay-200 ${
            phase === "init" ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
          }`}
        >
          <div className="rounded font-mono text-xs"
            style={{ background: "rgba(5,18,30,0.85)", border: "1px solid rgba(0,210,200,0.18)", padding: "1rem" }}>
            <div className="space-y-1 min-h-[120px]">
              {LOADING_MESSAGES.slice(0, visibleMessages).map((msg, index) => (
                <div key={index}
                  className={`flex items-start gap-2 ${msg.success ? "text-green-400" : "text-muted-foreground"}`}>
                  <span className="text-primary shrink-0">{"> "}</span>
                  <span>{msg.text}{msg.success && " ✓"}</span>
                </div>
              ))}
              {visibleMessages < LOADING_MESSAGES.length && (
                <div className="flex items-center gap-2 text-primary">
                  <span>{"> "}</span>
                  <span className="inline-block w-2 h-4 bg-primary animate-pulse" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div
          className={`w-80 sm:w-96 transition-all duration-500 delay-300 ${
            phase === "init" ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="h-px w-full overflow-hidden" style={{ background: "rgba(0,210,200,0.15)" }}>
            <div
              className="h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%`, background: "rgba(0,210,200,1)", boxShadow: "0 0 8px rgba(0,210,200,0.8)" }}
            />
          </div>
          <div className="mt-1.5 flex justify-between font-mono text-[9px] text-muted-foreground tracking-widest">
            <span>SYSTEM BOOT</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
