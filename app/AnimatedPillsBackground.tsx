"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";

interface AnimatedPillsBackgroundProps {
  duration?: number;
  /**
  * Pill color — MUST be in `rgba(r, g, b, 1)` format.
  * The component substitutes the alpha channel at render time.
  * Example: "rgba(255, 222, 89, 1)"
  *
  * Bug in original: default was "#a8c5ec" (hex), which doesn't
  * contain the string "1)" so the replace() was a no-op and pills
  * rendered as transparent. Default is now correct rgba.
  */
  color?: string;
  /** Canvas background fill. Default: "#f5f5f5" */
  backgroundColor?: string;
  style?: CSSProperties;
}

export default function AnimatedPillsBackground({
  duration = 5000,
  color = "rgba(168, 197, 236, 1)",
  backgroundColor = "#f5f5f5",
  style,
}: AnimatedPillsBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pillsRef  = useRef<{ baseHeight: number; delay: number }[]>([]);
  const startRef  = useRef<number | null>(null);
  const parallaxRef = useRef(0);
  
  /**
  * Color/bg are tracked in refs so they update without restarting
  * the animation loop (which would cause visible stutters on filter change).
  */
  const colorRef = useRef(color);
  const bgRef    = useRef(backgroundColor);
  
  const [rows,    setRows]    = useState(12);
  const [columns, setColumns] = useState(12);
  
  // Keep refs in sync with props each render
  colorRef.current = color;
  bgRef.current    = backgroundColor;
  
  // ── Viewport-responsive grid ──────────────────────────────────────────────
  useEffect(() => {
    const handle = () => {
      const w = window.innerWidth;
      setRows(w < 768 ? 10 : 12);
      setColumns(w < 768 ? 6 : w < 1024 ? 8 : 12);
    };
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);
  
  // ── Build pill data whenever the grid changes ─────────────────────────────
  useEffect(() => {
    pillsRef.current = Array.from({ length: rows * columns }, () => ({
      baseHeight: 1 + Math.random() * 12,
      delay: Math.random() * Math.PI * 2,
    }));
  }, [rows, columns]);
  
  // ── Parallax ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const handle = () => { parallaxRef.current = window.scrollY * 0.25; };
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);
  
  // ── Animation loop ────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    
    let raf: number;
    
    const draw = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      
      const progress = (ts - startRef.current) / duration;
      // Global "breath" — sin wave for the overall animation cycle
      const t = (Math.sin(progress * Math.PI * 2) + 1) / 2;
      
      const pills  = pillsRef.current;
      const c      = colorRef.current;
      const bg     = bgRef.current;
      
      // Update canvas background inline (no flicker since we clear anyway)
      canvas.style.backgroundColor = bg;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const cw = canvas.width  / columns;
      const ch = canvas.height / rows;
      // Pill width scales with cell width; keep it slim
      const pillWidth = Math.max(4, cw * 0.250);
      
      let i = 0;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          const pill = pills[i++];
          if (!pill) continue;
          
          const wave       = Math.sin(t * Math.PI * 2 + pill.delay);
          const normalized = (wave + 1) / 2;            // 0→1
          const h          = pill.baseHeight + normalized * 18;
          const opacity    = 0.07 + normalized * 0.38;  // 0.08 – 0.46
          
          // Stagger adjacent rows/cols for an organic grid feel
          let cx = col * cw + cw / 2;
          let cy = row * ch + ch / 2 + parallaxRef.current * (row * 0.03);
          if (row % 2 === 1) cx += cw * 0.45;
          if (col % 2 === 1) cy += h  * 0.4;
          
          const x = cx - pillWidth / 2;
          const y = cy - h / 2;
          
          /**
          * Opacity substitution:
          * Regex `/,\s*1\)$/` matches only the trailing alpha channel
          * (e.g. "rgba(255, 222, 89, 1)" → "rgba(255, 222, 89, 0.3)").
          * Original used String.replace("1)", …) which would match any
          * "1)" in the string — e.g. rgb(21, 100, 211) → broken.
          */
          ctx.fillStyle = c.replace(/,\s*1\)$/, `, ${opacity})`);
          
          // Rounded rectangle with swapped dimensions
          const r = Math.min(pillWidth / 2, h / 2, 8);
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          
          // 1. Top edge (Using pillWidth instead of h)
          ctx.lineTo(x + pillWidth - r, y);
          ctx.arcTo(x + pillWidth, y, x + pillWidth, y + r, r);
          
          // 2. Right edge (Using h instead of pillWidth)
          ctx.lineTo(x + pillWidth, y + h - r);
          ctx.arcTo(x + pillWidth, y + h, x + pillWidth - r, y + h, r);
          
          // 3. Bottom edge (Using pillWidth instead of h)
          ctx.lineTo(x + r, y + h);
          ctx.arcTo(x, y + h, x, y + h - r, r);
          
          // 4. Left edge (Using h instead of pillWidth)
          ctx.lineTo(x, y + r);
          ctx.arcTo(x, y, x + r, y, r);
          
          ctx.closePath();
          ctx.fill();
        }
      }
      
      raf = requestAnimationFrame(draw);
    };
    
    raf = requestAnimationFrame(draw);
    
    return () => {
      cancelAnimationFrame(raf); // Bug in original: RAF was never cancelled on unmount
      window.removeEventListener("resize", resize);
    };
  }, [rows, columns, duration]); // color/bg intentionally excluded — handled via refs
  
  return (
    <canvas
    ref={canvasRef}
    aria-hidden="true"
    style={{
      position: "fixed",
      inset: 0,
      zIndex: -1,
      width: "100vw",
      height: "100vh",
      pointerEvents: "none",
      ...style,
    }}
    />
  );
}