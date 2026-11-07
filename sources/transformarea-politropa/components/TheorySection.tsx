import type { ReactNode } from "react";
import { ArrowRight, BookOpen, Flame, Snowflake, Thermometer } from "./Icons";
import { Formula } from "./Formula";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

interface ProcessRow {
  n: string;
  law: ReactNode;
  c: ReactNode;
  q: ReactNode;
  l: ReactNode;
  note: string;
  tone: string;
}

const processRows: ProcessRow[] = [
  {
    n: "n → ±∞",
    law: <>V = constant</>,
    c: <>C<sub>V</sub></>,
    q: <>Q = ΔU</>,
    l: <>L = 0</>,
    note: "izocoră",
    tone: "violet",
  },
  {
    n: "n = −1",
    law: <>p = k·V</>,
    c: <>(C<sub>p</sub> + C<sub>V</sub>)/2</>,
    q: <>Q = νCΔT</>,
    l: <>L = ½νRΔT</>,
    note: "proces liniar",
    tone: "rose",
  },
  {
    n: "n = 0",
    law: <>p = constant</>,
    c: <>C<sub>p</sub></>,
    q: <>Q = νC<sub>p</sub>ΔT</>,
    l: <>L = pΔV</>,
    note: "izobară",
    tone: "blue",
  },
  {
    n: "n = 1",
    law: <>pV = constant</>,
    c: <>C → ∞</>,
    q: <>Q = L</>,
    l: <>L = νRT ln(V<sub>2</sub>/V<sub>1</sub>)</>,
    note: "izotermă",
    tone: "cyan",
  },
  {
    n: "n = γ",
    law: <>pV<sup>γ</sup> = constant</>,
    c: <>0</>,
    q: <>Q = 0</>,
    l: <>L = −ΔU</>,
    note: "adiabată",
    tone: "gold",
  },
];

export function TheorySection() {
  return (
    <section className="section theory-section" id="teorie">
      <div className="container">
        <Reveal>
          <SectionHeading
            index="01"
            eyebrow="Definiție și lege"
            title="Ce înseamnă, de fapt, politrop?"
            lead="Un proces politrop este procesul unui sistem termodinamic închis în care căldura molară rămâne constantă. Din această condiție rezultă o singură lege — și o întreagă familie de transformări."
          />
        </Reveal>

        <div className="theory-top">
          <Reveal className="definition-panel" delay={40}>
            <div className="definition-quote">
              <span className="definition-mark">“</span>
              <p>
                Se numește <strong>proces (transformare) politropă</strong>{" "}
                procesul unui sistem termodinamic închis (<em>ν</em> = constant)
                în care căldura molară rămâne constantă.
              </p>
              <div className="definition-chips">
                <span className="chip chip-mint">ν = constant</span>
                <span className="chip chip-gold">C = constant</span>
                <span className="chip">n = constant</span>
              </div>
            </div>
            <div className="definition-note">
              <BookOpen size={18} />
              <p>
                Definiția din manual, p. 38. Un sistem închis nu schimbă masă cu
                exteriorul, deci numărul de moli <Formula tex="\nu" /> rămâne
                același pe tot parcursul transformării.
              </p>
            </div>
          </Reveal>

          <Reveal className="law-panel" delay={110}>
            <div className="law-panel-head">
              <span className="card-kicker">legea politrope</span>
              <span className="chip chip-gold">relația (1)</span>
            </div>
            <Formula
              block
              tex="pV^{\,n}=\mathrm{constant}"
              label="p ori V la puterea n egal constant"
              className="law-formula"
            />
            <div className="law-panel-meta">
              <div>
                <span className="law-meta-label">indicele politropic</span>
                <strong>
                  n ∈ (−∞, ∞)
                </strong>
              </div>
              <div>
                <span className="law-meta-label">căldura molară</span>
                <strong>C = constant</strong>
              </div>
            </div>
            <div className="n-spectrum" aria-label="Spectrul valorilor indicelui politropic">
              <div className="n-spectrum-track" />
              <span className="n-spectrum-dot" style={{ left: "2%" }} />
              <span className="n-spectrum-label" style={{ left: "2%" }}>
                −∞
                <small>izocor</small>
              </span>
              <span className="n-spectrum-dot" style={{ left: "22%" }} />
              <span className="n-spectrum-label" style={{ left: "22%" }}>
                −1
                <small>liniar</small>
              </span>
              <span className="n-spectrum-dot" style={{ left: "40%" }} />
              <span className="n-spectrum-label" style={{ left: "40%" }}>
                0
                <small>izobar</small>
              </span>
              <span className="n-spectrum-dot n-spectrum-dot-accent" style={{ left: "58%" }} />
              <span className="n-spectrum-label" style={{ left: "58%" }}>
                1
                <small>izoterm</small>
              </span>
              <span className="n-spectrum-dot" style={{ left: "76%" }} />
              <span className="n-spectrum-label" style={{ left: "76%" }}>
                γ
                <small>adiabat</small>
              </span>
              <span className="n-spectrum-dot" style={{ left: "98%" }} />
              <span className="n-spectrum-label" style={{ left: "98%" }}>
                +∞
                <small>izocor</small>
              </span>
            </div>
          </Reveal>
        </div>

        <Reveal delay={60}>
          <div className="equivalent-head">
            <span className="eyebrow">aceeași lege, alte variabile</span>
            <p>
              Eliminând presiunea, respectiv volumul, cu ajutorul ecuației
              termice de stare <Formula tex="pV=\nu RT" />, se obțin formele
              echivalente:
            </p>
          </div>
        </Reveal>

        <div className="equivalent-grid">
          <Reveal className="formula-tile" delay={40}>
            <span className="formula-tile-index">(2)</span>
            <Formula block tex="TV^{\,n-1}=\mathrm{constant}" />
            <p>
              utilă când se cunosc temperaturile și volumele, iar presiunea nu
              intervine.
            </p>
          </Reveal>
          <Reveal className="formula-tile" delay={90}>
            <span className="formula-tile-index">(3)</span>
            <Formula block tex="p^{\,1-n}\,T^{\,n}=\mathrm{constant}" />
            <p>
              utilă când se cunosc presiunile și temperaturile, iar volumul nu
              intervine.
            </p>
          </Reveal>
          <Reveal className="formula-tile formula-tile-accent" delay={140}>
            <span className="formula-tile-index">verificare</span>
            <Formula block tex="\frac{pV^{n}}{T^{n}}=\mathrm{constant}" />
            <p>
              toate cele trei forme descriu aceeași curbă în planul (p, V); se
              transformă una în alta prin ecuația de stare.
            </p>
          </Reveal>
        </div>

        <div className="theory-energy">
          <Reveal className="energy-copy" delay={30}>
            <span className="eyebrow">energia procesului</span>
            <h3>Patru relații care rezolvă aproape orice problemă</h3>
            <p>
              Prima lege <Formula tex="Q=\Delta U+L" /> leagă căldura schimbată,
              variația energiei interne și lucrul mecanic. Pentru un politrop,
              fiecare dintre aceste mărimi se exprimă simplu prin temperaturi.
            </p>
            <div className="energy-note">
              <Thermometer size={18} />
              <span>
                <strong>ΔT = T₂ − T₁</strong> păstrează semnul: dacă gazul se
                răcește, ΔT este negativ.
              </span>
            </div>
          </Reveal>

          <div className="energy-formulas">
            <Reveal className="energy-formula energy-formula-dU" delay={50}>
              <span className="energy-formula-label">energie internă</span>
              <Formula block tex="\Delta U=\nu C_{V}\Delta T" />
              <span className="energy-formula-ref">relația (4)</span>
            </Reveal>
            <Reveal className="energy-formula energy-formula-L" delay={90}>
              <span className="energy-formula-label">lucru mecanic</span>
              <Formula block tex="L=-\dfrac{\nu R\,\Delta T}{n-1}" />
              <span className="energy-formula-ref">relația (5), n ≠ 1</span>
            </Reveal>
            <Reveal className="energy-formula energy-formula-Q" delay={130}>
              <span className="energy-formula-label">căldură</span>
              <Formula block tex="Q=\nu C\,\Delta T" />
              <span className="energy-formula-ref">relația (6)</span>
            </Reveal>
            <Reveal className="energy-formula energy-formula-C" delay={170}>
              <span className="energy-formula-label">căldura molară</span>
              <Formula block tex="C=C_{V}+\dfrac{R}{1-n}" />
              <span className="energy-formula-ref">din (4), (5), (6)</span>
            </Reveal>
          </div>
        </div>

        <Reveal className="molar-card" delay={40}>
          <div className="molar-card-copy">
            <span className="eyebrow">legătura cu căldura molară</span>
            <h3>De unde apare indicele n?</h3>
            <p>
              Din relațiile (4) și (5), împreună cu relația lui Robert Mayer{" "}
              <Formula tex="C_{p}=C_{V}+R" />, se obține legătura directă dintre
              indicele politropic și căldura molară a procesului:
            </p>
            <div className="molar-chain">
              <span>Q = ΔU + L</span>
              <ArrowRight size={16} />
              <span>νCΔT = νC_VΔT − νRΔT/(n−1)</span>
              <ArrowRight size={16} />
              <span>C = C_V + R/(1−n)</span>
            </div>
          </div>
          <div className="molar-formula">
            <Formula
              block
              tex="n=\dfrac{C-C_{p}}{C-C_{V}}"
              label="n egal C minus Cp supra C minus CV"
            />
            <span className="molar-arrow">⇄</span>
            <Formula
              block
              tex="C=\dfrac{C_{p}-n\,C_{V}}{1-n}"
              label="C egal Cp minus n Cv supra 1 minus n"
            />
          </div>
        </Reveal>

        <Reveal className="family-card" delay={40}>
          <div className="family-card-head">
            <div>
              <span className="eyebrow">harta familiei</span>
              <h3>Valori speciale ale lui n</h3>
            </div>
            <a className="button button-secondary button-small" href="#laborator">
              Vezi-le animate
              <ArrowRight size={16} />
            </a>
          </div>
          <div className="table-wrap family-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>indicele n</th>
                  <th>legea</th>
                  <th>C</th>
                  <th>căldura</th>
                  <th>lucrul mecanic</th>
                  <th>numele procesului</th>
                </tr>
              </thead>
              <tbody>
                {processRows.map((row) => (
                  <tr key={row.n}>
                    <td>
                      <span className={`process-dot process-dot-${row.tone}`} />
                      <b className="mono">{row.n}</b>
                    </td>
                    <td className="mono">{row.law}</td>
                    <td className="mono">{row.c}</td>
                    <td className="mono">{row.q}</td>
                    <td className="mono">{row.l}</td>
                    <td>
                      <span className={`process-pill process-pill-${row.tone}`}>
                        {row.note}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="family-foot">
            <span>
              <Flame size={16} /> n &gt; γ: expansiunea răcește gazul
            </span>
            <span>
              <Snowflake size={16} /> 1 &lt; n &lt; γ: C &lt; 0
            </span>
            <span>
              <Thermometer size={16} /> n = γ: Q = 0, ΔU = −L
            </span>
          </div>
        </Reveal>

        <Reveal className="theory-callouts" delay={60}>
          <div className="callout">
            <span className="callout-icon">!</span>
            <p>
              <strong>Atenție la n = 1.</strong> Relația (5) pentru lucru mecanic
              nu se poate folosi direct: numitorul devine zero. În izotermă se
              folosește <Formula tex="L=\nu RT\ln(V_{2}/V_{1})" />, iar{" "}
              <Formula tex="\Delta U=0" />, deci <Formula tex="Q=L" />.
            </p>
          </div>
          <div className="callout callout-mint">
            <span className="callout-icon">i</span>
            <p>
              <strong>Verificare rapidă.</strong> Pentru 1 mol de gaz diatomic
              (C<sub>V</sub> = 2,5R), la o încălzire izobară cu ΔT = 60 K: L =
              νRΔT ≈ 499 J, ΔU = νC<sub>V</sub>ΔT ≈ 1 247 J, iar Q = ΔU + L ≈
              1 746 J.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
