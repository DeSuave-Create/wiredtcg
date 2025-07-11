const CableIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Cable body */}
    <path
      d="M8 32 Q20 20, 32 32 T56 32"
      stroke="rgb(34, 197, 94)"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />
    {/* Left connector */}
    <rect
      x="4"
      y="28"
      width="8"
      height="8"
      rx="2"
      fill="rgb(34, 197, 94)"
    />
    {/* Right connector */}
    <rect
      x="52"
      y="28"
      width="8"
      height="8"
      rx="2"
      fill="rgb(34, 197, 94)"
    />
    {/* Cable details */}
    <circle cx="8" cy="32" r="2" fill="rgb(16, 185, 129)" />
    <circle cx="56" cy="32" r="2" fill="rgb(16, 185, 129)" />
  </svg>
);

export default CableIcon;