import { LogoMark, ArrowRight, BookOpen, CalculatorIcon } from "./Icons";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <LogoMark size={38} />
          <div>
            <strong>Transformarea politropă</strong>
            <span>Fizică · clasa a X-a · termodinamică</span>
          </div>
        </div>

        <div className="footer-links">
          <a href="#teorie">Teorie</a>
          <a href="#laborator">Laborator</a>
          <a href="#liniar">Proces liniar</a>
          <a href="#calculator">Calculator</a>
          <a href="#verificare">Verificare</a>
        </div>

        <div className="footer-meta">
          <span>
            <BookOpen size={15} />
            Mantea &amp; Garabet, 1.4.1, p. 38
          </span>
          <span>
            <CalculatorIcon size={15} />
            resursă didactică originală
          </span>
          <span>© {new Date().getFullYear()} Praxis Science Lab</span>
        </div>

        <a className="footer-top" href="#acasa">
          Înapoi sus
          <ArrowRight size={15} />
        </a>
      </div>
    </footer>
  );
}
