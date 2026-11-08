"use client";

import {
  ArrowRight,
  ExternalLink,
  Flask,
  Printer,
} from "./Icons";
import { Formula } from "./Formula";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const links = [
  {
    title: "PhET · Circuit Construction Kit (DC)",
    description:
      "Constructor de circuite: baterii, rezistoare, becuri, ampermetre și voltmetre. Ideal pentru exersarea montajelor amonte/aval.",
    href: "https://phet.colorado.edu/en/simulations/circuit-construction-kit-dc",
    tag: "simulare",
  },
  {
    title: "PhET · Resistance in a Wire",
    description:
      "Variează lungimea, secțiunea și rezistivitatea unui fir și urmărește cum se schimbă rezistența.",
    href: "https://phet.colorado.edu/en/simulations/resistance-in-a-wire",
    tag: "simulare",
  },
  {
    title: "HyperPhysics · Ohm's Law",
    description:
      "Explicație condensată a legii lui Ohm, cu grafice U–I, circuite serie/paralel și surse reale.",
    href: "http://hyperphysics.phy-astr.gsu.edu/hbase/electric/ohmlaw.html",
    tag: "teorie",
  },
  {
    title: "OpenStax · Electric Current, Resistance and Ohm's Law",
    description:
      "Resursă universitară despre curent electric, rezistivitate, dependență de temperatură și legea lui Ohm.",
    href: "https://openstax.org/books/university-physics-volume-2/pages/9-3-resistivity-and-resistance",
    tag: "universitară",
  },
];

const lessonSteps = [
  {
    title: "Fixăm legea · 8 min",
    body: "Pornește de la caracteristica liniară observată în laboratorul anterior. Scrie I = U/R și definiția ohmului, apoi întreabă ce se întâmplă dacă R se dublează.",
  },
  {
    title: "Experimentăm · 14 min",
    body: "Deschide laboratorul U–I. Compară rezistorul (dreaptă) cu becul (curbă). Lasă elevii să prezică forma curbei înainte de a crește tensiunea.",
  },
  {
    title: "Circuitul complet · 12 min",
    body: "Comută pe sursa reală. Crește treptat curentul și cere clasei să observe scăderea tensiunii la borne. Apoi deschide scurtcircuitul și discută siguranța.",
  },
  {
    title: "Măsurăm · 6 min",
    body: "Arată cele două montaje pentru rezistențe de 100 Ω și 10 kΩ. Întrebarea de ieșire: care montaj alegeți și de ce?",
  },
  {
    title: "Verificăm · 5 min",
    body: "Folosește testul scurt ca ieșire din lecție. Fiecare răspuns are explicație, deci discuția pornește imediat.",
  },
];

export function ResourcesSection() {
  return (
    <section className="section section-resources" id="resurse">
      <div className="container">
        <Reveal>
          <SectionHeading
            index="08"
            eyebrow="Resurse și lecție"
            title="Du lecția mai departe"
            lead="Un scenariu de 45 de minute, linkuri alese pentru aprofundare și o fișă de recapitulare pe care o poți printa sau proiecta."
          />
        </Reveal>

        <div className="resources-grid">
          <Reveal className="lesson-plan" delay={40}>
            <div className="resources-card-head">
              <div>
                <span className="card-kicker">scenariu de lecție</span>
                <h3>45 de minute, pas cu pas</h3>
              </div>
              <span className="chip chip-green">la clasă</span>
            </div>

            <div className="lesson-steps">
              {lessonSteps.map((step, index) => (
                <div className="lesson-step" key={step.title}>
                  <span className="lesson-step-num">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="lesson-plan-actions">
              <a className="button button-primary button-small" href="#laborator">
                Deschide laboratorul
                <ArrowRight size={15} />
              </a>
              <a className="lesson-link" href="#verificare">
                <Flask size={15} />
                Începe testul
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
              <span>legea lui Ohm</span>
              <Formula block tex="I=\dfrac{U}{R}" />
            </div>
            <div className="recap-formula">
              <span>unitatea</span>
              <Formula block tex="1\ \Omega=\dfrac{1\ \mathrm{V}}{1\ \mathrm{A}}" />
            </div>
            <div className="recap-formula">
              <span>rezistența firului</span>
              <Formula block tex="R=\rho\dfrac{L}{S}" />
            </div>
            <div className="recap-formula">
              <span>circuit complet</span>
              <Formula block tex="I=\dfrac{E}{R+r}" />
            </div>
            <div className="recap-formula">
              <span>tensiunea la borne</span>
              <Formula block tex="U=E-r\,I" />
            </div>
            <div className="recap-formula">
              <span>puterea</span>
              <Formula block tex="P=U\,I=R\,I^{2}" />
            </div>
            <div className="recap-formula">
              <span>reostat (serie)</span>
              <Formula block tex="R_{AC}=k\,l_{AC}" />
            </div>
            <div className="recap-formula">
              <span>măsurare, amonte</span>
              <Formula block tex="R=\dfrac{U}{I}-R_A" />
            </div>
          </div>

          <div className="recap-checks">
            <div className="recap-check">
              <span className="recap-check-mark">✓</span>
              <p>
                <strong>Mers în gol:</strong> R → ∞, I → 0, U → E. Așa se măsoară
                tensiunea electromotoare.
              </p>
            </div>
            <div className="recap-check">
              <span className="recap-check-mark">✓</span>
              <p>
                <strong>Scurtcircuit:</strong> R = 0, U = 0, I = E/r. Toată puterea
                se disipă pe sursă.
              </p>
            </div>
            <div className="recap-check">
              <span className="recap-check-mark">✓</span>
              <p>
                <strong>Adaptare:</strong> puterea utilă este maximă la R = r, dar
                randamentul este doar 50 %.
              </p>
            </div>
            <div className="recap-check">
              <span className="recap-check-mark">✓</span>
              <p>
                <strong>Alegerea montajului:</strong> amonte pentru R mare, aval
                pentru R mică, prag la <Formula tex="\sqrt{R_A R_V}" />.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
