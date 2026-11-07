import { Formula } from "./Formula";

const table = [
  ["Cu", "cupru", "0,017", "1,7·10⁻⁸", "+0,0039", "cabluri, bobine"],
  ["Ag", "argint", "0,016", "1,6·10⁻⁸", "+0,0038", "contacte"],
  ["Al", "aluminiu", "0,027", "2,7·10⁻⁸", "+0,0043", "linii aeriene"],
  ["Fe", "fier", "0,10", "1,0·10⁻⁷", "+0,0065", "rezistențe de putere"],
  ["NiCr", "nicrom", "1,10", "1,1·10⁻⁶", "+0,0004", "reșouri"],
  ["C", "grafit", "35", "3,5·10⁻⁵", "−0,0005", "electrozi"],
];

export function PrintSheet() {
  return (
    <article className="print-sheet">
      <header className="print-sheet-head">
        <span className="print-sheet-kicker">
          Fizică · electricitate · rezistența conductorului
        </span>
        <h1>Rezistența unui fir</h1>
        <p>
          Fișă de recapitulare: legea firului conductor, secțiunea, efectul
          temperaturii, legea lui Ohm și tabelul de materiale.
        </p>
      </header>

      <section>
        <h2>Legea firului conductor</h2>
        <p>
          Rezistența unui conductor omogen, cu secțiune constantă, este direct
          proporțională cu lungimea și invers proporțională cu aria secțiunii
          transversale.
        </p>
        <Formula block tex="R=\rho\,\dfrac{L}{A}\qquad A=\dfrac{\pi d^{2}}{4}" />
        <p>
          R — rezistența (Ω); ρ — rezistivitatea (Ω·m); L — lungimea (m); A —
          aria secțiunii (m²). În practică: ρ în Ω·mm²/m, L în m, A în mm².
        </p>
      </section>

      <section>
        <h2>Efectul temperaturii</h2>
        <Formula block tex="\rho=\rho_{0}\left[1+\alpha\left(t-20\,^{\circ}\mathrm{C}\right)\right]" />
        <p>
          La metale α &gt; 0, deci rezistența crește la încălzire. La grafit α
          &lt; 0, iar rezistența scade.
        </p>
      </section>

      <section>
        <h2>Legea lui Ohm și puterea</h2>
        <div className="print-formula-row">
          <Formula block tex="I=\dfrac{U}{R}" />
          <Formula block tex="P=UI=R I^{2}=\dfrac{U^{2}}{R}" />
        </div>
        <div className="print-formula-row">
          <Formula block tex="G=\dfrac{1}{R}" />
          <Formula block tex="R=\dfrac{\rho L}{A}\;\Rightarrow\;A=\dfrac{\rho L}{R}" />
        </div>
      </section>

      <section>
        <h2>Rezistivități orientative (20 °C)</h2>
        <table className="print-table">
          <thead>
            <tr>
              <th>simbol</th>
              <th>material</th>
              <th>ρ (Ω·mm²/m)</th>
              <th>ρ (Ω·m)</th>
              <th>α (K⁻¹)</th>
              <th>utilizare</th>
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
          1. Un fir de nicrom are L = 5 m, d = 0,5 mm și ρ = 1,1 Ω·mm²/m.
          Calculează A, apoi R. 2. La 12 V, ce curent trece prin fir? 3. Ce
          putere se disipă?
        </p>
        <div className="print-lines">
          <span />
          <span />
          <span />
          <span />
        </div>
      </section>

      <footer className="print-sheet-foot">
        <span>Rezistența unui fir · Praxis Science Lab</span>
        <span>R = ρL/A · rezistivitate · temperatură</span>
      </footer>
    </article>
  );
}
