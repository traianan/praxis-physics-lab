"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Board,
  Close,
  LogoMark,
  Menu,
  Moon,
  Sun,
} from "./Icons";
import { useTheme } from "./ThemeProvider";

const LINKS = [
  { id: "teorie", label: "Teorie" },
  { id: "laborator", label: "Laborator" },
  { id: "factori", label: "Factori" },
  { id: "materiale", label: "Materiale" },
  { id: "calculator", label: "Calculator" },
  { id: "verificare", label: "Verificare" },
  { id: "resurse", label: "Resurse" },
];

export function Nav() {
  const [active, setActive] = useState("acasa");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const { board, toggleBoard, toggleTheme } = useTheme();

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 18);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, y / max)) : 0);

      let current = "acasa";
      for (const link of LINKS) {
        const section = document.getElementById(link.id);
        if (section && section.getBoundingClientRect().top <= 170) {
          current = link.id;
        }
      }
      if (max > 0 && y >= max - 4) current = "resurse";
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", mobileOpen);
    return () => document.body.classList.remove("menu-open");
  }, [mobileOpen]);

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="scroll-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>
      <div className="nav-shell">
        <a className="brand" href="#acasa" aria-label="Rezistența unui fir — început">
          <LogoMark />
          <span className="brand-copy">
            <strong>Rezistența unui fir</strong>
            <small>Fizică · electricitate</small>
          </span>
        </a>

        <nav className="nav-links" aria-label="Secțiunile lecției">
          {LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={active === link.id ? "is-active" : ""}
              aria-current={active === link.id ? "location" : undefined}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <button
            type="button"
            className={`nav-tool ${board ? "is-on" : ""}`}
            onClick={toggleBoard}
            aria-pressed={board}
            title={board ? "Oprește modul tablă" : "Activează modul tablă"}
          >
            <Board size={18} />
            <span className="nav-tool-label">Tablă</span>
          </button>
          <button
            type="button"
            className="nav-tool nav-tool-icon"
            onClick={toggleTheme}
            title="Schimbă tema"
            aria-label="Schimbă tema deschisă/închisă"
          >
            <span className="theme-light-only">
              <Moon size={18} />
            </span>
            <span className="theme-dark-only">
              <Sun size={18} />
            </span>
          </button>
          <a className="nav-cta" href="#laborator">
            <span>Începe</span>
            <ArrowRight size={16} />
          </a>
          <button
            type="button"
            className="nav-tool nav-tool-icon menu-toggle"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "Închide meniul" : "Deschide meniul"}
          >
            {mobileOpen ? <Close size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="mobile-menu" id="mobile-menu">
          <nav aria-label="Secțiunile lecției, meniu mobil">
            {LINKS.map((link, index) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={() => setMobileOpen(false)}
                className={active === link.id ? "is-active" : ""}
              >
                <span className="mobile-menu-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {link.label}
                <ArrowRight size={17} />
              </a>
            ))}
          </nav>
          <div className="mobile-menu-note">
            <span>R = ρL / A</span>
            <span>Ω·mm²/m</span>
          </div>
        </div>
      ) : null}
    </header>
  );
}
