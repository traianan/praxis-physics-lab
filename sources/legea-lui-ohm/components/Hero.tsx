import { ArrowRight, Bolt, Gauge, Target } from "./Icons";
import { HeroDiagram } from "./HeroDiagram";

export function Hero() {
  return (
    <section className="hero" id="acasa">
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-orb hero-orb-copper" />
        <div className="hero-orb hero-orb-cyan" />
        <div className="hero-grid-overlay" />
        <div className="hero-scanline" />
      </div>
      <div className="container hero-inner">
        <div className="hero-copy">
          <div className="hero-kicker">
            <span>Fizică · curent continuu</span>
          </div>
          <h1>
            Legea
            <span className="hero-title-accent">lui Ohm</span>
          </h1>
          <p className="hero-lead">
            Un singur raport — <strong>I = U / R</strong> — leagă tensiunea,
            curentul și rezistența. De la caracteristica unui fir, la circuitul
            complet cu sursă reală, reostat și măsurători de laborator.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#lesson-tab-laborator">
              Deschide laboratorul
              <ArrowRight size={18} />
            </a>
            <a className="button button-ghost-light" href="#lesson-tab-teorie">
              De la definiție
            </a>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-icon">
                <Bolt size={18} />
              </span>
              <div>
                <strong>1 Ω = 1 V / 1 A</strong>
                <span>unitatea de rezistență</span>
              </div>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-icon">
                <Gauge size={18} />
              </span>
              <div>
                <strong>U = R · I</strong>
                <span>caracteristica liniară</span>
              </div>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-icon">
                <Target size={18} />
              </span>
              <div>
                <strong>E = U + u</strong>
                <span>circuitul complet</span>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-diagram">
          <div className="hero-diagram-frame">
            <span className="hero-diagram-label">
              <span className="live-dot" />
              circuit în funcțiune
            </span>
            <HeroDiagram />
            <div className="hero-diagram-foot">
              <span>
                <i className="legend-arrow-current" />
                curent I
              </span>
              <span>
                <i className="legend-dot legend-dot-cyan" />
                electroni (sens opus lui I)
              </span>
              <span>
                <i className="legend-dot legend-dot-amber" />
                tensiune U
              </span>
              <span>
                <i className="legend-dot legend-dot-copper" />
                rezistență R
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
