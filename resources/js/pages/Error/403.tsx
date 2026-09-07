import React from "react";

/**
 * Error 403 — Forbidden
 * React + Tailwind CSS
 *
 * ปุ่มเดียว: กลับไปหน้าเมนู
 * แก้ปลายทางได้ที่ prop `onBackToMenu` หรือ `menuHref`
 */
export default function Error403Page({ menuHref = "/menu", onBackToMenu }: { menuHref?: string; onBackToMenu?: () => void }) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onBackToMenu) {
      e.preventDefault();
      onBackToMenu();
    }
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center px-6 py-16"
      style={{ background: "#070A16", fontFamily: "'IBM Plex Sans Thai', system-ui, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;500;600&family=Space+Grotesk:wght@500;700&display=swap');

        @keyframes e403-scan   { 0% { transform: rotate(0deg);}   100% { transform: rotate(360deg);} }
        @keyframes e403-scan-r { 0% { transform: rotate(360deg);} 100% { transform: rotate(0deg);} }
        @keyframes e403-pulse  { 0%,100% { opacity:.25; r:3 } 50% { opacity:1; r:4.6 } }
        @keyframes e403-drift  { 0%,100% { transform: translateY(0) }  50% { transform: translateY(-10px) } }
        @keyframes e403-flick  { 0%,92%,100% { opacity:1 } 94% { opacity:.35 } 96% { opacity:1 } 98% { opacity:.6 } }
        @keyframes e403-rise   { from { opacity:0; transform: translateY(18px) } to { opacity:1; transform:none } }

        .e403-rise { animation: e403-rise .7s cubic-bezier(.2,.7,.3,1) both; }
        .e403-scan { transform-origin: 130px 130px; animation: e403-scan 14s linear infinite; }
        .e403-scan-r { transform-origin: 130px 130px; animation: e403-scan-r 22s linear infinite; }
        .e403-node { animation: e403-pulse 3.2s ease-in-out infinite; }
        .e403-drift { animation: e403-drift 7s ease-in-out infinite; }
        .e403-flick { animation: e403-flick 6s linear infinite; }

        .e403-cta { transition: transform .25s ease, box-shadow .25s ease, background .25s ease; }
        .e403-cta:hover { transform: translateY(-2px); box-shadow: 0 14px 40px -12px rgba(124,92,255,.75); }
        .e403-cta:focus-visible { outline: 2px solid #4EE7C4; outline-offset: 4px; }

        @media (prefers-reduced-motion: reduce) {
          .e403-rise, .e403-scan, .e403-scan-r, .e403-node, .e403-drift, .e403-flick, .e403-cta {
            animation: none !important; transition: none !important;
          }
        }
      `}</style>

      {/* แสงพื้นหลัง */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 520px at 72% 32%, rgba(124,92,255,.20), transparent 62%), radial-gradient(700px 420px at 20% 78%, rgba(78,231,196,.10), transparent 65%)",
        }}
      />
      {/* เส้นกริด */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(circle at 50% 45%, #000 35%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 45%, #000 35%, transparent 78%)",
        }}
      />

      <div className="relative w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
        {/* ---------- ข้อความ ---------- */}
        <div className="e403-rise order-2 md:order-1 text-center md:text-left">
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs tracking-widest"
            style={{ borderColor: "rgba(124,92,255,.4)", color: "#9F8CFF", fontFamily: "'Space Grotesk', monospace" }}
          >
            <span className="e403-flick inline-block h-1.5 w-1.5 rounded-full" style={{ background: "#7C5CFF" }} />
            ACCESS DENIED
          </div>

          <h1
            className="mt-6 text-7xl sm:text-8xl font-bold leading-none"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              background: "linear-gradient(100deg,#FFFFFF 10%,#9F8CFF 55%,#4EE7C4 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              letterSpacing: "-0.03em",
            }}
          >
            403
          </h1>

          <h2 className="mt-4 text-2xl sm:text-3xl font-semibold" style={{ color: "#EAECF5" }}>
            คุณไม่มีสิทธิ์เข้าถึงหน้านี้
          </h2>

          <p className="mt-4 text-base leading-relaxed max-w-md mx-auto md:mx-0" style={{ color: "#8C93AE" }}>
            ระบบตรวจสอบสิทธิ์ของบัญชีคุณแล้ว แต่ไม่พบการอนุญาตสำหรับหน้านี้
            หากคิดว่าเป็นความผิดพลาด กรุณาติดต่อผู้ดูแลระบบ
          </p>

          {/* ปุ่มเดียว: กลับไปหน้าเมนู */}
          <div className="mt-9">
            <button              
                onClick={() => window.location.href = "http://172.22.64.11/menu.php"}
              className="e403-cta inline-flex items-center gap-3 rounded-xl px-7 py-4 text-base font-semibold"
              style={{
                background: "linear-gradient(100deg,#7C5CFF,#5B8CFF)",
                color: "#0A0D1A",
                boxShadow: "0 10px 30px -14px rgba(124,92,255,.9)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
              กลับไปหน้าเมนู
            </button>
          </div>

          <p className="mt-6 text-xs tracking-wider" style={{ color: "#4E5570", fontFamily: "'Space Grotesk', monospace" }}>
            HTTP 403 · FORBIDDEN
          </p>
        </div>

        {/* ---------- ภาพประกอบ ---------- */}
        <div className="order-1 md:order-2 flex justify-center">
          <svg viewBox="0 0 260 260" className="e403-drift w-64 sm:w-80 h-auto" role="img" aria-label="ภาพประกอบระบบตรวจสอบสิทธิ์ปฏิเสธการเข้าถึง">
            <defs>
              <linearGradient id="e403g1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#7C5CFF" />
                <stop offset="100%" stopColor="#4EE7C4" />
              </linearGradient>
              <radialGradient id="e403core" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#7C5CFF" stopOpacity=".55" />
                <stop offset="100%" stopColor="#7C5CFF" stopOpacity="0" />
              </radialGradient>
            </defs>

            <circle cx="130" cy="130" r="96" fill="url(#e403core)" />

            {/* วงแหวนสแกน */}
            <g className="e403-scan" fill="none" stroke="url(#e403g1)" strokeLinecap="round">
              <circle cx="130" cy="130" r="112" strokeWidth="1" strokeOpacity=".28" strokeDasharray="4 12" />
              <path d="M130 42 a88 88 0 0 1 76 44" strokeWidth="2.2" />
            </g>
            <g className="e403-scan-r" fill="none" stroke="#4EE7C4" strokeLinecap="round">
              <circle cx="130" cy="130" r="92" strokeWidth="1" strokeOpacity=".22" />
              <path d="M130 222 a92 92 0 0 1 -70 -38" strokeWidth="1.8" strokeOpacity=".8" />
            </g>

            {/* โครงข่ายโหนด */}
            <g stroke="#7C5CFF" strokeOpacity=".35" strokeWidth="1">
              <path d="M60 96 L130 62 L200 96 L200 164 L130 198 L60 164 Z" fill="none" />
              <path d="M60 96 L130 130 M200 96 L130 130 M130 198 L130 130 M60 164 L130 130 M200 164 L130 130 M130 62 L130 130" />
            </g>
            <g fill="#4EE7C4">
              <circle className="e403-node" cx="130" cy="62" r="3" />
              <circle className="e403-node" cx="200" cy="96" r="3" style={{ animationDelay: ".4s" }} />
              <circle className="e403-node" cx="200" cy="164" r="3" style={{ animationDelay: ".8s" }} />
              <circle className="e403-node" cx="130" cy="198" r="3" style={{ animationDelay: "1.2s" }} />
              <circle className="e403-node" cx="60" cy="164" r="3" style={{ animationDelay: "1.6s" }} />
              <circle className="e403-node" cx="60" cy="96" r="3" style={{ animationDelay: "2s" }} />
            </g>

            {/* แม่กุญแจกลาง */}
            <g transform="translate(130 130)">
              <rect x="-34" y="-8" width="68" height="52" rx="14" fill="#0E1330" stroke="url(#e403g1)" strokeWidth="2" />
              <path d="M-18 -8 v-14 a18 18 0 0 1 36 0 v14" fill="none" stroke="url(#e403g1)" strokeWidth="5" strokeLinecap="round" />
              <circle cx="0" cy="14" r="6" fill="#4EE7C4" />
              <rect x="-2" y="17" width="4" height="12" rx="2" fill="#4EE7C4" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}