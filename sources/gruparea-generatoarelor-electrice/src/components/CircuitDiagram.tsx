import React from 'react';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { CircuitMetrics, CircuitState, GeneratorUnit } from '../types/physics';
import { formatCurrent, formatPower, formatResistance } from '../utils/physicsEngine';

interface CircuitDiagramProps {
  state: CircuitState;
  metrics: CircuitMetrics;
  onToggleSwitch: () => void;
  onTogglePolarity?: (generatorId: string) => void;
  animationSpeed?: number;
  reducedMotion?: boolean;
}

interface CellProps {
  x: number;
  y: number;
  gen: GeneratorUnit;
  wireColor?: string;
  orientation?: 'vertical' | 'horizontal';
  interactive?: boolean;
  onClick?: () => void;
}

/**
 * Simbolul unui generator electric real:
 * Rezistenta interna r NU este desenata ca un rezistor exterior separat,
 * ci este inclusa conceptual in interiorul generatorului (chenar discret al sursei).
 */
const GeneratorCellSvg: React.FC<CellProps> = ({
  x,
  y,
  gen,
  wireColor = '#D97706',
  orientation = 'horizontal',
  interactive = false,
  onClick,
}) => {
  const rev = Boolean(gen.reversed);

  if (orientation === 'vertical') {
    // Vertical cell on left wire (top = + if not reversed, bottom = -)
    return (
      <g
        transform={`translate(${x}, ${y})`}
        onClick={onClick}
        className={interactive ? 'cursor-pointer group' : ''}
      >
        {/* Subtle enclosure representing the physical generator housing (E and r internal) */}
        <rect
          x={-34}
          y={-30}
          width={68}
          height={60}
          rx={8}
          fill={rev ? '#FEF2F2' : '#F4F8F6'}
          stroke={rev ? '#DC2626' : '#0F4C3A'}
          strokeWidth={1.25}
          strokeDasharray="4 3"
        />
        {/* Break wire behind plates */}
        <rect x={-16} y={-11} width={32} height={22} fill={rev ? '#FEF2F2' : '#F4F8F6'} />
        {/* Visible leads connect both terminals to the surrounding circuit. */}
        <line x1={0} y1={-30} x2={0} y2={-6} stroke={wireColor} strokeWidth={2.5} />
        <line x1={0} y1={6} x2={0} y2={30} stroke={wireColor} strokeWidth={2.5} />
        {/* Top plate: + if normal (long thin), - if reversed (short thick) */}
        {!rev ? (
          <>
            <line x1={-15} y1={-6} x2={15} y2={-6} stroke="#0F4C3A" strokeWidth={2.2} />
            <line x1={-8} y1={6} x2={8} y2={6} stroke="#0F4C3A" strokeWidth={4.2} />
            <text x={-24} y={-10} fontSize={11} fontWeight="700" fill="#0F4C3A">
              +
            </text>
            <text x={-23} y={16} fontSize={12} fontWeight="700" fill="#475569">
              −
            </text>
          </>
        ) : (
          <>
            <line x1={-8} y1={-6} x2={8} y2={-6} stroke="#DC2626" strokeWidth={4.2} />
            <line x1={-15} y1={6} x2={15} y2={6} stroke="#DC2626" strokeWidth={2.2} />
            <text x={-23} y={-10} fontSize={12} fontWeight="700" fill="#DC2626">
              −
            </text>
            <text x={-24} y={16} fontSize={11} fontWeight="700" fill="#DC2626">
              +
            </text>
          </>
        )}
        {/* E and r labels strictly inside/on the source */}
        <text x={42} y={-5} fontSize={12} fontWeight="700" fill="#0F172A">
          E = {gen.emf} V
        </text>
        <text x={42} y={12} fontSize={11.5} fontWeight="600" fill="#475569">
          r = {gen.internalResistance} Ω
        </text>
      </g>
    );
  }

  // Horizontal cell (left = + if normal, right = -)
  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      className={interactive ? 'cursor-pointer group' : ''}
      role={interactive ? 'button' : undefined}
      aria-label={interactive ? `Inversează polaritatea pentru ${gen.label}` : undefined}
    >
      <rect
        x={-28}
        y={-22}
        width={56}
        height={44}
        rx={7}
        fill={rev ? '#FEF2F2' : '#F4F8F6'}
        stroke={rev ? '#DC2626' : '#0F4C3A'}
        strokeWidth={1.25}
        strokeDasharray="3.5 2.5"
      />
      <rect x={-10} y={-14} width={20} height={28} fill={rev ? '#FEF2F2' : '#F4F8F6'} />
      {/* Visible leads connect each terminal plate to the circuit on both sides. */}
      <line x1={-28} y1={0} x2={-6} y2={0} stroke={wireColor} strokeWidth={2.5} />
      <line x1={6} y1={0} x2={28} y2={0} stroke={wireColor} strokeWidth={2.5} />
      {!rev ? (
        <>
          <line x1={-6} y1={-13} x2={-6} y2={13} stroke="#0F4C3A" strokeWidth={2.2} />
          <line x1={6} y1={-7} x2={6} y2={7} stroke="#0F4C3A" strokeWidth={4} />
          <text x={-18} y={-8} fontSize={10} fontWeight="700" fill="#0F4C3A">
            +
          </text>
          <text x={12} y={-8} fontSize={10.5} fontWeight="700" fill="#475569">
            −
          </text>
        </>
      ) : (
        <>
          <line x1={-6} y1={-7} x2={-6} y2={7} stroke="#DC2626" strokeWidth={4} />
          <line x1={6} y1={-13} x2={6} y2={13} stroke="#DC2626" strokeWidth={2.2} />
          <text x={-17} y={-8} fontSize={10.5} fontWeight="700" fill="#DC2626">
            −
          </text>
          <text x={11} y={-8} fontSize={10} fontWeight="700" fill="#DC2626">
            +
          </text>
        </>
      )}
      <text x={0} y={34} textAnchor="middle" fontSize={10.5} fontWeight="700" fill="#0F172A">
        {gen.label}: {gen.emf}V
      </text>
      <text x={0} y={46} textAnchor="middle" fontSize={9.5} fontWeight="500" fill="#475569">
        r = {gen.internalResistance}Ω{rev ? ' (op.)' : ''}
      </text>
    </g>
  );
};

const AnimatedFlowDots: React.FC<{
  pathD: string;
  currentAmps: number;
  flowMode: 'conventional' | 'electrons';
  active: boolean;
  count?: number;
  speedMultiplier?: number;
  reducedMotion?: boolean;
}> = ({
  pathD,
  currentAmps,
  flowMode,
  active,
  count = 6,
  speedMultiplier = 1,
  reducedMotion = false,
}) => {
  if (!active || Math.abs(currentAmps) < 1e-4 || reducedMotion) return null;

  // Direction: conventional (+ -> -) follows positive current; electrons (- -> +) moves opposite
  const forward = flowMode === 'conventional' ? currentAmps >= 0 : currentAmps < 0;
  const absI = Math.abs(currentAmps);
  // Map current to duration smoothly (faster when current is higher)
  const durationSec = Math.max(1.2, Math.min(7, 4.5 / (Math.sqrt(absI) + 0.45))) / speedMultiplier;
  const color = flowMode === 'conventional' ? '#EA580C' : '#0284C7';

  return (
    <g aria-hidden="true">
      {Array.from({ length: count }).map((_, idx) => {
        const begin = `-${((idx / count) * durationSec).toFixed(2)}s`;
        return (
          <circle key={idx} r={3.6} fill={color} opacity={0.9}>
            <animateMotion
              dur={`${durationSec.toFixed(2)}s`}
              repeatCount="indefinite"
              begin={begin}
              path={pathD}
              keyPoints={forward ? '0;1' : '1;0'}
              keyTimes="0;1"
              calcMode="linear"
            />
          </circle>
        );
      })}
    </g>
  );
};

export const CircuitDiagram: React.FC<CircuitDiagramProps> = ({
  state,
  metrics,
  onToggleSwitch,
  onTogglePolarity,
  animationSpeed = 1,
  reducedMotion = false,
}) => {
  const { topology, switchClosed, loadResistance, flowMode, generators, mixedBranches } = state;

  // Compute SVG geometry cleanly per topology
  const wireColor = switchClosed ? '#D97706' : '#94A3B8';
  const loadResistorY = topology === 'parallel' || topology === 'mixed' ? 300 : 250;
  const svgHeight = topology === 'parallel' || topology === 'mixed' ? 360 : 310;

  return (
    <div className="space-y-3">
      {/* Main Interactive SVG Canvas */}
      <div className="relative w-full overflow-hidden rounded-xl border border-[#E4E2D8] bg-[#FCFBF8]">
        <svg
          viewBox={`0 0 680 ${svgHeight}`}
          className="w-full h-auto select-none touch-manipulation"
          role="img"
          aria-label="Schema interactivă a circuitului cu generatoare electrice"
        >
          {/* Subtle technical grid */}
          <defs>
            <pattern id="lab-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path
                d="M 24 0 L 0 0 0 24"
                fill="none"
                stroke="#EFECE3"
                strokeWidth="0.7"
              />
            </pattern>
          </defs>
          <rect width="680" height={svgHeight} fill="url(#lab-grid)" />

          {/* ================= TOPOLOGY: BASIC (SINGLE GENERATOR) ================= */}
          {topology === 'basic' && (
            <g>
              {/* Main loop wire */}
              <path
                d="M 130 70 L 550 70 L 550 250 L 130 250 Z"
                fill="none"
                stroke={wireColor}
                strokeWidth={3}
                strokeLinejoin="round"
              />
              <AnimatedFlowDots
                pathD="M 130 70 L 550 70 L 550 250 L 130 250 Z"
                currentAmps={metrics.loadCurrent}
                flowMode={flowMode}
                active={switchClosed}
                count={10}
                speedMultiplier={animationSpeed}
                reducedMotion={reducedMotion}
              />
              {/* Generator on left branch */}
              <GeneratorCellSvg
                x={130}
                y={160}
                gen={generators[0]}
                wireColor={wireColor}
                orientation="vertical"
              />
            </g>
          )}

          {/* ================= TOPOLOGY: SERIES (n GENERATORS ON TOP/LEFT) ================= */}
          {topology === 'series' && (
            <g>
              {/* Outer loop */}
              <path
                d="M 90 100 L 590 100 L 590 250 L 90 250 Z"
                fill="none"
                stroke={wireColor}
                strokeWidth={3}
                strokeLinejoin="round"
              />
              <AnimatedFlowDots
                pathD="M 90 100 L 590 100 L 590 250 L 90 250 Z"
                currentAmps={metrics.loadCurrent}
                flowMode={flowMode}
                active={switchClosed}
                count={10}
                speedMultiplier={animationSpeed}
                reducedMotion={reducedMotion}
              />
              {/* Series generator bank along top-left horizontal segment */}
              {generators.map((g, idx) => {
                const count = generators.length;
                const startX = count === 1 ? 210 : count === 2 ? 175 : count === 3 ? 145 : 135;
                const step = count <= 2 ? 95 : count === 3 ? 85 : 74;
                return (
                  <GeneratorCellSvg
                    key={g.id}
                    x={startX + idx * step}
                    y={100}
                    gen={g}
                    wireColor={wireColor}
                    orientation="horizontal"
                    interactive={Boolean(onTogglePolarity)}
                    onClick={() => onTogglePolarity?.(g.id)}
                  />
                );
              })}
              {/* Equivalent label badge */}
              <text x={96} y={36} fontSize={11.5} fontWeight="600" fill="#0F4C3A">
                E_e = {metrics.equivalentEmf.toFixed(1)} V · r_e = {metrics.equivalentInternalR.toFixed(2)} Ω
                {onTogglePolarity ? ' (apasă pe o sursă pentru polaritate)' : ''}
              </text>
            </g>
          )}

          {/* ================= TOPOLOGY: PARALLEL (m BRANCHES) ================= */}
          {topology === 'parallel' && (
            <g>
              {/* Left busbar & right busbar feeding load at bottom */}
              {(() => {
                const count = generators.length;
                const branchYs =
                  count === 2
                    ? [62, 134]
                    : count === 3
                    ? [48, 108, 168]
                    : [42, 92, 142, 192];
                const topY = branchYs[0];
                const botBranchY = branchYs[branchYs.length - 1];

                return (
                  <>
                    {/* Busbars connecting parallel branches down to load loop */}
                    <path
                      d={`M 140 ${topY} L 140 300 L 560 300 L 560 110 L 420 110`}
                      fill="none"
                      stroke={wireColor}
                      strokeWidth={3}
                      strokeLinejoin="round"
                    />
                    {/* Right collector rail of parallel bank */}
                    <line
                      x1={420}
                      y1={topY}
                      x2={420}
                      y2={botBranchY}
                      stroke={wireColor}
                      strokeWidth={3}
                    />
                    {/* Left collector rail upper extension */}
                    <line
                      x1={140}
                      y1={topY}
                      x2={140}
                      y2={botBranchY}
                      stroke={wireColor}
                      strokeWidth={3}
                    />

                    {/* Main load loop animated dots */}
                    <AnimatedFlowDots
                      pathD={`M 140 110 L 140 300 L 560 300 L 560 110 L 420 110`}
                      currentAmps={metrics.loadCurrent}
                      flowMode={flowMode}
                      active={switchClosed}
                      count={8}
                      speedMultiplier={animationSpeed}
                      reducedMotion={reducedMotion}
                    />

                    {/* Individual parallel generator branches */}
                    {generators.map((g, idx) => {
                      const by = branchYs[idx];
                      const branchRes = metrics.branchResults[idx];
                      const bCurrent = branchRes?.current ?? 0;
                      const branchActive = switchClosed || metrics.hasCirculatingCurrent;
                      const branchWireColor = branchActive && Math.abs(bCurrent) > 0.01 ? '#D97706' : '#94A3B8';

                      return (
                        <g key={g.id}>
                          <line
                            x1={140}
                            y1={by}
                            x2={420}
                            y2={by}
                            stroke={branchWireColor}
                            strokeWidth={2.5}
                          />
                          <AnimatedFlowDots
                            pathD={`M 420 ${by} L 140 ${by}`}
                            currentAmps={bCurrent}
                            flowMode={flowMode}
                            active={branchActive}
                            count={3}
                            speedMultiplier={animationSpeed}
                            reducedMotion={reducedMotion}
                          />
                          <GeneratorCellSvg
                            x={280}
                            y={by}
                            gen={g}
                            wireColor={branchWireColor}
                            orientation="horizontal"
                            interactive={Boolean(onTogglePolarity)}
                            onClick={() => onTogglePolarity?.(g.id)}
                          />
                          {/* Branch current readout */}
                          <text
                            x={365}
                            y={by - 10}
                            fontSize={10.5}
                            fontWeight="700"
                            fill={bCurrent < -0.01 ? '#DC2626' : '#0F4C3A'}
                          >
                            I{idx + 1}: {formatCurrent(bCurrent)}
                          </text>
                        </g>
                      );
                    })}
                    {/* Node indicators A and B */}
                    <circle cx={140} cy={110} r={4.5} fill="#0F4C3A" />
                    <circle cx={420} cy={110} r={4.5} fill="#0F4C3A" />
                  </>
                );
              })()}
            </g>
          )}

          {/* ================= TOPOLOGY: MIXED (m BRANCHES x n IN SERIES) ================= */}
          {topology === 'mixed' && (
            <g>
              {(() => {
                const mCount = mixedBranches.length;
                const branchYs =
                  mCount === 1
                    ? [100]
                    : mCount === 2
                    ? [64, 150]
                    : mCount === 3
                    ? [48, 114, 180]
                    : [42, 94, 146, 198];
                const topY = branchYs[0];
                const botY = branchYs[branchYs.length - 1];

                return (
                  <>
                    {/* Outer return loop */}
                    <path
                      d={`M 95 ${topY} L 95 300 L 585 300 L 585 110 L 455 110`}
                      fill="none"
                      stroke={wireColor}
                      strokeWidth={3}
                      strokeLinejoin="round"
                    />
                    <line x1={455} y1={topY} x2={455} y2={botY} stroke={wireColor} strokeWidth={3} />
                    <AnimatedFlowDots
                      pathD={`M 95 110 L 95 300 L 585 300 L 585 110 L 455 110`}
                      currentAmps={metrics.loadCurrent}
                      flowMode={flowMode}
                      active={switchClosed}
                      count={8}
                      speedMultiplier={animationSpeed}
                      reducedMotion={reducedMotion}
                    />

                    {mixedBranches.map((branch, mIdx) => {
                      const by = branchYs[mIdx];
                      const nCount = branch.generators.length;
                      const bRes = metrics.branchResults[mIdx];
                      const bCurrent = bRes?.current ?? 0;
                      const branchActive = switchClosed || metrics.hasCirculatingCurrent;
                      const branchWireColor = branchActive && Math.abs(bCurrent) > 0.01 ? '#D97706' : '#94A3B8';
                      const span = 300;
                      const step = span / (nCount + 1);

                      return (
                        <g key={branch.id}>
                          <line
                            x1={95}
                            y1={by}
                            x2={455}
                            y2={by}
                            stroke={branchWireColor}
                            strokeWidth={2.5}
                          />
                          <AnimatedFlowDots
                            pathD={`M 455 ${by} L 95 ${by}`}
                            currentAmps={bCurrent}
                            flowMode={flowMode}
                            active={branchActive}
                            count={3}
                            speedMultiplier={animationSpeed}
                            reducedMotion={reducedMotion}
                          />
                          {branch.generators.map((g, nIdx) => (
                            <GeneratorCellSvg
                              key={g.id}
                              x={120 + step * (nIdx + 1)}
                              y={by}
                              gen={g}
                              wireColor={branchWireColor}
                              orientation="horizontal"
                            />
                          ))}
                          <text x={464} y={by + 4} fontSize={10} fontWeight="700" fill="#0F4C3A">
                            I{mIdx + 1}={formatCurrent(bCurrent)}
                          </text>
                        </g>
                      );
                    })}
                    <circle cx={95} cy={110} r={4.5} fill="#0F4C3A" />
                    <circle cx={455} cy={110} r={4.5} fill="#0F4C3A" />
                  </>
                );
              })()}
            </g>
          )}

          {/* ================= SHARED SWITCH K (CLICKABLE) ================= */}
          {(() => {
            const kx = topology === 'parallel' || topology === 'mixed' ? 500 : 455;
            const ky = topology === 'basic' ? 70 : topology === 'series' ? 100 : 110;
            return (
              <g
                transform={`translate(${kx}, ${ky})`}
                onClick={onToggleSwitch}
                className="cursor-pointer"
                role="button"
                aria-label={switchClosed ? 'Deschide întrerupătorul K' : 'Închide întrerupătorul K'}
              >
                <rect x={-38} y={-28} width={76} height={42} rx={8} fill="transparent" />
                {/* Clear wire behind switch */}
                <line x1={-24} y1={0} x2={24} y2={0} stroke="#FCFBF8" strokeWidth={8} />
                <circle cx={-22} cy={0} r={4} fill="#0F4C3A" />
                <circle cx={22} cy={0} r={4} fill="#0F4C3A" />
                {switchClosed ? (
                  <line x1={-22} y1={0} x2={22} y2={0} stroke="#0F4C3A" strokeWidth={3.2} />
                ) : (
                  <line x1={-22} y1={0} x2={18} y2={-18} stroke="#DC2626" strokeWidth={3.2} />
                )}
                <text
                  x={0}
                  y={-22}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight="700"
                  fill={switchClosed ? '#0F4C3A' : '#DC2626'}
                >
                  K: {switchClosed ? 'ÎNCHIS' : 'DESCHIS'}
                </text>
              </g>
            );
          })()}

          {/* ================= AMMETER (A) ================= */}
          {(() => {
            const ax = topology === 'parallel' || topology === 'mixed' ? 568 : 550;
            const ay = topology === 'parallel' || topology === 'mixed' ? 205 : 160;
            return (
              <g transform={`translate(${ax}, ${ay})`}>
                <circle cx={0} cy={0} r={20} fill="#FFFFFF" stroke="#0F172A" strokeWidth={2} />
                <text x={0} y={5} textAnchor="middle" fontSize={14} fontWeight="800" fill="#0F172A">
                  A
                </text>
                <text
                  x={0}
                  y={36}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight="700"
                  fill="#C2410C"
                  className="tabular-nums"
                >
                  {formatCurrent(metrics.loadCurrentAbs)}
                </text>
              </g>
            );
          })()}

          {/* ================= LOAD RESISTOR (R) + VOLTMETER (V) ================= */}
          {(() => {
            const rx = 340;
            const ry = loadResistorY;
            const vy = ry - 64;
            return (
              <g>
                {/* Voltmeter parallel branch */}
                <path
                  d={`M ${rx - 80} ${ry} L ${rx - 80} ${vy} L ${rx + 80} ${vy} L ${rx + 80} ${ry}`}
                  fill="none"
                  stroke="#64748B"
                  strokeWidth={1.6}
                />
                <circle cx={rx - 80} cy={ry} r={3.5} fill="#0F172A" />
                <circle cx={rx + 80} cy={ry} r={3.5} fill="#0F172A" />
                <g transform={`translate(${rx}, ${vy})`}>
                  <circle cx={0} cy={0} r={19} fill="#FFFFFF" stroke="#0284C7" strokeWidth={2} />
                  <text x={0} y={5} textAnchor="middle" fontSize={13} fontWeight="800" fill="#0284C7">
                    V
                  </text>
                  <text
                    x={0}
                    y={-26}
                    textAnchor="middle"
                    fontSize={13}
                    fontWeight="700"
                    fill="#0284C7"
                    className="tabular-nums"
                  >
                    U = {metrics.terminalVoltage.toFixed(2)} V
                  </text>
                </g>

                {/* Load Resistor R */}
                <g transform={`translate(${rx}, ${ry})`}>
                  <rect
                    x={-48}
                    y={-13}
                    width={96}
                    height={26}
                    rx={6}
                    fill="#F5E6C8"
                    stroke="#78350F"
                    strokeWidth={2}
                  />
                  {/* Color bands for visual polish */}
                  <rect x={-32} y={-12} width={6} height={24} fill="#B91C1C" />
                  <rect x={-16} y={-12} width={6} height={24} fill="#1E293B" />
                  <rect x={0} y={-12} width={6} height={24} fill="#D97706" />
                  <rect x={26} y={-12} width={5} height={24} fill="#CA8A04" />

                  <text x={0} y={-21} textAnchor="middle" fontSize={12.5} fontWeight="700" fill="#0F172A">
                    R = {formatResistance(loadResistance)}
                  </text>
                  <text
                    x={0}
                    y={31}
                    textAnchor="middle"
                    fontSize={11.5}
                    fontWeight="600"
                    fill="#9A3412"
                    className="tabular-nums"
                  >
                    P_R = {formatPower(metrics.loadPower)} · η = {metrics.efficiency.toFixed(0)}%
                  </text>
                </g>
              </g>
            );
          })()}
        </svg>
      </div>

      {/* Physical state alerts (matching Praxis reference red/amber banner) */}
      {metrics.warnings.length > 0 && (
        <div className="space-y-2">
          {metrics.warnings.map((w, i) => (
            <div
              key={i}
              className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${
                w.level === 'danger'
                  ? 'border-red-200 bg-red-50/90 text-red-900'
                  : w.level === 'warning'
                  ? 'border-amber-200 bg-amber-50/90 text-amber-900'
                  : 'border-sky-200 bg-sky-50/90 text-sky-900'
              }`}
            >
              {w.level === 'danger' ? (
                <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
              ) : w.level === 'warning' ? (
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
              ) : (
                <Info className="w-4 h-4 mt-0.5 shrink-0 text-sky-600" />
              )}
              <div>
                <span className="font-semibold">{w.title}: </span>
                <span>{w.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
