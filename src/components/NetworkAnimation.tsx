'use client';

import { useEffect, useRef, useId } from 'react';
import anime from 'animejs';
import { prefersReducedMotion } from '@/utils/motion';

const NODES = [
  { cx: 120, cy: 80, r: 10 },
  { cx: 280, cy: 120, r: 13 },
  { cx: 200, cy: 240, r: 8 },
  { cx: 350, cy: 200, r: 11 },
  { cx: 80, cy: 200, r: 7 },
];

const EDGES: [number, number][] = [
  [0, 1],
  [1, 3],
  [1, 2],
  [0, 4],
  [4, 2],
  [2, 3],
];

export default function NetworkAnimation({ className = '' }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const gradientId = useId();

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    if (prefersReducedMotion()) {
      svg.querySelectorAll('.net-line').forEach((el) => {
        (el as SVGLineElement).style.strokeDashoffset = '0';
      });
      svg.querySelectorAll('.net-node').forEach((el) => {
        (el as SVGElement).style.opacity = '1';
      });
      svg.querySelectorAll('.net-dot').forEach((el) => {
        (el as SVGElement).style.opacity = '1';
      });
      return;
    }

    // Draw lines with stagger (anime.setDashoffset handles dasharray automatically)
    const lines = svg.querySelectorAll('.net-line');
    anime({
      targets: lines,
      strokeDashoffset: [anime.setDashoffset, 0],
      duration: 1200,
      delay: anime.stagger(150, { start: 800 }),
      easing: 'easeInOutQuad',
    });

    // Fade in outer rings
    anime({
      targets: svg.querySelectorAll('.net-node'),
      opacity: [0, 0.6],
      scale: [0.5, 1],
      duration: 600,
      delay: anime.stagger(100, { start: 500 }),
      easing: 'easeOutCubic',
    });

    // Fade in inner dots
    anime({
      targets: svg.querySelectorAll('.net-dot'),
      opacity: [0, 1],
      duration: 400,
      delay: anime.stagger(100, { start: 600 }),
      easing: 'easeOutCubic',
    });

    // Pulse animation (looping)
    anime({
      targets: svg.querySelectorAll('.net-node'),
      scale: [1, 1.2, 1],
      opacity: [0.6, 0.3, 0.6],
      duration: 3000,
      delay: anime.stagger(400, { start: 2000 }),
      easing: 'easeInOutSine',
      loop: true,
    });
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 440 300"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>

      {/* Connection lines */}
      {EDGES.map(([from, to], i) => (
        <line
          key={`edge-${i}`}
          className="net-line"
          x1={NODES[from].cx}
          y1={NODES[from].cy}
          x2={NODES[to].cx}
          y2={NODES[to].cy}
          stroke={`url(#${gradientId})`}
          strokeWidth="1.5"
          opacity="0.5"
        />
      ))}

      {/* Nodes */}
      {NODES.map((node, i) => (
        <g key={`node-${i}`}>
          {/* Outer ring */}
          <circle
            className="net-node"
            cx={node.cx}
            cy={node.cy}
            r={node.r}
            stroke={`url(#${gradientId})`}
            strokeWidth="2"
            fill="none"
            opacity="0"
          />
          {/* Inner dot */}
          <circle
            className="net-dot"
            cx={node.cx}
            cy={node.cy}
            r={node.r * 0.4}
            fill={`url(#${gradientId})`}
            opacity="0"
          />
        </g>
      ))}
    </svg>
  );
}
