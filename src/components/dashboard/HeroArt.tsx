/** Illustrated coder at a laptop (pure SVG, animated with CSS). */
export default function HeroArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 340 170" className={className} aria-hidden>
      <defs>
        <linearGradient id="hoodie" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5b54f0" />
          <stop offset="1" stopColor="#4338ca" />
        </linearGradient>
        <linearGradient id="screen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1e2a5a" />
          <stop offset="1" stopColor="#0f1a3d" />
        </linearGradient>
      </defs>
      {/* desk line */}
      <rect x="20" y="158" width="300" height="3" rx="1.5" fill="#dfe3f3" />

      {/* plant */}
      <g className="float" style={{ animationDelay: "-1s" }}>
        <path d="M268 112c-10-22-6-40 6-52 6 18 6 36-6 52z" fill="#c7c4fb" />
        <path d="M272 116c4-22 18-36 34-40-4 20-16 34-34 40z" fill="#a5a0f7" />
        <path d="M266 116c-14-12-30-16-42-14 8 12 22 18 42 14z" fill="#b8b4fa" />
        <path d="M276 118c10-8 24-10 34-6-8 10-20 12-34 6z" fill="#d6d3fc" />
      </g>
      <path d="M252 118h40l-6 40h-28z" fill="#e8e7fd" stroke="#c9c6f8" strokeWidth="1.5" />

      {/* person */}
      <path d="M118 158c0-34 18-56 52-56s52 22 52 56z" fill="url(#hoodie)" />
      <path d="M150 104c6 10 34 10 40 0" stroke="#3730a3" strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="163" y="88" width="14" height="16" rx="5" fill="#f2c4a2" />
      <ellipse cx="170" cy="66" rx="23" ry="25" fill="#f6cfb0" />
      {/* hair */}
      <path d="M145 62c-4-22 10-36 28-36 18 0 30 12 26 32-4-8-10-12-16-12-6 6-18 8-30 6-4 2-6 6-8 10z" fill="#1e1b3a" />
      <circle cx="152" cy="40" r="8" fill="#1e1b3a" />
      <circle cx="164" cy="31" r="9" fill="#1e1b3a" />
      <circle cx="179" cy="30" r="9" fill="#1e1b3a" />
      <circle cx="191" cy="38" r="8" fill="#1e1b3a" />
      {/* glasses */}
      <circle cx="160" cy="67" r="7.5" fill="#fff" fillOpacity=".35" stroke="#1e1b3a" strokeWidth="2" />
      <circle cx="181" cy="67" r="7.5" fill="#fff" fillOpacity=".35" stroke="#1e1b3a" strokeWidth="2" />
      <path d="M167.5 67h6" stroke="#1e1b3a" strokeWidth="2" />
      <circle cx="160" cy="68" r="1.6" fill="#1e1b3a" />
      <circle cx="181" cy="68" r="1.6" fill="#1e1b3a" />
      <path d="M164 81c4 3 9 3 13 0" stroke="#b5643f" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* arms */}
      <path d="M128 140c10-8 26-10 44-6" stroke="#4f46e5" strokeWidth="12" strokeLinecap="round" fill="none" />
      <circle cx="176" cy="134" r="6" fill="#f2c4a2" />

      {/* laptop */}
      <g>
        <path d="M84 92l64 0 14 56H98z" fill="url(#screen)" stroke="#0b1437" strokeWidth="2" strokeLinejoin="round" />
        <path d="M110 113l-6 7 6 7M136 113l6 7-6 7M126 110l-6 20" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="88" y="148" width="104" height="6" rx="3" fill="#0b1437" />
      </g>

      {/* mug */}
      <path className="steam" d="M224 120c-4-6 4-8 0-14" stroke="#c7cbf6" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path className="steam" style={{ animationDelay: "-1.2s" }} d="M232 120c-4-6 4-8 0-14" stroke="#c7cbf6" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M214 126h26v26a6 6 0 0 1-6 6h-14a6 6 0 0 1-6-6z" fill="#0b1437" />
      <path d="M240 132a7 7 0 0 1 0 14" stroke="#0b1437" strokeWidth="4" fill="none" />
    </svg>
  );
}
