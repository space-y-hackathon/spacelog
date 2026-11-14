import { useEffect, useRef } from 'react'

const STAR_COLORS = ['#ffffff', '#ffffff', '#cdeaff', '#8cd8ff', '#fff2d6']

export default function Starfield() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let width = 0
    let height = 0
    let animationId = 0
    let stars = []
    let shootingStars = []
    let nextShootTime = performance.now() + 2000

    const initStars = () => {
      const count = Math.min(160, Math.max(85, Math.floor((width * height) / 11000)))
      stars = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() < 0.14 ? 1.65 : Math.random() * 0.9 + 0.45,
        baseAlpha: Math.random() * 0.45 + 0.25,
        twinkleSpeed: Math.random() * 0.002 + 0.0007,
        phase: Math.random() * Math.PI * 2,
        color: STAR_COLORS[i % STAR_COLORS.length],
        glow: Math.random() < 0.14,
      }))
    }

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = parent.clientWidth
      height = parent.clientHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      initStars()
    }

    const spawnShootingStar = () => {
      const fromRight = Math.random() > 0.35
      const startX = fromRight
        ? width * (0.45 + Math.random() * 0.52)
        : width * (0.1 + Math.random() * 0.45)
      const startY = Math.random() * (height * 0.35)
      const angle = fromRight
        ? Math.PI * (0.72 + Math.random() * 0.1)
        : Math.PI * (0.2 + Math.random() * 0.1)

      // Kecepatan diperlambat (sebelumnya 7 - 11.5)
      const speed = 3.0 + Math.random() * 1.6

      shootingStars.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: 85 + Math.random() * 65,
        life: 0,
        // Durasi hidup diperpanjang agar jarak tempuhnya tetap jauh meski pelan
        maxLife: 105 + Math.random() * 40,
      })
    }

    const render = (now) => {
      ctx.clearRect(0, 0, width, height)

      // 1. Bintang diam + kelap-kelip halus
      for (const star of stars) {
        const wave = reducedMotion ? 0.5 : (Math.sin(now * star.twinkleSpeed + star.phase) + 1) * 0.5
        const alpha = Math.min(1, star.baseAlpha + wave * 0.55)

        ctx.save()
        ctx.globalAlpha = alpha
        ctx.fillStyle = star.color
        if (star.glow) {
          ctx.shadowBlur = 7
          ctx.shadowColor = star.color
        }
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // 2. Komet / shooting stars melintas pelan
      if (!reducedMotion) {
        if (now >= nextShootTime) {
          spawnShootingStar()
          nextShootTime = now + 3800 + Math.random() * 4500
        }

        shootingStars = shootingStars.filter((s) => s.life < s.maxLife)

        for (const s of shootingStars) {
          s.x += s.vx
          s.y += s.vy
          s.life += 1

          const progress = s.life / s.maxLife
          const fade = Math.sin(progress * Math.PI)
          const speedMag = Math.hypot(s.vx, s.vy)
          const tailX = s.x - (s.vx / speedMag) * s.length
          const tailY = s.y - (s.vy / speedMag) * s.length

          const gradient = ctx.createLinearGradient(s.x, s.y, tailX, tailY)
          gradient.addColorStop(0, `rgba(225, 246, 255, ${0.88 * fade})`)
          gradient.addColorStop(0.35, `rgba(103, 212, 246, ${0.38 * fade})`)
          gradient.addColorStop(1, 'rgba(103, 212, 246, 0)')

          ctx.save()
          ctx.strokeStyle = gradient
          ctx.lineWidth = 1.5
          ctx.lineCap = 'round'
          ctx.beginPath()
          ctx.moveTo(s.x, s.y)
          ctx.lineTo(tailX, tailY)
          ctx.stroke()

          ctx.fillStyle = `rgba(255, 255, 255, ${0.95 * fade})`
          ctx.shadowBlur = 8
          ctx.shadowColor = '#7dd3fc'
          ctx.beginPath()
          ctx.arc(s.x, s.y, 1.4, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
      }

      animationId = window.requestAnimationFrame(render)
    }

    resize()
    animationId = window.requestAnimationFrame(render)
    window.addEventListener('resize', resize)

    return () => {
      window.cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="starfield-canvas" aria-hidden="true" />
}