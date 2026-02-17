import { Cable, Monitor, Bitcoin } from 'lucide-react';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import './ElectricProgressBar.css';

interface Step {
  label: string;
  icon: React.ReactNode | 'logo';
}

const STEPS: Step[] = [
  { label: 'Wired', icon: 'logo' },
  { label: 'Connect', icon: <Cable className="w-5 h-5 sm:w-6 sm:h-6" /> },
  { label: 'Plan', icon: <Monitor className="w-5 h-5 sm:w-6 sm:h-6" /> },
  { label: 'Mine', icon: <Bitcoin className="w-5 h-5 sm:w-6 sm:h-6" /> },
];

const STEP_DURATION = 1800;
const BOLT_DURATION = 400;
const SPARK_COUNT = 8;

function generateLightningPath(x1: number, x2: number, segments = 7): string {
  const points: [number, number][] = [[x1, 0]];
  const dx = (x2 - x1) / segments;
  for (let i = 1; i < segments; i++) {
    const x = x1 + dx * i;
    const y = (Math.random() - 0.5) * 18;
    points.push([x, y]);
  }
  points.push([x2, 0]);
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
}

const SparkParticles = ({ active }: { active: boolean }) => {
  const sparks = useMemo(() => {
    return Array.from({ length: SPARK_COUNT }, (_, i) => ({
      angle: (360 / SPARK_COUNT) * i + Math.random() * 30 - 15,
      distance: 20 + Math.random() * 25,
      delay: Math.random() * 100,
      size: 2 + Math.random() * 2,
    }));
  }, [active]); // regenerate on each activation

  if (!active) return null;

  return (
    <div className="spark-container">
      {sparks.map((s, i) => (
        <div
          key={i}
          className="spark-particle"
          style={{
            '--angle': `${s.angle}deg`,
            '--distance': `${s.distance}px`,
            '--size': `${s.size}px`,
            animationDelay: `${s.delay}ms`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

const ElectricProgressBar = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set([0]));
  const [transitioning, setTransitioning] = useState(false);
  const [boltIndex, setBoltIndex] = useState(-1);
  const [chargingNode, setChargingNode] = useState(-1);
  const [boltPaths, setBoltPaths] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisibleRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nodePositions = useMemo(() => {
    // Percentage positions for each node
    return STEPS.map((_, i) => (i / (STEPS.length - 1)) * 100);
  }, []);

  const advanceStep = useCallback(() => {
    if (!isVisibleRef.current) return;

    const next = activeStep + 1;

    if (next >= STEPS.length) {
      // All done, pause then reset
      timerRef.current = setTimeout(() => {
        setActiveStep(0);
        setCompletedSteps(new Set([0]));
        setTransitioning(false);
        setBoltIndex(-1);
        setChargingNode(-1);
      }, STEP_DURATION);
      return;
    }

    // Fire lightning bolt
    setTransitioning(true);
    setBoltIndex(activeStep);
    // Generate new random path for this bolt
    const svgWidth = 100; // percentage-based
    const fromX = nodePositions[activeStep] * (svgWidth / 100) * 10;
    const toX = nodePositions[next] * (svgWidth / 100) * 10;
    setBoltPaths(prev => {
      const newPaths = [...prev];
      newPaths[activeStep] = generateLightningPath(fromX, toX);
      return newPaths;
    });

    // After bolt lands, charge up destination
    setTimeout(() => {
      setChargingNode(next);
    }, BOLT_DURATION * 0.6);

    // Complete transition
    setTimeout(() => {
      setActiveStep(next);
      setCompletedSteps(prev => new Set(prev).add(next));
      setTransitioning(false);
      setBoltIndex(-1);
      setChargingNode(-1);
    }, BOLT_DURATION);
  }, [activeStep, nodePositions]);

  useEffect(() => {
    if (!isVisibleRef.current) return;
    timerRef.current = setTimeout(advanceStep, STEP_DURATION);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeStep, advanceStep]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          // Reset and start
          setActiveStep(0);
          setCompletedSteps(new Set([0]));
          setTransitioning(false);
          setBoltIndex(-1);
          setChargingNode(-1);
        } else {
          if (timerRef.current) clearTimeout(timerRef.current);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="stepper-container">
      <div className="stepper-track">
        {/* Connection lines between nodes */}
        <div className="stepper-line" />

        {/* SVG overlay for lightning bolts */}
        <svg className="lightning-svg" viewBox="0 -15 1000 30" preserveAspectRatio="none">
          <defs>
            <filter id="bolt-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          {STEPS.slice(0, -1).map((_, i) => {
            const isActive = boltIndex === i;
            const fromX = nodePositions[i] * 10;
            const toX = nodePositions[i + 1] * 10;
            const path = boltPaths[i] || generateLightningPath(fromX, toX);
            const pathLength = 1200;

            return (
              <g key={i} opacity={isActive ? 1 : 0}>
                {/* Glow layer */}
                <path
                  d={path}
                  fill="none"
                  stroke="hsl(185, 80%, 60%)"
                  strokeWidth="4"
                  filter="url(#bolt-glow)"
                  strokeDasharray={pathLength}
                  strokeDashoffset={isActive ? 0 : pathLength}
                  className={isActive ? 'bolt-animate' : ''}
                  style={{ '--path-length': pathLength } as React.CSSProperties}
                />
                {/* Core bolt */}
                <path
                  d={path}
                  fill="none"
                  stroke="hsl(185, 90%, 80%)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={pathLength}
                  strokeDashoffset={isActive ? 0 : pathLength}
                  className={isActive ? 'bolt-animate' : ''}
                  style={{ '--path-length': pathLength } as React.CSSProperties}
                />
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        {STEPS.map((step, i) => {
          const isCompleted = completedSteps.has(i);
          const isActive = activeStep === i;
          const isCharging = chargingNode === i;
          const isInactive = !isCompleted && !isActive && !isCharging;

          return (
            <div
              key={i}
              className={`stepper-node ${isActive ? 'active' : ''} ${isCompleted && !isActive ? 'completed' : ''} ${isCharging ? 'charging' : ''} ${isInactive ? 'inactive' : ''}`}
              style={{ left: `${nodePositions[i]}%` }}
            >
              {/* Radial bloom */}
              {(isActive || isCharging) && <div className="node-bloom" />}

              {/* Node ring */}
              <div className="node-ring">
                <div className="node-icon">
                  {step.icon === 'logo' ? (
                    <img
                      src="/wire-logo-official.png"
                      alt="WIRED"
                      className="w-6 h-6 sm:w-7 sm:h-7 object-contain"
                    />
                  ) : (
                    step.icon
                  )}
                </div>
              </div>

              {/* Spark particles */}
              <SparkParticles active={isCharging} />

              {/* Label */}
              <span className="node-label">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ElectricProgressBar;
