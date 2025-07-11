const ComputerIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Monitor screen */}
    <rect
      x="8"
      y="12"
      width="48"
      height="32"
      rx="4"
      stroke="rgb(34, 197, 94)"
      strokeWidth="2"
      fill="none"
    />
    {/* Screen content */}
    <rect
      x="12"
      y="16"
      width="40"
      height="24"
      rx="2"
      fill="rgb(34, 197, 94)"
      fillOpacity="0.3"
    />
    {/* Stand */}
    <rect
      x="28"
      y="44"
      width="8"
      height="8"
      fill="rgb(34, 197, 94)"
    />
    {/* Base */}
    <rect
      x="20"
      y="52"
      width="24"
      height="4"
      rx="2"
      fill="rgb(34, 197, 94)"
    />
    {/* Power indicator */}
    <circle cx="48" cy="20" r="2" fill="rgb(16, 185, 129)" />
  </svg>
);

export default ComputerIcon;