import { ArrowDown, ArrowRight, Bolt, CrossSection, Thermometer } from "./Icons";
import { HeroDiagram } from "./HeroDiagram";

export function Hero() {
  return (
    <section className="hero" id="acasa">
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-orb hero-orb-copper" />
        <div className="hero-orb hero-orb-mint" />
        <div className="hero-grid-overlay" />
      </div>
      <div className="container hero-inner">
        <div className="hero-copy">
          <div className="hero-kicker">
            <span className="hero-kicker-mark">R = ρL/A</span>
            <span>Fizică · electricitate · laborator</span>
          </div>
          <h1>
            Rezistența
            <span className="hero-title-accent">unui fir</span>
          </h1>
          <p className="hero-lead">
            De ce un fir lung frânează curentul mai mult decât unul scurt? De ce
            un cablu gros se încălzește mai puțin? O singură relație —{" "}
            <strong>R = ρL/A</strong> — leagă lungimea, secțiunea, materialul și
            temperatura de rezistența electrică. Reglează firul și privește
            electronii la lucru.
          </p>
          <div className="hero-actions">
            <a className="button button-copper" href="#laborator">
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
                <Bolt size={18} />
              </span>
              <div>
                <strong>R = ρL / A</strong>
                <span>legea firului conductor</span>
              </div>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-icon">
                <Thermometer size={18} />
              </span>
              <div>
                <strong>ρ = ρ₀(1 + αΔt)</strong>
                <span>efectul temperaturii</span>
              </div>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-icon">
                <CrossSection size={18} />
              </span>
              <div>
                <strong>10 materiale</strong>
                <span>de la argint la grafit</span>
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
