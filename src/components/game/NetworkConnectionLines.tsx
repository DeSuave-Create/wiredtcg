import { PlayerNetwork } from '@/types/game';
import { useLayoutEffect, useState, RefObject } from 'react';

interface Line {
  from: { x: number; y: number };
  to: { x: number; y: number };
  type: 'internet-switch' | 'switch-cable' | 'cable-computer';
}

interface NetworkConnectionLinesProps {
  network: PlayerNetwork;
  containerRef: RefObject<HTMLDivElement>;
}

function getCenterPoint(element: Element, container: Element): { x: number; y: number } {
  const containerRect = container.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  
  return {
    x: elementRect.left - containerRect.left + elementRect.width / 2,
    y: elementRect.top - containerRect.top + elementRect.height / 2,
  };
}

function getBottomCenter(element: Element, container: Element): { x: number; y: number } {
  const containerRect = container.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  
  return {
    x: elementRect.left - containerRect.left + elementRect.width / 2,
    y: elementRect.top - containerRect.top + elementRect.height,
  };
}

function getTopCenter(element: Element, container: Element): { x: number; y: number } {
  const containerRect = container.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  
  return {
    x: elementRect.left - containerRect.left + elementRect.width / 2,
    y: elementRect.top - containerRect.top,
  };
}

export function NetworkConnectionLines({ network, containerRef }: NetworkConnectionLinesProps) {
  const [lines, setLines] = useState<Line[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const updateLines = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      setDimensions({
        width: container.offsetWidth,
        height: container.offsetHeight,
      });
      
      const newLines: Line[] = [];
      
      // Get internet element
      const internetEl = container.querySelector('[data-internet]');
      
      // Draw lines from Internet to each Switch
      network.switches.forEach(sw => {
        const switchEl = container.querySelector(`[data-equipment-id="${sw.id}"]`);
        
        if (internetEl && switchEl) {
          newLines.push({
            from: getBottomCenter(internetEl, container),
            to: getTopCenter(switchEl, container),
            type: 'internet-switch',
          });
        }
        
        // Draw lines from Switch to each Cable
        sw.cables.forEach(cable => {
          const cableEl = container.querySelector(`[data-equipment-id="${cable.id}"]`);
          
          if (switchEl && cableEl) {
            newLines.push({
              from: getBottomCenter(switchEl, container),
              to: getTopCenter(cableEl, container),
              type: 'switch-cable',
            });
          }
          
          // Draw lines from Cable to each Computer
          cable.computers.forEach(comp => {
            const compEl = container.querySelector(`[data-equipment-id="${comp.id}"]`);
            
            if (cableEl && compEl) {
              newLines.push({
                from: getBottomCenter(cableEl, container),
                to: getTopCenter(compEl, container),
                type: 'cable-computer',
              });
            }
          });
        });
      });
      
      setLines(newLines);
    };
    
    // Initial update
    updateLines();
    
    // Update on resize
    const resizeObserver = new ResizeObserver(updateLines);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    // Also update after a short delay to catch DOM updates
    const timeoutId = setTimeout(updateLines, 100);
    
    return () => {
      resizeObserver.disconnect();
      clearTimeout(timeoutId);
    };
  }, [network, containerRef]);

  if (lines.length === 0) return null;

  return (
    <svg 
      className="absolute inset-0 pointer-events-none z-0"
      width={dimensions.width}
      height={dimensions.height}
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Gradient for main connections */}
        <linearGradient id="connection-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--accent-green))" stopOpacity="0.8" />
          <stop offset="100%" stopColor="hsl(var(--accent-green))" stopOpacity="0.4" />
        </linearGradient>
        
        {/* Glow filter */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {lines.map((line, i) => {
        const strokeColor = line.type === 'internet-switch' 
          ? 'hsl(142, 76%, 36%)' // accent-green equivalent
          : line.type === 'switch-cable'
            ? 'hsl(142, 76%, 36%)'
            : 'hsl(142, 76%, 36%)';
        
        const strokeOpacity = line.type === 'internet-switch' ? 0.8 : 0.6;
        const strokeWidth = line.type === 'internet-switch' ? 2 : 1.5;
        const strokeDasharray = line.type === 'cable-computer' ? '4,3' : 'none';
        
        return (
          <line
            key={i}
            x1={line.from.x}
            y1={line.from.y}
            x2={line.to.x}
            y2={line.to.y}
            stroke={strokeColor}
            strokeOpacity={strokeOpacity}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            filter="url(#glow)"
          />
        );
      })}
    </svg>
  );
}
