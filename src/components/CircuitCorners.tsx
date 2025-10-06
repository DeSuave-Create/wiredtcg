const CircuitCorners = () => {
  return (
    <>
      {/* Top Left Corner - Green */}
      <div className="fixed top-0 left-0 w-64 h-64 pointer-events-none z-50 overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 200 200">
          <path 
            className="circuit-path-tl"
            d="M 0,20 L 40,20 L 40,40 L 60,40 M 0,50 L 30,50 L 30,70 L 50,70 M 0,80 L 20,80 L 20,100" 
            stroke="rgb(34, 197, 94)" 
            strokeWidth="2" 
            fill="none"
            strokeDasharray="200"
            strokeDashoffset="200"
          />
          <circle className="circuit-node-tl circuit-node-delay-1" cx="40" cy="20" r="3" fill="rgb(34, 197, 94)" opacity="0" />
          <circle className="circuit-node-tl circuit-node-delay-2" cx="40" cy="40" r="3" fill="rgb(34, 197, 94)" opacity="0" />
          <circle className="circuit-node-tl circuit-node-delay-3" cx="30" cy="50" r="3" fill="rgb(34, 197, 94)" opacity="0" />
          <circle className="circuit-node-tl circuit-node-delay-4" cx="20" cy="80" r="3" fill="rgb(34, 197, 94)" opacity="0" />
        </svg>
      </div>

      {/* Top Right Corner - Blue */}
      <div className="fixed top-0 right-0 w-64 h-64 pointer-events-none z-50 overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 200 200">
          <path 
            className="circuit-path-tr"
            d="M 200,20 L 160,20 L 160,40 L 140,40 M 200,50 L 170,50 L 170,70 L 150,70 M 200,80 L 180,80 L 180,100" 
            stroke="rgb(59, 130, 246)" 
            strokeWidth="2" 
            fill="none"
            strokeDasharray="200"
            strokeDashoffset="200"
          />
          <circle className="circuit-node-tr circuit-node-delay-1" cx="160" cy="20" r="3" fill="rgb(59, 130, 246)" opacity="0" />
          <circle className="circuit-node-tr circuit-node-delay-2" cx="160" cy="40" r="3" fill="rgb(59, 130, 246)" opacity="0" />
          <circle className="circuit-node-tr circuit-node-delay-3" cx="170" cy="50" r="3" fill="rgb(59, 130, 246)" opacity="0" />
          <circle className="circuit-node-tr circuit-node-delay-4" cx="180" cy="80" r="3" fill="rgb(59, 130, 246)" opacity="0" />
        </svg>
      </div>

      {/* Bottom Left Corner - Red */}
      <div className="fixed bottom-0 left-0 w-64 h-64 pointer-events-none z-50 overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 200 200">
          <path 
            className="circuit-path-bl"
            d="M 0,180 L 40,180 L 40,160 L 60,160 M 0,150 L 30,150 L 30,130 L 50,130 M 0,120 L 20,120 L 20,100" 
            stroke="rgb(239, 68, 68)" 
            strokeWidth="2" 
            fill="none"
            strokeDasharray="200"
            strokeDashoffset="200"
          />
          <circle className="circuit-node-bl circuit-node-delay-1" cx="40" cy="180" r="3" fill="rgb(239, 68, 68)" opacity="0" />
          <circle className="circuit-node-bl circuit-node-delay-2" cx="40" cy="160" r="3" fill="rgb(239, 68, 68)" opacity="0" />
          <circle className="circuit-node-bl circuit-node-delay-3" cx="30" cy="150" r="3" fill="rgb(239, 68, 68)" opacity="0" />
          <circle className="circuit-node-bl circuit-node-delay-4" cx="20" cy="120" r="3" fill="rgb(239, 68, 68)" opacity="0" />
        </svg>
      </div>

      {/* Bottom Right Corner - Green */}
      <div className="fixed bottom-0 right-0 w-64 h-64 pointer-events-none z-50 overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 200 200">
          <path 
            className="circuit-path-br"
            d="M 200,180 L 160,180 L 160,160 L 140,160 M 200,150 L 170,150 L 170,130 L 150,130 M 200,120 L 180,120 L 180,100" 
            stroke="rgb(34, 197, 94)" 
            strokeWidth="2" 
            fill="none"
            strokeDasharray="200"
            strokeDashoffset="200"
          />
          <circle className="circuit-node-br circuit-node-delay-1" cx="160" cy="180" r="3" fill="rgb(34, 197, 94)" opacity="0" />
          <circle className="circuit-node-br circuit-node-delay-2" cx="160" cy="160" r="3" fill="rgb(34, 197, 94)" opacity="0" />
          <circle className="circuit-node-br circuit-node-delay-3" cx="170" cy="150" r="3" fill="rgb(34, 197, 94)" opacity="0" />
          <circle className="circuit-node-br circuit-node-delay-4" cx="180" cy="120" r="3" fill="rgb(34, 197, 94)" opacity="0" />
        </svg>
      </div>
    </>
  );
};

export default CircuitCorners;
