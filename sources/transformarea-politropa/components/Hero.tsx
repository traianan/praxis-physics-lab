import { ArrowDown, ArrowRight, Gauge, Sparkles, Thermometer } from "./Icons";
import { HeroDiagram } from "./HeroDiagram";

export function Hero() {
  return (
    <section className="hero" id="acasa">
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-orb hero-orb-mint" />
        <div className="hero-orb hero-orb-gold" />
        <div className="hero-grid-overlay" />
      </div>
      <div className="container hero-inner">
        <div className="hero-copy">
          <div className="hero-kicker">
            <span className="hero-kicker-mark">1.4.1</span>
            <span>Fizică · clasa a X-a · termodinamică</span>
          </div>
          <h1>
            Transformarea
            <span className="hero-title-accent">politropă</span>
          </h1>
          <p className="hero-lead">
            O singură lege — <strong>pVⁿ = constant</strong> — descrie o întreagă
            familie de procese: de la izobară și izotermă, până la adiabată și
            izocoră. Reglează indicele <em>n</em> și urmărește cum se transformă
            gazul, energia și graficul.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#laborator">
              Deschide laboratorul
              <ArrowRight size={18} />
            </a>
            <a className="button button-ghost-light" href="#teorie">
              De la definiție
              <ArrowDown size={17} />
            </a>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-icon">
                <Sparkles size={18} />
              </span>
              <div>
                <strong>5 procese simple</strong>
                <span>într-o singură familie</span>
              </div>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-icon">
                <Gauge size={18} />
              </span>
              <div>
                <strong>n ∈ (−∞, ∞)</strong>
                <span>indicele politropic</span>
              </div>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-icon">
                <Thermometer size={18} />
              </span>
              <div>
                <strong>C = constant</strong>
                <span>căldura molară</span>
              </div>
            </div>
          </div>
        </div>
        <HeroDiagram />
      </div>
      <a className="hero-scroll" href="#teorie" aria-label="Derulează la teorie">
        <span>Derulează</span>
        <span className="hero-scroll-line" />
      </a>
    </section>
  );
}
