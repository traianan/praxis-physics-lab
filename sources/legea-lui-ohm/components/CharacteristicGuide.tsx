import { useId } from "react";

interface CharacteristicGuideProps {
  /** Rezistența în ohmi, pentru dreapta liniară */
  ohms?: number;
}

/**
 * Caracteristica U–I a unui rezistor ohmic, cu panta 1/R. Desen pur SVG,
 * fără canvas, ca să rămână clar la proiector.
 */
export function CharacteristicGuide({ ohms = 40 }: CharacteristicGuideProps) {
  const gradientId = useId();
  const plot = { x: 54, y: 22, w: 300, h: 196 };
  const uMax = 12;
  const iMax = 0.4;
  const X = (u: number) => plot.x + (u / uMax) * plot.w;
  const Y = (i: number) => plot.y + plot.h - (i / iMax) * plot.h;

  const steep = 1 / ohms;
  const shallow = 1 / (2 * ohms);
  const bulbs = Array.from({ length: 30 }, (_, index) => {
    const u = (uMax * index) / 29;
    // filament neliniar: I crește mai încet la tensiuni mari
    const i = (u / 95) * (1 - 0.34 * Math.min(1, u / uMax) ** 1.6);
    return { u, i };
  });

  return (
    <figure className="char-guide">
      <svg viewBox="0 0 400 268" className="char-svg" role="img" aria-label="Grafic intensitate–tensiune: o dreaptă prin origine pentru rezistorul ohmic, o dreaptă cu pantă mai mică pentru o rezistență mai mare și o curbă aplatizată pentru filamentul de bec.">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--copper)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--copper)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* grilă */}
        {Array.from({ length: 5 }, (_, index) => (
          <line
            key={`v${index}`}
            x1={plot.x + (plot.w * index) / 4}
            y1={plot.y}
            x2={plot.x + (plot.w * index) / 4}
            y2={plot.y + plot.h}
            stroke="var(--grid-color)"
            strokeWidth="1"
          />
        ))}
        {Array.from({ length: 5 }, (_, index) => (
          <line
            key={`h${index}`}
            x1={plot.x}
            y1={plot.y + (plot.h * index) / 4}
            x2={plot.x + plot.w}
            y2={plot.y + (plot.h * index) / 4}
            stroke="var(--grid-color)"
            strokeWidth="1"
          />
        ))}

        {/* arii */}
        <polygon points={`${X(0)},${Y(0)} ${X(9)},${Y(0)} ${X(9)},${Y(9 * shallow)}`} fill={`url(#${gradientId})`} />

        {/* axe */}
        <line x1={plot.x} y1={plot.y + plot.h} x2={plot.x + plot.w} y2={plot.y + plot.h} stroke="var(--line-strong)" strokeWidth="1.4" />
        <line x1={plot.x} y1={plot.y + plot.h} x2={plot.x} y2={plot.y} stroke="var(--line-strong)" strokeWidth="1.4" />
        <polygon points={`${plot.x + plot.w},${plot.y + plot.h} ${plot.x + plot.w - 7},${plot.y + plot.h - 3.6} ${plot.x + plot.w - 7},${plot.y + plot.h + 3.6}`} fill="var(--muted-2)" />
        <polygon points={`${plot.x},${plot.y} ${plot.x - 3.6},${plot.y + 7} ${plot.x + 3.6},${plot.y + 7}`} fill="var(--muted-2)" />

        {/* diviziuni */}
        {[3, 6, 9, 12].map((u) => (
          <text key={u} x={X(u)} y={plot.y + plot.h + 16} textAnchor="middle" className="char-tick">
            {u}
          </text>
        ))}
        {[0.1, 0.2, 0.3, 0.4].map((i) => (
          <text key={i} x={plot.x - 8} y={Y(i) + 4} textAnchor="end" className="char-tick">
            {String(Math.round(i * 1000))}
          </text>
        ))}
        <text x={plot.x + plot.w} y={plot.y + plot.h + 34} textAnchor="end" className="char-axis">U (V)</text>
        <text x={plot.x - 34} y={plot.y - 6} className="char-axis">I (mA)</text>

        {/* drepte ohmice */}
        <line x1={X(0)} y1={Y(0)} x2={X(11.6)} y2={Y(11.6 * steep)} stroke="var(--cyan)" strokeWidth="2.6" strokeLinecap="round" />
        <line x1={X(0)} y1={Y(0)} x2={X(12)} y2={Y(12 * shallow)} stroke="var(--copper)" strokeWidth="2.6" strokeLinecap="round" />

        {/* caracteristica becului */}
        <path
          d={bulbs.map((point, index) => `${index === 0 ? "M" : "L"}${X(point.u)},${Y(point.i)}`).join(" ")}
          fill="none"
          stroke="var(--amber)"
          strokeWidth="2.4"
          strokeDasharray="6 4"
          strokeLinecap="round"
        />

        {/* etichete */}
        <g transform={`translate(${X(9.6)},${Y(9.6 * steep) - 14})`}>
          <rect x="-52" y="-12" width="104" height="20" rx="6" fill="var(--surface)" opacity="0.9" />
          <text textAnchor="middle" y="3" className="char-label char-label-cyan">R mic — pantă mare</text>
        </g>
        <g transform={`translate(${X(10.6)},${Y(10.6 * shallow) - 16})`}>
          <rect x="-56" y="-12" width="112" height="20" rx="6" fill="var(--surface)" opacity="0.9" />
          <text textAnchor="middle" y="3" className="char-label char-label-copper">R mare — pantă mică</text>
        </g>
        <g transform={`translate(${X(10.2)},${Y(bulbs[25].i) + 18})`}>
          <rect x="-54" y="-12" width="108" height="20" rx="6" fill="var(--surface)" opacity="0.9" />
          <text textAnchor="middle" y="3" className="char-label char-label-amber">bec — neliniar</text>
        </g>

        {/* punct de lucru */}
        <circle cx={X(6)} cy={Y(6 * shallow)} r="5" fill="var(--surface)" stroke="var(--copper)" strokeWidth="2.4" />
        <line x1={X(6)} y1={Y(6 * shallow)} x2={X(6)} y2={Y(0)} stroke="var(--copper)" strokeWidth="1" strokeDasharray="3 4" opacity="0.6" />
        <line x1={X(6)} y1={Y(6 * shallow)} x2={X(0)} y2={Y(6 * shallow)} stroke="var(--copper)" strokeWidth="1" strokeDasharray="3 4" opacity="0.6" />
      </svg>
      <figcaption>
        <b>panta = 1 / R</b> — cu cât dreapta este mai abruptă, cu atât rezistența
        este mai mică. Filamentul de bec se abate de la dreaptă, pentru că
        rezistența lui crește cu temperatura.
      </figcaption>
    </figure>
  );
}
