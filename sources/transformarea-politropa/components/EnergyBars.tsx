"use client";

import { fmtEnergy, fmtN, fmt } from "@/lib/format";
import { energyAt, type ProcessResult } from "@/lib/physics";

interface EnergyBarsProps {
  model: ProcessResult;
  progress: number;
}

interface Row {
  symbol: string;
  label: string;
  value: number;
  tone: string;
}

export function EnergyBars({ model, progress }: EnergyBarsProps) {
  const snapshot = energyAt(model, progress);
  const rows: Row[] = [
    { symbol: "Q", label: "căldură", value: snapshot.Q, tone: "q" },
    { symbol: "ΔU", label: "energie internă", value: snapshot.dU, tone: "du" },
    { symbol: "L", label: "lucru mecanic", value: snapshot.L, tone: "l" },
  ];
  const maxAbs = Math.max(
    Math.abs(model.Q),
    Math.abs(model.dU),
    Math.abs(model.L),
    1,
  );

  const capacity =
    !Number.isFinite(model.C)
      ? "∞"
      : Math.abs(model.C) > 1500
        ? "→ ±∞"
        : fmt(model.C, 2);

  return (
    <div className="energy-flow" aria-live="polite">
      <div className="energy-flow-head">
        <span className="card-kicker">fluxul de energie</span>
        <span className={`chip process-chip-${model.info.tone}`}>
          {model.info.name}
        </span>
      </div>

      <div className="energy-rows">
        {rows.map((row) => {
          const negative = row.value < 0;
          const width = Math.min(50, (Math.abs(row.value) / maxAbs) * 50);
          return (
            <div className="energy-row" key={row.symbol}>
              <div className="energy-row-label">
                <span className={`energy-symbol energy-symbol-${row.tone}`}>
                  {row.symbol}
                </span>
                <span>{row.label}</span>
              </div>
              <div className="energy-track">
                <span className="energy-zero" />
                {width > 0.2 ? (
                  <span
                    className={`energy-fill energy-fill-${row.tone} ${
                      negative ? "is-negative" : ""
                    }`}
                    style={{ width: `${width}%` }}
                  />
                ) : null}
              </div>
              <span className="energy-value">{fmtEnergy(row.value, 0)}</span>
            </div>
          );
        })}
      </div>

      <div className="energy-equation">
        <span className="energy-equation-formula">Q = ΔU + L</span>
        <span className="energy-equation-check">
          ≈ {Math.round(snapshot.Q)} J = {Math.round(snapshot.dU)} J +{" "}
          {Math.round(snapshot.L)} J
        </span>
      </div>

      <div className="energy-meta">
        <span>
          C = <strong>{capacity}</strong> J/(mol·K)
        </span>
        <span>
          n = <strong>{model.isochoric ? "→ ±∞" : fmtN(model.n)}</strong>
        </span>
        <span>
          T₂ = <strong>{Math.round(model.T2)} K</strong>
        </span>
      </div>
    </div>
  );
}
