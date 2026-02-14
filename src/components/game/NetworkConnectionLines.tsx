import { PlayerNetwork } from '@/types/game';
import { useLayoutEffect, useState, useRef, RefObject, useId } from 'react';

interface Line {
  from: { x: number; y: number };
  to: { x: number; y: number };
  type: 'internet-switch' | 'switch-cable' | 'cable-computer';
  branchIndex: number;
}

const BRANCH_COLORS = [
  'hsl(142, 76%, 36%)', // green
  'hsl(200, 80%, 50%)', // blue
  'hsl(280, 70%, 55%)', // purple
  'hsl(35, 90%, 55%)',  // orange
  'hsl(340, 75%, 55%)', // pink
];

interface NetworkConnectionLinesProps {
  network: PlayerNetwork;
  containerRef: RefObject<HTMLDivElement>;
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
  const filterId = useId().replace(/:/g, '_'); // Unique filter ID per instance

  useLayoutEffect(() => {
    const updateLines = () => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      setDimensions({ width: container.offsetWidth, height: container.offsetHeight });

      const newLines: Line[] = [];
      const internetEl = container.querySelector('[data-internet]');

      network.switches.forEach((sw, switchIndex) => {
        const switchEl = container.querySelector(`[data-equipment-id="${sw.id}"]`);

        if (internetEl && switchEl) {
          newLines.push({
            from: getBottomCenter(internetEl, container),
            to: getTopCenter(switchEl, container),
            type: 'internet-switch',
            branchIndex: switchIndex,
          });
        }

        sw.cables.forEach(cable => {
          const cableEl = container.querySelector(`[data-equipment-id="${cable.id}"]`);
          if (switchEl && cableEl) {
            newLines.push({
              from: getBottomCenter(switchEl, container),
              to: getTopCenter(cableEl, container),
              type: 'switch-cable',
              branchIndex: switchIndex,
            });
          }

          cable.computers.forEach(comp => {
            const compEl = container.querySelector(`[data-equipment-id="${comp.id}"]`);
            if (cableEl && compEl) {
              newLines.push({
                from: getBottomCenter(cableEl, container),
                to: getTopCenter(compEl, container),
                type: 'cable-computer',
                branchIndex: switchIndex,
              });
            }
          });
        });
      });

      setLines(newLines);
    };

    // Multiple update passes to catch layout settling
    updateLines();
    const resizeObserver = new ResizeObserver(updateLines);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    
    const t1 = setTimeout(updateLines, 50);
    const t2 = setTimeout(updateLines, 200);
    const t3 = setTimeout(updateLines, 500);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [network, containerRef]);

  if (lines.length === 0) return null;

  const glowId = `glow-${filterId}`;

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-0"
      width={dimensions.width}
      height={dimensions.height}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {lines.map((line, i) => {
        const color = BRANCH_COLORS[line.branchIndex % BRANCH_COLORS.length];
        const strokeOpacity = line.type === 'internet-switch' ? 0.85 : 0.7;
        const strokeWidth = line.type === 'internet-switch' ? 3 : line.type === 'switch-cable' ? 2.5 : 2;
        const strokeDasharray = line.type === 'cable-computer' ? '4,3' : 'none';

        const { from, to } = line;
        const midY = from.y + (to.y - from.y) * 0.5;
        const d = `M ${from.x} ${from.y} Q ${from.x} ${midY}, ${to.x} ${to.y}`;

        return (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={color}
            strokeOpacity={strokeOpacity}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeLinecap="round"
            filter={`url(#${glowId})`}
          />
        );
      })}
    </svg>
  );
}
