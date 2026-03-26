export function SectionDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-3">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="w-2 h-2 rounded-full transition-all duration-500"
          style={{
            background: i === current ? 'linear-gradient(135deg, #60a5fa, #f9a8d4)' : 'rgba(0,0,0,0.08)',
            transform: i === current ? 'scale(1.5)' : 'scale(1)',
          }} />
      ))}
    </div>
  );
}
