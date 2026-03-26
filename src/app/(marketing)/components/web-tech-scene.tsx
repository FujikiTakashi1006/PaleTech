'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import anime from 'animejs';

const FACES = [
  { id: 'front', rx: 0, ry: 0, tz: 50 },
  { id: 'back', rx: 0, ry: 180, tz: 50 },
  { id: 'left', rx: 0, ry: -90, tz: 50 },
  { id: 'right', rx: 0, ry: 90, tz: 50 },
  { id: 'top', rx: 90, ry: 0, tz: 50 },
  { id: 'bottom', rx: -90, ry: 0, tz: 50 },
];

export function WebTechScene({ step, color }: { step: number; color: string }) {
  const cubeRef = useRef<HTMLDivElement>(null);
  const frontFaceRef = useRef<HTMLDivElement>(null);
  const spinAnimRef = useRef<ReturnType<typeof anime> | null>(null);
  const currentRotRef = useRef({ ry: 0 });
  const prevStepRef = useRef(-1);
  const uiRef = useRef<HTMLDivElement>(null);

  const getTransform = (face: typeof FACES[0]) =>
    `rotateX(${face.rx}deg) rotateY(${face.ry}deg) translateZ(${face.tz}px)`;

  useEffect(() => {
    const cube = cubeRef.current;
    const front = frontFaceRef.current;
    if (!cube || !front) return;
    const prev = prevStepRef.current;
    prevStepRef.current = step;

    // === STEP 0: Spin ===
    if (step === 0 && prev < 0) {
      // Reset faces
      const faces = cube.querySelectorAll<HTMLElement>('.cube-face');
      faces.forEach((f, i) => {
        f.style.opacity = '1';
        f.style.transform = getTransform(FACES[i]);
      });
      front.style.width = '100px';
      front.style.height = '100px';
      front.style.borderRadius = '0px';

      currentRotRef.current.ry = 0;
      spinAnimRef.current = anime({
        targets: currentRotRef.current,
        ry: [0, 360],
        duration: 4000,
        loop: true,
        easing: 'linear',
        update: () => {
          if (cube) cube.style.transform = `rotateX(-15deg) rotateY(${currentRotRef.current.ry}deg)`;
        },
      });
    }

    // === STEP 1: Stop spin → faces fly off → front expands to card ===
    if (step === 1 && prev === 0) {
      // Stop spin
      if (spinAnimRef.current) {
        spinAnimRef.current.pause();
        spinAnimRef.current = null;
      }

      // Rotate to show front face
      anime({
        targets: currentRotRef.current,
        ry: Math.round(currentRotRef.current.ry / 360) * 360, // nearest full rotation (front facing)
        duration: 600,
        easing: 'easeInOutCubic',
        update: () => {
          cube.style.transform = `rotateX(0deg) rotateY(${currentRotRef.current.ry}deg)`;
        },
      });

      // Fly off non-front faces
      const otherFaces = cube.querySelectorAll<HTMLElement>('.cube-face:not(.cube-front)');
      otherFaces.forEach((f, i) => {
        const dirs = [
          { x: 0, y: 0, z: -200 },     // back
          { x: -200, y: 0, z: 0 },     // left
          { x: 200, y: 0, z: 0 },      // right
          { x: 0, y: -200, z: 0 },     // top
          { x: 0, y: 200, z: 0 },      // bottom
        ];
        const d = dirs[i] || { x: 0, y: 0, z: -200 };

        anime({
          targets: f,
          opacity: [1, 0],
          translateX: d.x,
          translateY: d.y,
          translateZ: d.z,
          rotateX: `+=${Math.random() * 90 - 45}deg`,
          rotateY: `+=${Math.random() * 90 - 45}deg`,
          duration: 800,
          delay: 400 + i * 80,
          easing: 'easeInCubic',
        });
      });

      // Front face: expand to card after faces fly off
      setTimeout(() => {
        // Kill 3D on cube so front face goes flat
        cube.style.transform = 'rotateX(0deg) rotateY(0deg)';
        cube.style.transformStyle = 'flat';

        // Expand both wrapper and face together, centered
        anime({
          targets: cube,
          width: [100, 230],
          height: [100, 310],
          duration: 800,
          easing: 'easeInOutCubic',
        });

        anime({
          targets: front,
          width: [100, 230],
          height: [100, 310],
          borderRadius: [0, 18],
          translateZ: 0,
          duration: 800,
          easing: 'easeInOutCubic',
        });

        // Change front face style to card
        anime({
          targets: front,
          backgroundColor: '#ffffff',
          borderColor: color + '20',
          boxShadow: `0 8px 30px ${color}12`,
          duration: 800,
          easing: 'easeInOutCubic',
        });

        // Show card content after expansion completes
        setTimeout(() => {
          const els = front.querySelectorAll<HTMLElement>('.card-el');
          anime({
            targets: els,
            opacity: [0, 1],
            translateY: [12, 0],
            delay: anime.stagger(60),
            duration: 400,
            easing: 'easeOutCubic',
          });
          // Start scroll float animation
          const floater = front.querySelector<HTMLElement>('.scroll-float');
          if (floater) {
            anime({
              targets: floater,
              translateY: [0, -8, 0],
              duration: 3000,
              loop: true,
              easing: 'easeInOutSine',
            });
          }
        }, 850);
      }, 1000);
    }

    // === STEP 2: UI elements appear on card ===
    if (step === 2 && prev === 1 && uiRef.current) {
      // Overlay fade
      anime({
        targets: uiRef.current,
        opacity: [0, 1],
        duration: 400,
        easing: 'easeOutCubic',
      });
      // UI elements stagger
      anime({
        targets: uiRef.current.querySelectorAll('.ui-el'),
        opacity: [0, 1],
        translateY: [10, 0],
        delay: anime.stagger(100, { start: 200 }),
        duration: 400,
        easing: 'easeOutCubic',
      });
      // Pulse button
      anime({
        targets: uiRef.current.querySelector('.ui-btn'),
        scale: [1, 1.04, 1],
        duration: 1800,
        loop: true,
        easing: 'easeInOutSine',
        delay: 800,
      });
    }

    // === GOING BACK: Step 2 → 1 ===
    if (step === 1 && prev === 2 && uiRef.current) {
      anime.remove(uiRef.current.querySelector('.ui-btn'));
      anime({
        targets: uiRef.current,
        opacity: 0,
        duration: 300,
        easing: 'easeInCubic',
      });
      anime({
        targets: uiRef.current.querySelectorAll('.ui-el'),
        opacity: 0,
        duration: 200,
        easing: 'easeInCubic',
      });
    }

    // === GOING BACK: Step 1 → 0 or Step 0 from higher ===
    if (step === 0 && prev >= 1) {
      // Hide card content
      const els = front.querySelectorAll<HTMLElement>('.card-el');
      anime({ targets: els, opacity: 0, duration: 200, easing: 'easeInCubic' });
      if (uiRef.current) {
        anime.remove(uiRef.current.querySelector('.ui-btn'));
        anime({ targets: uiRef.current, opacity: 0, duration: 200 });
        anime({ targets: uiRef.current.querySelectorAll('.ui-el'), opacity: 0, duration: 150 });
      }
      // Stop any float
      const floater = front.querySelector<HTMLElement>('.scroll-float');
      if (floater) anime.remove(floater);

      // Shrink back to cube face
      setTimeout(() => {
        anime({
          targets: cube,
          width: 100, height: 100,
          duration: 600,
          easing: 'easeInOutCubic',
        });
        anime({
          targets: front,
          width: 100, height: 100, borderRadius: 0,
          backgroundColor: color + '18',
          borderColor: color + '30',
          boxShadow: `0 0 0 transparent`,
          duration: 600,
          easing: 'easeInOutCubic',
          complete: () => {
            // Restore 3D
            cube.style.transformStyle = 'preserve-3d';
            // Bring back other faces
            const others = cube.querySelectorAll<HTMLElement>('.cube-face:not(.cube-front)');
            others.forEach((f, i) => {
              anime.remove(f);
              f.style.transform = getTransform(FACES[i + 1]);
              anime({
                targets: f,
                opacity: [0, 1],
                duration: 400,
                delay: i * 60,
                easing: 'easeOutCubic',
                begin: () => {
                  f.style.transform = getTransform(FACES[i + 1]);
                },
              });
            });
            front.style.transform = getTransform(FACES[0]);

            // Resume spin
            setTimeout(() => {
              currentRotRef.current.ry = 0;
              spinAnimRef.current = anime({
                targets: currentRotRef.current,
                ry: [0, 360],
                duration: 4000,
                loop: true,
                easing: 'linear',
                update: () => {
                  cube.style.transform = `rotateX(-15deg) rotateY(${currentRotRef.current.ry}deg)`;
                },
              });
            }, 300);
          },
        });
      }, 300);
    }
  }, [step, color]);

  return (
    <div className="w-full h-full flex items-center justify-center" style={{ perspective: '600px' }}>
      {/* Cube wrapper */}
      <div ref={cubeRef} style={{ transformStyle: 'preserve-3d', position: 'relative', width: 100, height: 100 }}>
        {/* 6 faces */}
        {FACES.map((face, i) => (
          <div
            key={face.id}
            ref={i === 0 ? frontFaceRef : undefined}
            className={`cube-face ${i === 0 ? 'cube-front' : ''} absolute border overflow-hidden`}
            style={{
              width: 100, height: 100,
              borderRadius: 0,
              background: i === 0 ? `${color}18` : `${color}${String(10 + i * 2).padStart(2, '0')}`,
              borderColor: `${color}30`,
              borderWidth: 1.5,
              transform: getTransform(face),
              backfaceVisibility: 'hidden',
              top: 0, left: 0,
            }}
          >
            {/* Card content — only in front face, hidden until step 1 */}
            {i === 0 && (
              <>
                <div className="absolute inset-0 flex flex-col p-3.5 overflow-hidden">
                  <div className="card-el opacity-0 flex items-center gap-2 mb-3">
                    <div className="w-4 h-4 rounded-full" style={{ background: color + '20' }} />
                    <div className="w-12 h-1.5 rounded" style={{ background: color + '15' }} />
                  </div>
                  <div className="card-el opacity-0 w-3/4 h-2 rounded mb-1.5" style={{ background: color + '18' }} />
                  <div className="card-el opacity-0 w-1/2 h-1.5 rounded mb-3" style={{ background: color + '10' }} />
                  <div className="card-el scroll-float opacity-0 w-full h-12 rounded-lg mb-3" style={{ background: `linear-gradient(135deg, ${color}12, ${color}06)` }} />
                  <div className="card-el opacity-0 w-full h-1 rounded mb-1" style={{ background: color + '0a' }} />
                  <div className="card-el opacity-0 w-4/5 h-1 rounded mb-1" style={{ background: color + '08' }} />
                  <div className="card-el opacity-0 w-3/5 h-1 rounded mb-3" style={{ background: color + '08' }} />
                  {[0, 1].map(j => (
                    <div key={j} className="card-el opacity-0 flex items-center gap-2 p-2 rounded-lg border mb-1.5" style={{ borderColor: color + '0a' }}>
                      <div className="w-3.5 h-3.5 rounded" style={{ background: color + '12' }} />
                      <div className="flex-1">
                        <div className="w-3/4 h-1 rounded mb-0.5" style={{ background: color + '0c' }} />
                        <div className="w-1/2 h-1 rounded" style={{ background: color + '08' }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Micro-interaction overlay */}
                <div ref={uiRef} className="absolute inset-0 flex flex-col justify-end p-3.5 opacity-0"
                  style={{ background: 'rgba(255,255,255,0.9)' }}>
                  <AutoToggle color={color} />
                  <div className="ui-el opacity-0 mb-2.5">
                    <div className="flex justify-between mb-1">
                      <span className="font-gothic text-[7px] text-stone-400">Volume</span>
                    </div>
                    <div className="w-full h-1 rounded-full" style={{ background: color + '12' }}>
                      <div className="h-full rounded-full" style={{ background: color, animation: 'sliderMove 3s ease-in-out infinite alternate' }} />
                    </div>
                  </div>
                  <div className="ui-el ui-btn opacity-0 w-full py-2 rounded-xl text-center" style={{ background: color, boxShadow: `0 3px 12px ${color}30` }}>
                    <span className="font-gothic text-[8px] text-white tracking-[0.15em]">GET STARTED</span>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AutoToggle({ color }: { color: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const i = setInterval(() => setOn(v => !v), 2000);
    return () => clearInterval(i);
  }, []);
  return (
    <div className="ui-el opacity-0 flex items-center justify-between mb-2.5">
      <span className="font-gothic text-[7px] text-stone-400 tracking-wider">Notifications</span>
      <div className="w-7 h-3.5 rounded-full relative"
        style={{ background: on ? color : '#d6d3d1', transition: 'background 0.3s' }}>
        <div className="absolute top-[2px] w-[10px] h-[10px] rounded-full bg-white shadow-sm"
          style={{ left: on ? 14 : 2, transition: 'left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
      </div>
    </div>
  );
}
