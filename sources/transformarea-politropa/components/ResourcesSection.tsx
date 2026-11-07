"use client";

import {
  ArrowRight,
  BookOpen,
  ExternalLink,
  Flask,
  Printer,
} from "./Icons";
import { Formula } from "./Formula";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const links = [
  {
    title: "PhET · Gas Properties",
    description:
      "Simulare de gaz ideal cu piston, presiune, volum și temperatură. Bună pentru o introducere intuitivă.",
    href: "https://phet.colorado.edu/en/simulations/gas-properties",
    tag: "simulare",
  },
  {
    title: "HyperPhysics · Polytropic Process",
    description:
      "Explicație concisă a procesului politrop, cu legătura dintre exponent, căldură molară și căldură specifică.",
    href: "https://hyperphysics.phy-astr.gsu.edu/hbase/thermo/polytro.html",
    tag: "teorie",
  },
  {
    title: "Wikipedia · Polytropic process",
    description:
      "Formule, demonstrații și aplicații tehnice ale proceselor politrope, inclusiv cazurile limită.",
    href: "https://en.wikipedia.org/wiki/Polytropic_process",
    tag: "referință",
  },
  {
    title: "OpenStax · Thermodynamic Processes",
    description:
      "Capitol de termodinamică universitară: izobar, izocor, izoterm, adiabat și reprezentări p-V.",
    href: "https://openstax.org/books/university-physics-volume-2/pages/3-4-thermodynamic-processes",
    tag: "manual",
  },
];

export function ResourcesSection() {
  return (
    <section className="section section-resources" id="resurse">
      <div className="container">
        <Reveal>
          <SectionHeading
            index="06"
            eyebrow="Resurse și lecție"
            title="Du lecția mai departe"
            lead="Un scenariu scurt pentru clasă, linkuri alese pentru aprofundare și o fișă de recapitulare pe care o poți printa sau proiecta."
          />
        </Reveal>

        <div className="resources-grid">
          <Reveal className="lesson-plan" delay={40}>
            <div className="resources-card-head">
              <div>
                <span className="card-kicker">scenariu de lecție</span>
                <h3>45 de minute, pas cu pas</h3>
              </div>
              <span className="chip chip-mint">la clasă</span>
            </div>

            <div className="lesson-steps">
              <div className="lesson-step">
                <span className="lesson-step-num">01</span>
                <div>
                  <strong>Fixăm legea · 8 min</strong>
                  <p>
                    Pornește de la definiție și de la <Formula tex="pV^{n}=\mathrm{constant}" />.
                    Arată spectrul lui n și întreabă ce se întâmplă la n = 0, 1, γ.
                  </p>
                </div>
              </div>
              <div className="lesson-step">
                <span className="lesson-step-num">02</span>
                <div>
                  <strong>Experimentăm · 17 min</strong>
                  <p>
                    Deschide laboratorul și comută cele cinci preseturi. Compară
                    p₂, T₂, L, Q și ΔU pentru aceeași stare inițială și același V₂.
                  </p>
                </div>
              </div>
              <div className="lesson-step">
                <span className="lesson-step-num">03</span>
                <div>
                  <strong>Calculăm · 15 min</strong>
                  <p>
                    Rezolvă exercițiul liniar și o problemă în calculator. Lasă
                    elevii să prezică semnul lui Q înainte de a apăsa „rulează”.
                  </p>
                </div>
              </div>
              <div className="lesson-step">
                <span className="lesson-step-num">04</span>
                <div>
                  <strong>Verificăm · 5 min</strong>
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
              <span>legea</span>
              <Formula block tex="pV^{n}=\mathrm{constant}" />
            </div>
            <div className="recap-formula">
              <span>energia internă</span>
              <Formula block tex="\Delta U=\nu C_{V}\Delta T" />
            </div>
            <div className="recap-formula">
              <span>lucrul</span>
              <Formula block tex="L=-\dfrac{\nu R\Delta T}{n-1}" />
            </div>
            <div className="recap-formula">
              <span>căldura</span>
              <Formula block tex="Q=\nu C\Delta T" />
            </div>
            <div className="recap-formula">
              <span>căldura molară</span>
              <Formula block tex="C=C_{V}+\dfrac{R}{1-n}" />
            </div>
            <div className="recap-formula">
              <span>indicele</span>
              <Formula block tex="n=\dfrac{C-C_{p}}{C-C_{V}}" />
            </div>
          </div>

          <div className="recap-note">
            <BookOpen size={18} />
            <p>
              <strong>Sursa lecției:</strong> Constantin Mantea, Mihaela Garabet —
              <em> Fizică, manual pentru clasa a X-a</em>, Editura ALL
              Educational, subcapitolul 1.4.1, p. 38. Această aplicație este o
              resursă didactică originală, inspirată de structura manualului, nu
              o reproducere a acestuia.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
