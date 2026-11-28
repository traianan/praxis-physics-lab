import React from 'react';
import { CircuitMetrics, CircuitState } from '../types/physics';
import { formatCurrent, formatPower, formatResistance } from '../utils/physicsEngine';

interface ChartsPanelProps {
  state: CircuitState;
  metrics: CircuitMetrics;
}

export const ChartsPanel: React.FC<ChartsPanelProps> = ({ state, metrics }) => {
  const Ee = Math.max(0.1, metrics.equivalentEmfAbs);
  const re = Math.max(0.05, metrics.equivalentInternalR);
  const Isc = metrics.shortCircuitCurrent;
  const currentI = metrics.loadCurrentAbs;
  const currentU = metrics.terminalVoltage;
  const R = state.loadResistance;

  // Chart 1: U(I) = Ee - I * re
  const w1 = 440;
  const h1 = 230;
  const pad = { l: 48, r: 24, t: 24, b: 36 };
  const plotW = w1 - pad.l - pad.r;
  const plotH = h1 - pad.t - pad.b;

  const maxI = Math.max(Isc * 1.15, 0.5);
  const maxU = Math.max(Ee * 1.15, 1);

  const mapX1 = (iVal: number) => pad.l + (iVal / maxI) * plotW;
  const mapY1 = (uVal: number) => pad.t + plotH - (uVal / maxU) * plotH;

  // Chart 2: P_R(R) and efficiency eta(R)
  const maxR = Math.max(re * 5, R * 1.3, 10);
  const pMax = Math.max(metrics.maxTransferPower, 0.1);
  const samples = 50;
  const powerPoints: string[] = [];
  const effPoints: string[] = [];

  for (let k = 0; k <= samples; k++) {
    const rSample = (k / samples) * maxR;
    const iSample = Ee / (rSample + re);
    const pSample = iSample * iSample * rSample;
    const etaSample = (rSample / (rSample + re)) * 100;
    const px = pad.l + (rSample / maxR) * plotW;
    const pyP = pad.t + plotH - (pSample / (pMax * 1.15)) * plotH;
    const pyE = pad.t + plotH - (etaSample / 105) * plotH;
    powerPoints.push(`${k === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${pyP.toFixed(1)}`);
    effPoints.push(`${k === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${pyE.toFixed(1)}`);
  }

  const curPx = pad.l + (Math.min(R, maxR) / maxR) * plotW;
  const curPyP = pad.t + plotH - (metrics.loadPower / (pMax * 1.15)) * plotH;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Chart 1: External characteristic U(I) */}
      <div className="rounded-xl border border-[#E4E2D8] bg-[#FCFBF8] p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold text-[#17231E]">
            Caracteristica externă U(I) = E_e − I · r_e
          </h4>
          <span className="text-xs font-mono tabular-nums text-[#4E5D56]">
            I_sc = {formatCurrent(Isc)}
          </span>
        </div>
        <svg viewBox={`0 0 ${w1} ${h1}`} className="w-full h-auto">
          {/* Axes */}
          <line x1={pad.l} y1={pad.t} x2={pad.l} y2={h1 - pad.b} stroke="#94A3B8" strokeWidth={1.5} />
          <line x1={pad.l} y1={h1 - pad.b} x2={w1 - pad.r} y2={h1 - pad.b} stroke="#94A3B8" strokeWidth={1.5} />

          {/* Characteristic line from (0, Ee) to (Isc, 0) */}
          <line
            x1={mapX1(0)}
            y1={mapY1(Ee)}
            x2={mapX1(Isc)}
            y2={mapY1(0)}
            stroke="#0F4C3A"
            strokeWidth={2.8}
          />

          {/* Operating point */}
          <line
            x1={mapX1(currentI)}
            y1={mapY1(0)}
            x2={mapX1(currentI)}
            y2={mapY1(currentU)}
            stroke="#EA580C"
            strokeDasharray="4 3"
            strokeWidth={1.4}
          />
          <line
            x1={mapX1(0)}
            y1={mapY1(currentU)}
            x2={mapX1(currentI)}
            y2={mapY1(currentU)}
            stroke="#0284C7"
            strokeDasharray="4 3"
            strokeWidth={1.4}
          />
          <circle
            cx={mapX1(currentI)}
            cy={mapY1(currentU)}
            r={5.5}
            fill="#EA580C"
            stroke="#FFFFFF"
            strokeWidth={2}
          />

          {/* Intercept markers */}
          <circle cx={mapX1(0)} cy={mapY1(Ee)} r={4} fill="#0F4C3A" />
          <text x={pad.l - 6} y={mapY1(Ee) + 4} textAnchor="end" fontSize={10.5} fontWeight="700" fill="#0F4C3A">
            {Ee.toFixed(1)}V
          </text>
          <circle cx={mapX1(Isc)} cy={mapY1(0)} r={4} fill="#DC2626" />
          <text x={mapX1(Isc)} y={h1 - pad.b + 14} textAnchor="middle" fontSize={10} fontWeight="700" fill="#DC2626">
            I_sc
          </text>

          {/* Axis labels */}
          <text x={pad.l + plotW / 2} y={h1 - 6} textAnchor="middle" fontSize={11} fontWeight="600" fill="#475569">
            Curent I (A) — punct curent: {formatCurrent(currentI)}
          </text>
          <text
            x={14}
            y={pad.t + plotH / 2}
            textAnchor="middle"
            fontSize={11}
            fontWeight="600"
            fill="#475569"
            transform={`rotate(-90 14 ${pad.t + plotH / 2})`}
          >
            Tensiune U (V)
          </text>
        </svg>
        <p className="text-xs text-[#4E5D56] mt-1">
          Panta dreptei este chiar <span className="font-mono font-semibold">−r_e = −{re.toFixed(2)} Ω</span>. Cu cât r_e e mai mic, cu atât tensiunea la borne scade mai puțin în sarcină.
        </p>
      </div>

      {/* Chart 2: Power P(R) and Efficiency eta(R) */}
      <div className="rounded-xl border border-[#E4E2D8] bg-[#FCFBF8] p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold text-[#17231E]">
            Putere utilă P(R) și randament η(R)
          </h4>
          <span className="text-xs font-mono tabular-nums text-[#0F4C3A]">
            P_max = {formatPower(pMax)} la R = {formatResistance(re)}
          </span>
        </div>
        <svg viewBox={`0 0 ${w1} ${h1}`} className="w-full h-auto">
          <line x1={pad.l} y1={pad.t} x2={pad.l} y2={h1 - pad.b} stroke="#94A3B8" strokeWidth={1.5} />
          <line x1={pad.l} y1={h1 - pad.b} x2={w1 - pad.r} y2={h1 - pad.b} stroke="#94A3B8" strokeWidth={1.5} />

          {/* R = re vertical guide */}
          {re <= maxR && (
            <>
              <line
                x1={pad.l + (re / maxR) * plotW}
                y1={pad.t}
                x2={pad.l + (re / maxR) * plotW}
                y2={h1 - pad.b}
                stroke="#0F4C3A"
                strokeDasharray="3 3"
                strokeWidth={1.2}
                opacity={0.6}
              />
              <text
                x={pad.l + (re / maxR) * plotW + 4}
                y={pad.t + 12}
                fontSize={10}
                fontWeight="700"
                fill="#0F4C3A"
              >
                R = r_e
              </text>
            </>
          )}

          {/* Curves */}
          <path d={effPoints.join(' ')} fill="none" stroke="#0284C7" strokeWidth={2} strokeDasharray="5 3" />
          <path d={powerPoints.join(' ')} fill="none" stroke="#D97706" strokeWidth={2.8} />

          {/* Current R point */}
          {state.switchClosed && (
            <circle
              cx={curPx}
              cy={curPyP}
              r={5.5}
              fill="#D97706"
              stroke="#FFFFFF"
              strokeWidth={2}
            />
          )}

          {/* Legend */}
          <line x1={w1 - 140} y1={18} x2={w1 - 122} y2={18} stroke="#D97706" strokeWidth={2.8} />
          <text x={w1 - 116} y={22} fontSize={10} fontWeight="600" fill="#17231E">Putere P(R)</text>
          <line x1={w1 - 140} y1={34} x2={w1 - 122} y2={34} stroke="#0284C7" strokeWidth={2} strokeDasharray="4 2" />
          <text x={w1 - 116} y={38} fontSize={10} fontWeight="600" fill="#0284C7">Randament η</text>

          <text x={pad.l + plotW / 2} y={h1 - 6} textAnchor="middle" fontSize={11} fontWeight="600" fill="#475569">
            Rezistență de sarcină R (Ω) — R = {formatResistance(R)}
          </text>
          <text
            x={14}
            y={pad.t + plotH / 2}
            textAnchor="middle"
            fontSize={11}
            fontWeight="600"
            fill="#475569"
            transform={`rotate(-90 14 ${pad.t + plotH / 2})`}
          >
            P (W) / η (%)
          </text>
        </svg>
        <p className="text-xs text-[#4E5D56] mt-1">
          Puterea utilă atinge maximul la <span className="font-mono font-semibold">R = r_e</span> (η = 50%), în timp ce randamentul tinde spre 100% pentru <span className="font-mono font-semibold">R ≫ r_e</span>.
        </p>
      </div>
    </div>
  );
};
