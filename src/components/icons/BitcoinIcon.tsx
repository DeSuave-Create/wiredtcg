const BitcoinIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer circle */}
    <circle
      cx="32"
      cy="32"
      r="28"
      stroke="#FFD700"
      strokeWidth="3"
      fill="none"
    />
    {/* Bitcoin B symbol */}
    <path
      d="M20 16 L20 48 M20 16 L32 16 Q40 16, 40 24 Q40 32, 32 32 L20 32 M20 32 L34 32 Q42 32, 42 40 Q42 48, 34 48 L20 48"
      stroke="#FFD700"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Vertical lines through B */}
    <line x1="24" y1="12" x2="24" y2="20" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
    <line x1="24" y1="44" x2="24" y2="52" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
    <line x1="28" y1="12" x2="28" y2="20" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
    <line x1="28" y1="44" x2="28" y2="52" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default BitcoinIcon;