"use client";

import {
  ArrowRight,
  BookOpen,
  ExternalLink,
  Flask,
  Printer,
  Warning,
} from "./Icons";
import { Formula } from "./Formula";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const links = [
  {
    title: "PhET · Resistance in a Wire",
    description:
      "Simularea care a inspirat această lecție: rezistivitate, lungime și arie, cu rezistența afișată în timp real.",
    href: "https://phet.colorado.edu/en/simulations/resistance-in-a-wire",
    tag: "simulare",
  },
  {
    title: "PhET · Circuit Construction Kit",
    description:
      "Construiește circuite cu baterii, becuri și fire și măsoară tensiunea și curentul cu voltmetrul și ampermetrul.",
    href: "https://phet.colorado.edu/en/simulations/circuit-construction-kit-dc",
    tag: "simulare",
  },
  {
    title: "HyperPhysics · Resistance",
    description:
      "Explicație concisă a rezistenței, rezistivității și dependenței de temperatură, cu tabele de materiale.",
    href: "http://hyperphysics.phy-astr.gsu.edu/hbase/electric/resis.html",
    tag: "teorie",
  },
  {
    title: "OpenStax · Ohm's Law",
    description:
      "Capitol universitar despre legea lui Ohm, rezistivitate și rezistență, cu exemple rezolvate.",
    href: "https://openstax.org/books/university-physics-volume-2/pages/9-3-resistivity-and-resistance",
    tag: "manual",
  },
];

export function ResourcesSection() {
  return (
    <section className="section section-resources" id="resurse">
      <div className="container">
        <Reveal>
          <SectionHeading
            index="07"
            eyebrow="Resurse și lecție"
            title="Du lecția mai departe"
            lead="Un scenariu scurt pentru clasă, linkuri alese pentru aprofundare și o fișă de recapitulare pe care o poți printa sau proiecta la tablă."
          />
        </Reveal>

        <div className="resources-grid">
          <Reveal className="lesson-plan" delay={40}>
            <div className="resources-card-head">
              <div>
                <span className="card-kicker">scenariu de lecție</span>
                <h3>45 de minute, pas cu pas</h3>
              </div>
              <span className="chip chip-copper">la clasă</span>
            </div>

            <div className="lesson-steps">
              <div className="lesson-step">
                <span className="lesson-step-num">01</span>
                <div>
                  <strong>Problemă și observație · 8 min</strong>
                  <p>
                    Arată două fire de aceeași lungime, dar de grosimi diferite,
                    și întreabă care se încălzește mai mult. Fixează apoi legea{" "}
                    <Formula tex="R=\rho L/A" />.
                  </p>
                </div>
              </div>
              <div className="lesson-step">
                <span className="lesson-step-num">02</span>
                <div>
                  <strong>Experiment virtual · 17 min</strong>
                  <p>
                    Deschide laboratorul, rulează preseturile și lasă elevii să
                    prezică rezistența înainte de a mișca sliderul. Compară cu
                    referința de 1 m · 1 mm².
                  </p>
                </div>
              </div>
              <div className="lesson-step">
                <span className="lesson-step-num">03</span>
                <div>
                  <strong>Calcul și materiale · 15 min</strong>
                  <p>
                    Rezolvă o problemă în calculator, apoi discută tabelul de
                    materiale: de ce cupru la cabluri, nicrom la reșou, aluminiu
                    la linii aeriene.
                  </p>
                </div>
              </div>
              <div className="lesson-step">
                <span className="lesson-step-num">04</span>
                <div>
                  <strong>Verificare · 5 min</strong>
                  <p>
                    Folosește testul scurt ca ieșire din lecție. Fiecare răspuns
                    are explicație, deci discuția pornește imediat.
                  </p>
                </div>
              </div>
            </div>
            <div className="lesson-plan-actions">
              <a className="button button-primary button-small" href="#laborator">
                Deschide laboratorul
                <ArrowRight size={15} />
              </a>
              <a className="lesson-link" href="#verificare">
                <Flask size={15} />
                Testează clasa
              </a>
            </div>
          </Reveal>

          <Reveal className="links-panel" delay={90}>
            <div className="resources-card-head">
              <div>
                <span className="card-kicker">linkuri utile</span>
                <h3>Pentru aprofundare</h3>
              </div>
              <ExternalLink size={18} />
            </div>
            <div className="resource-links">
              {links.map((link) => (
                <a
                  key={link.title}
                  className="resource-link"
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="resource-link-top">
                    <span className="resource-link-tag">{link.tag}</span>
                    <ExternalLink size={15} />
                  </div>
                  <strong>{link.title}</strong>
                  <p>{link.description}</p>
                </a>
              ))}
            </div>
            <p className="resource-footnote">
              Linkurile se deschid într-o filă nouă și necesită conexiune la
              internet. Aplicația în sine funcționează local.
            </p>
          </Reveal>
        </div>

        <Reveal className="recap-card" delay={50}>
          <div className="recap-card-head">
            <div>
              <span className="card-kicker">fișă de recapitulare</span>
              <h3>Esențialul, pe o singură pagină</h3>
            </div>
            <button
              type="button"
              className="button button-secondary button-small"
              onClick={() => window.print()}
            >
              <Printer size={15} />
              Printează fișa
            </button>
          </div>

          <div className="recap-formulas">
            <div className="recap-formula">
              <span>legea firului</span>
              <Formula block tex="R=\rho\,\dfrac{L}{A}" />
            </div>
            <div className="recap-formula">
              <span>secțiunea din diametru</span>
              <Formula block tex="A=\dfrac{\pi d^{2}}{4}" />
            </div>
            <div className="recap-formula">
              <span>temperatura</span>
              <Formula block tex="\rho=\rho_{0}(1+\alpha\Delta t)" />
            </div>
            <div className="recap-formula">
              <span>legea lui Ohm</span>
              <Formula block tex="I=\dfrac{U}{R}" />
            </div>
            <div className="recap-formula">
              <span>puterea disipată</span>
              <Formula block tex="P=UI=R I^{2}" />
            </div>
            <div className="recap-formula">
              <span>conductanța</span>
              <Formula block tex="G=\dfrac{1}{R}" />
            </div>
          </div>

          <div className="recap-materials">
            <div>
              <span>Cu</span>
              <strong>0,017</strong>
              <small>Ω·mm²/m</small>
            </div>
            <div>
              <span>Al</span>
              <strong>0,027</strong>
              <small>Ω·mm²/m</small>
            </div>
            <div>
              <span>NiCr</span>
              <strong>1,10</strong>
              <small>Ω·mm²/m</small>
            </div>
            <div>
              <span>grafit</span>
              <strong>35</strong>
              <small>Ω·mm²/m</small>
            </div>
            <p>
              Rezistivități orientative la 20 °C. Pentru calcule exacte,
              folosește valorile din tabelul de materiale sau datele
              producătorului.
            </p>
          </div>

          <div className="recap-note">
            <BookOpen size={18} />
            <p>
              <strong>Notă didactică.</strong> Aplicația folosește modelul
              conductorului omogen, cu secțiune constantă. Rezistivitatea
              depinde de temperatură prin coeficientul α; la temperaturi foarte
              mari apar efecte suplimentare (dilatare, oxidare), care nu sunt
              modelate aici.
            </p>
          </div>

          <div className="recap-warning">
            <Warning size={17} />
            <p>
              Densitatea de curent și pragurile de încălzire afișate în laborator
              sunt orientative, pentru fire de laborator în aer liber. Ele nu
              înlocuiesc tabelele de sarcini admisibile și nici protecțiile
              electrice reale.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
