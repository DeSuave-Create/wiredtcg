const CircuitCorners = () => {
  return (
    <>
      {/* Top Left Corner - Green */}
      <div className="fixed top-0 left-0 w-96 h-96 pointer-events-none z-50 overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 300 300">
          <path 
            className="circuit-path-tl"
            d="M 0,15 L 60,15 L 60,45 M 60,45 L 90,45 L 90,75 M 90,75 L 120,75 M 0,55 L 50,55 L 50,85 M 50,85 L 80,85 L 80,105 M 0,95 L 40,95 L 40,125 M 40,125 L 70,125 M 0,135 L 30,135 L 30,155" 
            stroke="rgb(34, 197, 94)" 
            strokeWidth="1.5" 
            fill="none"
            strokeDasharray="400"
            strokeDashoffset="400"
          />
        </svg>
      </div>

      {/* Top Right Corner - Blue */}
      <div className="fixed top-0 right-0 w-96 h-96 pointer-events-none z-50 overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 300 300">
          <path 
            className="circuit-path-tr"
            d="M 300,15 L 240,15 L 240,45 M 240,45 L 210,45 L 210,75 M 210,75 L 180,75 M 300,55 L 250,55 L 250,85 M 250,85 L 220,85 L 220,105 M 300,95 L 260,95 L 260,125 M 260,125 L 230,125 M 300,135 L 270,135 L 270,155" 
            stroke="rgb(59, 130, 246)" 
            strokeWidth="1.5" 
            fill="none"
            strokeDasharray="400"
            strokeDashoffset="400"
          />
        </svg>
      </div>

      {/* Bottom Left Corner - Red */}
      <div className="fixed bottom-0 left-0 w-96 h-96 pointer-events-none z-50 overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 300 300">
          <path 
            className="circuit-path-bl"
            d="M 0,285 L 60,285 L 60,255 M 60,255 L 90,255 L 90,225 M 90,225 L 120,225 M 0,245 L 50,245 L 50,215 M 50,215 L 80,215 L 80,195 M 0,205 L 40,205 L 40,175 M 40,175 L 70,175 M 0,165 L 30,165 L 30,145" 
            stroke="rgb(239, 68, 68)" 
            strokeWidth="1.5" 
            fill="none"
            strokeDasharray="400"
            strokeDashoffset="400"
          />
        </svg>
      </div>

      {/* Bottom Right Corner - Green */}
      <div className="fixed bottom-0 right-0 w-96 h-96 pointer-events-none z-50 overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 300 300">
          <path 
            className="circuit-path-br"
            d="M 300,285 L 240,285 L 240,255 M 240,255 L 210,255 L 210,225 M 210,225 L 180,225 M 300,245 L 250,245 L 250,215 M 250,215 L 220,215 L 220,195 M 300,205 L 260,205 L 260,175 M 260,175 L 230,175 M 300,165 L 270,165 L 270,145" 
            stroke="rgb(34, 197, 94)" 
            strokeWidth="1.5" 
            fill="none"
            strokeDasharray="400"
            strokeDashoffset="400"
          />
        </svg>
      </div>
    </>
  );
};

export default CircuitCorners;
