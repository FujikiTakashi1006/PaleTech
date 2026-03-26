'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import anime from 'animejs';

export function MicroInteractionDemo({ color, active }: { color: string; active: boolean }) {
  const [toggled, setToggled] = useState(false);
  const [liked, setLiked] = useState(false);
  const [sliderVal, setSliderVal] = useState(30);
  const btnRef = useRef<HTMLDivElement>(null);
  const heartRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Auto-play the interactions
  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    const autoPlay = async () => {
      while (!cancelled) {
        // Toggle switch
        await new Promise(r => setTimeout(r, 1200));
        if (cancelled) break;
        setToggled(true);
        await new Promise(r => setTimeout(r, 1000));
        if (cancelled) break;
        setToggled(false);

        // Like button
        await new Promise(r => setTimeout(r, 800));
        if (cancelled) break;
        setLiked(true);
        if (heartRef.current) {
          anime({
            targets: heartRef.current,
            scale: [1, 1.4, 1],
            duration: 500,
            easing: 'easeOutBack',
          });
        }
        await new Promise(r => setTimeout(r, 1200));
        if (cancelled) break;
        setLiked(false);

        // Slider
        await new Promise(r => setTimeout(r, 600));
        if (cancelled) break;
        const obj = { val: 30 };
        await new Promise<void>(resolve => {
          anime({
            targets: obj,
            val: 80,
            duration: 1000,
            easing: 'easeInOutCubic',
            update: () => { if (!cancelled) setSliderVal(obj.val); },
            complete: () => resolve(),
          });
        });
        await new Promise(r => setTimeout(r, 500));
        if (cancelled) break;
        await new Promise<void>(resolve => {
          anime({
            targets: obj,
            val: 30,
            duration: 800,
            easing: 'easeInOutCubic',
            update: () => { if (!cancelled) setSliderVal(obj.val); },
            complete: () => resolve(),
          });
        });

        // Button press
        await new Promise(r => setTimeout(r, 800));
        if (cancelled) break;
        if (btnRef.current) {
          anime({
            targets: btnRef.current,
            scale: [1, 0.92, 1],
            duration: 400,
            easing: 'easeInOutCubic',
          });
        }
        await new Promise(r => setTimeout(r, 1500));
      }
    };

    autoPlay();
    return () => { cancelled = true; };
  }, [active]);

  // Card tilt on mouse
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    cardRef.current.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    anime({
      targets: cardRef.current,
      rotateY: 0,
      rotateX: 0,
      duration: 600,
      easing: 'easeOutCubic',
    });
  }, []);

  return (
    <div
      ref={cardRef}
      className="rounded-xl border p-5 flex flex-col gap-5"
      style={{ width: 230, borderColor: color + '20', background: 'white', transition: 'box-shadow 0.3s', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Toggle switch */}
      <div className="flex items-center justify-between">
        <span className="font-gothic text-[10px] text-stone-400">Toggle</span>
        <div
          className="w-10 h-5 rounded-full relative cursor-pointer"
          style={{ background: toggled ? color : '#d6d3d1', transition: 'background 0.3s' }}
          onClick={() => setToggled(!toggled)}
        >
          <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
            style={{ left: toggled ? 22 : 2, transition: 'left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }} />
        </div>
      </div>

      {/* Like button */}
      <div className="flex items-center justify-between">
        <span className="font-gothic text-[10px] text-stone-400">Like</span>
        <div
          ref={heartRef}
          className="cursor-pointer select-none"
          style={{ fontSize: 20, color: liked ? '#ef4444' : '#d6d3d1', transition: 'color 0.2s' }}
          onClick={() => setLiked(!liked)}
        >
          {liked ? '♥' : '♡'}
        </div>
      </div>

      {/* Slider */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-gothic text-[10px] text-stone-400">Slider</span>
          <span className="font-gothic text-[10px]" style={{ color }}>{Math.round(sliderVal)}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full" style={{ background: '#e7e5e4' }}>
          <div className="h-full rounded-full" style={{ width: `${sliderVal}%`, background: color, transition: 'width 0.1s' }} />
        </div>
      </div>

      {/* Button */}
      <div
        ref={btnRef}
        className="w-full py-2.5 rounded-lg flex items-center justify-center cursor-pointer"
        style={{ background: color, willChange: 'transform' }}
      >
        <span className="font-gothic text-[11px] text-white tracking-wider">Submit</span>
      </div>

      {/* Card tilt hint */}
      <p className="text-center font-gothic text-[8px] text-stone-300 tracking-wider">HOVER TO TILT</p>
    </div>
  );
}
