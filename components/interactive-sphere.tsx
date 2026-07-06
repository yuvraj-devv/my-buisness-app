"use client";

import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  char: string;
  offsetX: number;
  offsetY: number;
}

export function InteractiveSphereBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Track theme changes dynamically
    let isDark = document.documentElement.classList.contains("dark");
    const observer = new MutationObserver(() => {
      isDark = document.documentElement.classList.contains("dark");
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Sphere parameters
    const particleCount = 450;
    const fov = 400; // perspective camera field of view
    const particles: Particle[] = [];

    // Fibonacci sphere distribution
    for (let i = 0; i < particleCount; i++) {
      const y = 1 - (i / (particleCount - 1)) * 2; // y: 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y);
      const goldenRatio = (1 + Math.sqrt(5)) / 2;
      const theta = 2 * Math.PI * i / goldenRatio;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      // Select characters from the "Optimus" preview screenshot
      const chars = ["|", "T", "r", "L", "+", "."];
      const char = chars[Math.floor(Math.random() * chars.length)];

      particles.push({
        x,
        y,
        z,
        baseX: x,
        baseY: y,
        baseZ: z,
        char,
        offsetX: 0,
        offsetY: 0,
      });
    }

    // Rotation angles
    let angleY = 0;
    let angleX = 0;

    // Interactive mouse rotation offsets
    let mouseRotY = 0;
    let mouseRotX = 0;

    // Handle resizing
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Track mouse
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };
    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    // Main animation loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Sphere centering: center-right on desktop, center on mobile
      const isMobile = width < 768;
      const centerX = isMobile ? width * 0.5 : width * 0.7;
      const centerY = height * 0.5;
      const sphereRadius = Math.min(width, height) * (isMobile ? 0.38 : 0.42);

      // Background fade color depending on theme
      ctx.fillStyle = isDark ? "#09090b" : "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // Auto rotation
      angleY += 0.0015;
      angleX += 0.0008;

      // Parallax rotation matching mouse
      if (mouseRef.current.x !== -1000) {
        const targetRotY = (mouseRef.current.x / width - 0.5) * 0.6;
        const targetRotX = -(mouseRef.current.y / height - 0.5) * 0.6;
        mouseRotY += (targetRotY - mouseRotY) * 0.05;
        mouseRotX += (targetRotX - mouseRotX) * 0.05;
      } else {
        mouseRotY += (0 - mouseRotY) * 0.05;
        mouseRotX += (0 - mouseRotX) * 0.05;
      }

      const totalAngleY = angleY + mouseRotY;
      const totalAngleX = angleX + mouseRotX;

      // Render particles sorted by depth (painter's algorithm)
      const projected = particles.map((p) => {
        // 3D rotations
        // Rotate Y
        const cosY = Math.cos(totalAngleY);
        const sinY = Math.sin(totalAngleY);
        const x1 = p.baseX * cosY - p.baseZ * sinY;
        const z1 = p.baseX * sinY + p.baseZ * cosY;

        // Rotate X
        const cosX = Math.cos(totalAngleX);
        const sinX = Math.sin(totalAngleX);
        const y2 = p.baseY * cosX - z1 * sinX;
        const z2 = p.baseY * sinX + z1 * cosX;

        // Perspective projection
        // We move the sphere forward slightly (adding depth offset)
        const depthOffset = 1.3;
        const scale = fov / (fov + (z2 + depthOffset) * sphereRadius);
        const screenX = x1 * scale * sphereRadius + centerX;
        const screenY = y2 * scale * sphereRadius + centerY;

        // Mouse hover circular distortion/displacement force
        const dx = mouseRef.current.x - screenX;
        const dy = mouseRef.current.y - screenY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 140;

        if (dist < maxDist && mouseRef.current.x !== -1000) {
          const force = (maxDist - dist) / maxDist; // 0 to 1
          // Circular angle: perpendicular to radial angle (+ PI/2)
          const swirlAngle = Math.atan2(dy, dx) + Math.PI / 2;
          p.offsetX += Math.cos(swirlAngle) * force * 12;
          p.offsetY += Math.sin(swirlAngle) * force * 12;
        }

        // Return physics offsets back to 0 (spring damping)
        p.offsetX += (0 - p.offsetX) * 0.08;
        p.offsetY += (0 - p.offsetY) * 0.08;

        return {
          char: p.char,
          x: screenX + p.offsetX,
          y: screenY + p.offsetY,
          z: z2,
          scale,
        };
      });

      // Sort by depth (back to front)
      projected.sort((a, b) => b.z - a.z);

      // Render projected symbols
      projected.forEach((p) => {
        // Calculate opacity based on depth (front is bright, back is faded)
        // p.z is between -1 (front) and 1 (back)
        const alpha = Math.max(0.04, Math.min(0.7, 0.4 - p.z * 0.3));
        const colorVal = isDark ? `rgba(228, 228, 231, ${alpha})` : `rgba(39, 39, 42, ${alpha})`;
        
        ctx.fillStyle = colorVal;
        ctx.font = `${Math.max(6, Math.floor(11 * p.scale))}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.char, p.x, p.y);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      observer.disconnect();
    };
  }, []);

  if (!mounted) {
    return <div className="fixed inset-0 -z-10 bg-white dark:bg-zinc-950" />;
  }

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-white dark:bg-zinc-950 transition-colors duration-300">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-80" 
      />
    </div>
  );
}
