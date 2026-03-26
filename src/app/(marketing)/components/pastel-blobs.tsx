export function PastelBlobs() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div className="absolute -top-[15vh] -right-[10vw] w-[65vw] h-[65vw] rounded-full"
        style={{ background: 'radial-gradient(circle at 40% 40%, rgba(255,183,197,0.35), rgba(255,218,185,0.2) 50%, transparent 70%)', filter: 'blur(80px)' }} />
      <div className="absolute top-[35vh] -left-[15vw] w-[55vw] h-[55vw] rounded-full"
        style={{ background: 'radial-gradient(circle at 60% 50%, rgba(196,181,253,0.25), rgba(165,214,255,0.15) 55%, transparent 70%)', filter: 'blur(100px)' }} />
      <div className="absolute bottom-[-10vh] right-[5vw] w-[50vw] h-[50vw] rounded-full"
        style={{ background: 'radial-gradient(circle at 40% 60%, rgba(167,243,208,0.2), rgba(196,181,253,0.15) 55%, transparent 70%)', filter: 'blur(90px)' }} />
    </div>
  );
}
