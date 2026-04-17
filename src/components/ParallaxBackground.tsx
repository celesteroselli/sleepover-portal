'use client';

import { useEffect, useRef } from 'react';

export default function ParallaxBackground() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!parallaxRef.current) return;

      const scrolled = window.scrollY;
      const parallaxSpeed = 0.5; // Adjust this value to control parallax speed (0.5 = half speed)

      parallaxRef.current.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      ref={parallaxRef}
      className="parallax-transform"
      style={{
        willChange: 'transform',
      }}
    />
  );
}
