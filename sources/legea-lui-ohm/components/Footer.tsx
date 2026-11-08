export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <strong>Legea lui Ohm</strong>
          <p>
            Resursă didactică interactivă pentru fizică, construită pentru tablă
            și proiector.
          </p>
        </div>
        <div className="footer-meta">
          <div>
            <span className="card-kicker">secțiuni</span>
            <a href="#teorie">Teorie</a>
            <a href="#laborator">Laborator U–I</a>
            <a href="#circuit">Circuit complet</a>
            <a href="#reostat">Reostat</a>
          </div>
          <div>
            <span className="card-kicker">exersare</span>
            <a href="#masurare">Măsurări</a>
            <a href="#probleme">Probleme rezolvate</a>
            <a href="#verificare">Verificare</a>
            <a href="#resurse">Resurse</a>
          </div>
        </div>
      </div>
      <div className="container footer-base">
        <span>Aplicație originală · Praxis Science Lab</span>
      </div>
    </footer>
  );
}
