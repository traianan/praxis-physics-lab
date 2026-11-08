import { Formula } from "./Formula";

/**
 * Fișă A4 pentru tipărire. Ascunsă pe ecran, afișată la print.
 */
export function PrintSheet() {
  return (
    <div className="print-only print-sheet">
      <header className="print-head">
        <div>
          <strong>Legea lui Ohm</strong>
          <span>Fizică · curent continuu</span>
        </div>
        <span className="print-head-mark">fișă de recapitulare</span>
      </header>

      <section className="print-block">
        <h2>1. Legea lui Ohm pe o porțiune de circuit</h2>
        <div className="print-formula-row">
          <Formula tex="I=\dfrac{U}{R}\qquad U=R\,I\qquad R=\dfrac{U}{I}" />
        </div>
        <p>
          Intensitatea curentului este proporțională cu tensiunea și invers
          proporțională cu rezistența. Valabilă doar pe o porțiune care nu conține
          generatoare.
        </p>
        <p className="print-def">
          <b>1 Ω</b> este rezistența unui conductor prin care se stabilește un
          curent de 1 A când la capete i se aplică 1 V.
        </p>
      </section>

      <section className="print-block">
        <h2>2. Rezistența unui conductor</h2>
        <div className="print-formula-row">
          <Formula tex="R=\rho\dfrac{L}{S}\qquad \rho=\rho_0[1+\alpha(t-20^\circ\mathrm{C})]" />
        </div>
        <p>
          R crește cu lungimea și cu temperatura, scade cu secțiunea. Conductoarele
          pentru care legea lui Ohm este valabilă se numesc <i>conductoare ohmice</i>.
        </p>
      </section>

      <section className="print-block">
        <h2>3. Circuitul complet</h2>
        <div className="print-formula-row">
          <Formula tex="E=U+u=I(R+r)" />
          <Formula tex="I=\dfrac{E}{R+r}" />
          <Formula tex="U=E-r\,I" />
        </div>
        <ul className="print-list">
          <li>mers în gol: R → ∞, I = 0, U = E;</li>
          <li>scurtcircuit: R = 0, U = 0, I = E/r;</li>
          <li>
            putere: P<sub>total</sub> = E·I, P<sub>utilă</sub> = U·I, randament η =
            U/E.
          </li>
        </ul>
      </section>

      <section className="print-block">
        <h2>4. Reostatul</h2>
        <div className="print-formula-row">
          <Formula tex="R_{AC}=k\,l_{AC}" />
          <Formula tex="I=\dfrac{E}{k\,l_{AC}+\ldots+r}" />
          <Formula tex="U_{AC}=k\,I\,l_{AC}" />
        </div>
        <p>
          În serie: lungimea activă mai mare ⇒ curent mai mic. Ca divizor de
          tensiune (montaj potențiometric): lungimea activă mai mare ⇒ tensiune mai
          mare.
        </p>
      </section>

      <section className="print-block">
        <h2>5. Măsurarea rezistenței</h2>
        <div className="print-formula-row">
          <Formula tex="R_{\text{amonte}}=\dfrac{U}{I}-R_A\qquad R_{\text{aval}}=\dfrac{U}{I}\cdot\dfrac{R_V}{R_V-U/I}" />
        </div>
        <p>
          Amonte pentru R &gt;&gt; R<sub>A</sub> (rezultate supraevaluate), aval
          pentru R &lt;&lt; R<sub>V</sub> (rezultate subevaluate). Prag practic:
          √(R<sub>A</sub>·R<sub>V</sub>).
        </p>
      </section>

      <section className="print-block print-block-grid">
        <div>
          <h3>Valori utile</h3>
          <ul className="print-list">
            <li>ρ<sub>Cu</sub> = 1,68·10⁻⁸ Ω·m</li>
            <li>ρ<sub>Al</sub> = 2,65·10⁻⁸ Ω·m</li>
            <li>ρ<sub>nicrom</sub> ≈ 1,1·10⁻⁶ Ω·m</li>
            <li>ρ<sub>W</sub> = 5,6·10⁻⁸ Ω·m</li>
          </ul>
        </div>
        <div>
          <h3>Verificări rapide</h3>
          <ul className="print-list">
            <li>I = 12 V / 40 Ω = 0,3 A</li>
            <li>P = 12 V · 0,3 A = 3,6 W</li>
            <li>E = 9 V, r = 1,5 Ω, R = 6 Ω ⇒ I = 1,2 A</li>
            <li>U = 9 − 1,2·1,5 = 7,2 V</li>
          </ul>
        </div>
      </section>

      <footer className="print-foot">
        <span>Legea lui Ohm · Praxis Science Lab</span>
        <span>resursă didactică originală · Praxis Science Lab</span>
      </footer>
    </div>
  );
}
