import { Cable, Monitor, Bitcoin } from 'lucide-react';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import './ElectricProgressBar.css';

interface Step {
  label: string;
  icon: React.ReactNode | 'logo';
  hue: number;
  sat: number;
}

const STEPS: Step[] = [
  { label: 'Wired', icon: 'logo', hue: 185, sat: 80 },
  { label: 'Connect', icon: <Cable className="w-5 h-5 sm:w-6 sm:h-6" />, hue: 140, sat: 70 },
  { label: 'Plan', icon: <Monitor className="w-5 h-5 sm:w-6 sm:h-6" />, hue: 0, sat: 70 },
  { label: 'Mine', icon: <Bitcoin className="w-5 h-5 sm:w-6 sm:h-6" />, hue: 45, sat: 85 },
];

const STEP_DURATION = 1200;
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

const SparkParticles = ({ active, hue, sat }: { active: boolean; hue: number; sat: number }) => {
  const sparks = useMemo(() => {
    return Array.from({ length: SPARK_COUNT }, (_, i) => {
      const angle = ((360 / SPARK_COUNT) * i + Math.random() * 30 - 15) * (Math.PI / 180);
      const distance = 20 + Math.random() * 25;
      return {
        tx: Math.cos(angle) * distance,
        ty: Math.sin(angle) * distance,
        delay: Math.random() * 100,
        size: 2 + Math.random() * 2,
      };
    });
  }, [active]);

  if (!active) return null;

  return (
    <div className="spark-container">
      {sparks.map((s, i) => (
        <div
          key={i}
          className="spark-particle"
          style={{
            '--tx': `${s.tx}px`,
            '--ty': `${s.ty}px`,
            '--size': `${s.size}px`,
            '--spark-hue': hue,
            '--spark-sat': `${sat}%`,
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
  const [completedBolts, setCompletedBolts] = useState<Set<number>>(new Set());
  const [running, setRunning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nodePositions = useMemo(() => {
    return STEPS.map((_, i) => (i / (STEPS.length - 1)) * 100);
  }, []);

  const advanceStep = useCallback(() => {
    const next = activeStep + 1;

    if (next >= STEPS.length) {
      // Add final bolt to completed, then hold 1s before reset
      setCompletedBolts(prev => new Set(prev).add(activeStep));
      setBoltIndex(-1);
      timerRef.current = setTimeout(() => {
        setActiveStep(0);
        setCompletedSteps(new Set([0]));
        setTransitioning(false);
        setBoltIndex(-1);
        setChargingNode(-1);
        setCompletedBolts(new Set());
        setBoltPaths([]);
      }, 1000);
      return;
    }

    setTransitioning(true);
    setBoltIndex(activeStep);
    const fromX = nodePositions[activeStep] * 10;
    const toX = nodePositions[next] * 10;
    setBoltPaths(prev => {
      const newPaths = [...prev];
      newPaths[activeStep] = generateLightningPath(fromX, toX);
      return newPaths;
    });

    setTimeout(() => {
      setChargingNode(next);
    }, BOLT_DURATION * 0.6);

    setTimeout(() => {
      setCompletedBolts(prev => new Set(prev).add(activeStep));
      setActiveStep(next);
      setCompletedSteps(prev => new Set(prev).add(next));
      setTransitioning(false);
      setBoltIndex(-1);
      setChargingNode(-1);
    }, BOLT_DURATION);
  }, [activeStep, nodePositions]);

  useEffect(() => {
    if (!running) return;
    timerRef.current = setTimeout(advanceStep, STEP_DURATION);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeStep, running, advanceStep]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActiveStep(0);
          setCompletedSteps(new Set([0]));
          setTransitioning(false);
          setBoltIndex(-1);
          setChargingNode(-1);
          setRunning(true);
        } else {
          setRunning(false);
          setCompletedBolts(new Set());
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
            const destStep = STEPS[i + 1];

            const isCompleted = completedBolts.has(i);
            const isVisible = isActive || isCompleted;

            return (
              <g key={i} opacity={isVisible ? 1 : 0}>
                <path
                  d={path}
                  fill="none"
                  stroke={`hsl(${destStep.hue}, ${destStep.sat}%, 60%)`}
                  strokeWidth="4"
                  filter="url(#bolt-glow)"
                  strokeDasharray={pathLength}
                  strokeDashoffset={isCompleted ? 0 : (isActive ? 0 : pathLength)}
                  className={isActive ? 'bolt-animate' : isCompleted ? 'bolt-static' : ''}
                  style={{ '--path-length': pathLength } as React.CSSProperties}
                />
                <path
                  d={path}
                  fill="none"
                  stroke={`hsl(${destStep.hue}, ${destStep.sat}%, 80%)`}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={pathLength}
                  strokeDashoffset={isCompleted ? 0 : (isActive ? 0 : pathLength)}
                  className={isActive ? 'bolt-animate' : isCompleted ? 'bolt-static' : ''}
                  style={{ '--path-length': pathLength } as React.CSSProperties}
                />
              </g>
            );
          })}
        </svg>

        {STEPS.map((step, i) => {
          const isCompleted = completedSteps.has(i);
          const isActive = activeStep === i;
          const isCharging = chargingNode === i;
          const isInactive = !isCompleted && !isActive && !isCharging;

          return (
            <div
              key={i}
              className={`stepper-node ${isActive ? 'active' : ''} ${isCompleted && !isActive ? 'completed' : ''} ${isCharging ? 'charging' : ''} ${isInactive ? 'inactive' : ''}`}
              style={{
                left: `${nodePositions[i]}%`,
                '--node-hue': step.hue,
                '--node-sat': `${step.sat}%`,
              } as React.CSSProperties}
            >
              {(isActive || isCharging) && <div className="node-bloom" />}

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

              <SparkParticles active={isCharging} hue={step.hue} sat={step.sat} />

              <span className="node-label">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ElectricProgressBar;
