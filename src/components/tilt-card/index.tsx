'use client';

import { useRef } from 'react';

export function TiltCard({
  children,
  className = '',
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent) => {
    const card = ref.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) scale(1.01)`;
  };

  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = 'none';
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ ...style, transition: 'transform 0.4s cubic-bezier(0.03, 0.98, 0.52, 0.99)' }}
    >
      {children}
    </div>
  );
}
