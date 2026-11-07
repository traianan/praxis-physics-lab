import { Formula } from "./Formula";

const table = [
  ["n → ±∞", "V = const", "C_V", "Q = ΔU", "L = 0"],
  ["n = −1", "p = k·V", "(C_p + C_V)/2", "Q = νCΔT", "L = ½νRΔT"],
  ["n = 0", "p = const", "C_p", "Q = νC_pΔT", "L = pΔV"],
  ["n = 1", "pV = const", "C → ∞", "Q = L", "L = νRT ln(V₂/V₁)"],
  ["n = γ", "pVᵞ = const", "0", "Q = 0", "L = −ΔU"],
];

export function PrintSheet() {
  return (
    <article className="print-sheet">
      <header className="print-sheet-head">
        <span className="print-sheet-kicker">Fizică · clasa a X-a · 1.4.1</span>
        <h1>Transformarea politropă</h1>
        <p>
          Fișă de recapitulare: legea, relațiile energetice și procesele simple
          ale gazului ideal.
        </p>
      </header>

      <section>
        <h2>Definiție</h2>
        <p>
          Se numește proces (transformare) politropă procesul unui sistem
          termodinamic închis (ν = constant) în care căldura molară rămâne
          constantă.
        </p>
        <Formula block tex="pV^{n}=\mathrm{constant}\qquad n\in(-\infty,\infty)" />
      </section>

      <section>
        <h2>Relații echivalente</h2>
        <div className="print-formula-row">
          <Formula block tex="TV^{n-1}=\mathrm{constant}" />
          <Formula block tex="p^{1-n}T^{n}=\mathrm{constant}" />
        </div>
      </section>

      <section>
        <h2>Energia procesului</h2>
        <div className="print-formula-row">
          <Formula block tex="\Delta U=\nu C_{V}\Delta T" />
          <Formula block tex="L=-\dfrac{\nu R\Delta T}{n-1}\quad(n\neq 1)" />
        </div>
        <div className="print-formula-row">
          <Formula block tex="Q=\nu C\Delta T" />
          <Formula block tex="C=C_{V}+\dfrac{R}{1-n}" />
        </div>
        <Formula block tex="n=\dfrac{C-C_{p}}{C-C_{V}}" />
      </section>

      <section>
        <h2>Procese simple</h2>
        <table className="print-table">
          <thead>
            <tr>
              <th>n</th>
              <th>legea</th>
              <th>C</th>
              <th>căldura</th>
              <th>lucrul</th>
            </tr>
          </thead>
          <tbody>
            {table.map((row) => (
              <tr key={row[0]}>
                {row.map((cell, index) => (
                  <td key={`${row[0]}-${index}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>Exercițiu</h2>
        <p>
          1 mol de gaz diatomic (C<sub>V</sub> = 2,5R) se încălzește izobar cu
          ΔT = 60 K. Calculează L, ΔU și Q. Verifică apoi rezultatul cu
          calculatorul din aplicație.
        </p>
        <div className="print-lines">
          <span />
          <span />
          <span />
        </div>
      </section>

      <footer className="print-sheet-foot">
        <span>Transformarea politropă · Praxis Science Lab</span>
        <span>Mantea &amp; Garabet, Fizică, clasa a X-a, 1.4.1</span>
      </footer>
    </article>
  );
}
