'use client'

import { useState, useEffect, useRef } from 'react'
import './Cursor.css'

export default function SmoothFollower() {
  const mouse = useRef({ x: 0, y: 0 })
  const dot = useRef({ x: 0, y: 0 })
  const ring = useRef({ x: 0, y: 0 })
  const rafId = useRef(null)

  const [pos, setPos] = useState({ dot: { x: 0, y: 0 }, ring: { x: 0, y: 0 } })
  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    const onMove = (e) => {
      mouse.current.x = e.clientX
      mouse.current.y = e.clientY
    }

    const onEnter = () => setHovering(true)
    const onLeave = () => setHovering(false)

    window.addEventListener('mousemove', onMove)

    const elements = document.querySelectorAll('a, button, input, textarea, select, .card-wrapper')
    elements.forEach(el => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })

    const lerp = (a, b, t) => a + (b - a) * t

    const loop = () => {
      dot.current.x = lerp(dot.current.x, mouse.current.x, 0.25)
      dot.current.y = lerp(dot.current.y, mouse.current.y, 0.25)

      ring.current.x = lerp(ring.current.x, mouse.current.x, 0.1)
      ring.current.y = lerp(ring.current.y, mouse.current.y, 0.1)

      setPos({
        dot: { x: dot.current.x, y: dot.current.y },
        ring: { x: ring.current.x, y: ring.current.y },
      })

      rafId.current = requestAnimationFrame(loop)
    }

    rafId.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', onMove)
      elements.forEach(el => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
      })
      cancelAnimationFrame(rafId.current)
    }
  }, [])

  return (
    <div className="cursor-container">
      <div
        className="cursor-dot"
        style={{
          left: `${pos.dot.x}px`,
          top: `${pos.dot.y}px`,
        }}
      />
      <div
        className={`cursor-ring ${hovering ? 'hover' : ''}`}
        style={{
          left: `${pos.ring.x}px`,
          top: `${pos.ring.y}px`,
        }}
      />
    </div>
  )
}
