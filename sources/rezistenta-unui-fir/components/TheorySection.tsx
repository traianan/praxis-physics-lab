import { ArrowRight, Bolt, BookOpen, CrossSection, Ruler, Thermometer } from "./Icons";
import { Formula } from "./Formula";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const factorCards = [
  {
    icon: Ruler,
    symbol: "L",
    title: "Lungimea",
    law: "R ∼ L",
    text: "Cu cât firul este mai lung, cu atât electronii întâlnesc mai mulți ioni pe drum. Dacă dublezi lungimea, se dublează rezistența.",
    tone: "copper",
  },
  {
    icon: CrossSection,
    symbol: "A",
    title: "Secțiunea",
    law: "R ∼ 1/A",
    text: "Un fir gros oferă mai multe „benzi de circulație”. Aria de două ori mai mare înseamnă rezistență de două ori mai mică.",
    tone: "mint",
  },
  {
    icon: Bolt,
    symbol: "ρ",
    title: "Materialul",
    law: "R ∼ ρ",
    text: "Rezistivitatea este o proprietate a substanței, nu a firului. Cuprul conduce de aproximativ 60 de ori mai bine decât nicromul.",
    tone: "brass",
  },
  {
    icon: Thermometer,
    symbol: "t",
    title: "Temperatura",
    law: "ρ = ρ₀(1 + αΔt)",
    text: "La metale, încălzirea mărește agitația ionică și rezistența. La grafit efectul este invers: α este negativ.",
    tone: "violet",
  },
];

export function TheorySection() {
  return (
    <section className="section theory-section" id="teorie">
      <div className="container">
        <Reveal>
          <SectionHeading
            index="01"
            eyebrow="Definiție și lege"
            title="Ce măsoară, de fapt, rezistența?"
            lead="Rezistența electrică arată cât de mult se împotrivește un conductor trecerii curentului. Ea nu depinde de tensiune și nici de intensitatea curentului: depinde de forma firului, de materialul din care este făcut și de temperatură."
          />
        </Reveal>

        <div className="theory-top">
          <Reveal className="definition-panel" delay={40}>
            <div className="definition-quote">
              <span className="definition-mark">R</span>
              <p>
                <strong>Rezistența electrică</strong> a unui conductor omogen,
                cu secțiune constantă, este direct proporțională cu lungimea sa
                și invers proporțională cu aria secțiunii transversale.
              </p>
              <div className="definition-chips">
                <span className="chip chip-copper">conductor omogen</span>
                <span className="chip chip-brass">secțiune constantă</span>
                <span className="chip">temperatură dată</span>
              </div>
            </div>
            <div className="definition-note">
              <BookOpen size={18} />
              <p>
                Rezistența se măsoară în <strong>ohmi (Ω)</strong>, cu
                ohmmetrul. Un ohm este rezistența parcursă de curentul de 1 A
                când la capetele ei există tensiunea de 1 V. Forma de mai sus
                este valabilă pentru un conductor liniar, omogen; la secțiuni
                variabile se lucrează pe porțiuni.
              </p>
            </div>
          </Reveal>

          <Reveal className="law-panel" delay={110}>
            <div className="law-panel-head">
              <span className="card-kicker">legea firului conductor</span>
              <span className="chip chip-copper">relația fundamentală</span>
            </div>
            <Formula
              block
              tex="R=\rho\,\dfrac{L}{A}"
              label="R egal rho ori L supra A"
              className="law-formula formula-accent"
            />
            <div className="law-panel-meta">
              <div>
                <span className="law-meta-label">R</span>
                <strong>rezistența, Ω</strong>
              </div>
              <div>
                <span className="law-meta-label">ρ</span>
                <strong>rezistivitatea, Ω·m</strong>
              </div>
              <div>
                <span className="law-meta-label">L</span>
                <strong>lungimea, m</strong>
              </div>
              <div>
                <span className="law-meta-label">A</span>
                <strong>aria secțiunii, m²</strong>
              </div>
            </div>
            <div className="law-units">
              <span className="law-units-note">
                în practică se folosește adesea
              </span>
              <Formula tex="R=\rho\,\dfrac{L}{A}" />
              <span className="law-units-note">
                cu ρ în Ω·mm²/m, L în m și A în mm²
              </span>
            </div>
          </Reveal>
        </div>

        <Reveal className="theory-analogy" delay={60}>
          <div className="analogy-copy">
            <span className="eyebrow">de ce arată astfel legea</span>
            <h3>Firul ca o conductă de apă</h3>
            <p>
              Un furtun lung opune mai multă rezistență decât unul scurt, iar un
              furtun gros lasă mai multă apă să treacă decât unul subțire. La
              fel stau lucrurile și cu electronii: drumul lung și îngust este
              cel mai greu de parcurs. Diferența este că în fir nu curge apă, ci{" "}
              <em>sarcină electrică</em>, iar „frecarea” vine din ciocnirile cu
              ionii rețelei cristaline.
            </p>
            <div className="analogy-map">
              <span>
                <b>L</b> lungimea furtunului
              </span>
              <span>
                <b>A</b> grosimea lui
              </span>
              <span>
                <b>ρ</b> cât de „încleiat” este interiorul
              </span>
            </div>
          </div>
          <div className="analogy-visual" aria-hidden="true">
            <svg viewBox="0 0 420 220" role="presentation" focusable="false">
              <defs>
                <linearGradient id="analogy-pipe" x1="0" y1="0" x2="0" y2="1">
                  <stop stopColor="rgba(184,115,63,.45)" />
                  <stop offset="1" stopColor="rgba(184,115,63,.18)" />
                </linearGradient>
              </defs>
              <g>
                <rect x="20" y="46" width="380" height="54" rx="27" fill="url(#analogy-pipe)" stroke="rgba(184,115,63,.45)" />
                <g fill="rgba(184,115,63,.75)">
                  <circle cx="70" cy="73" r="4">
                    <animate attributeName="cx" values="50;380" dur="3.6s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0;1;1;0" dur="3.6s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="150" cy="73" r="3">
                    <animate attributeName="cx" values="50;380" dur="3.6s" begin="1.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0;1;1;0" dur="3.6s" begin="1.2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="250" cy="73" r="3.4">
                    <animate attributeName="cx" values="50;380" dur="3.6s" begin="2.4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0;1;1;0" dur="3.6s" begin="2.4s" repeatCount="indefinite" />
                  </circle>
                </g>
                <text x="20" y="126" fill="currentColor" fontSize="11" fontFamily="ui-monospace, monospace" opacity=".7">
                  același debit, conductă lungă și îngustă
                </text>
              </g>
              <g transform="translate(0 76)">
                <rect x="20" y="64" width="380" height="24" rx="12" fill="rgba(143,211,182,.16)" stroke="rgba(143,211,182,.4)" />
                <g fill="rgba(95,187,149,.85)">
                  <circle cx="80" cy="76" r="2.6">
                    <animate attributeName="cx" values="50;380" dur="1.6s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="180" cy="76" r="2.6">
                    <animate attributeName="cx" values="50;380" dur="1.6s" begin=".5s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="280" cy="76" r="2.6">
                    <animate attributeName="cx" values="50;380" dur="1.6s" begin="1s" repeatCount="indefinite" />
                  </circle>
                </g>
                <text x="20" y="120" fill="currentColor" fontSize="11" fontFamily="ui-monospace, monospace" opacity=".7">
                  același debit, conductă scurtă și largă
                </text>
              </g>
            </svg>
          </div>
        </Reveal>

        <Reveal>
          <div className="factor-head">
            <span className="eyebrow">patru pârghii</span>
            <h3>De ce depinde rezistența</h3>
            <p>
              Relația <Formula tex="R=\rho L/A" /> are trei factori geometrici și
              de material. Al patrulea, temperatura, intră prin rezistivitate.
            </p>
          </div>
        </Reveal>

        <div className="factor-grid">
          {factorCards.map((factor, index) => {
            const FactorIcon = factor.icon;
            return (
              <Reveal
                key={factor.title}
                className={`factor-card factor-card-${factor.tone}`}
                delay={40 + index * 45}
              >
                <div className="factor-card-top">
                  <span className="factor-icon">
                    <FactorIcon size={19} />
                  </span>
                  <span className="factor-symbol">{factor.symbol}</span>
                </div>
                <h4>{factor.title}</h4>
                <span className="factor-law">{factor.law}</span>
                <p>{factor.text}</p>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="theory-compare" delay={50}>
          <div className="theory-compare-copy">
            <span className="eyebrow">rezistență vs. rezistivitate</span>
            <h3>Aceeași literă, două noțiuni diferite</h3>
            <p>
              Elevii le confundă des. <strong>Rezistivitatea</strong> ρ este o
              constantă de material: spune cât de bine conduce substanța.
              <strong> Rezistența</strong> R este o proprietate a obiectului
              concret și se schimbă dacă tai firul sau îl subțiezi.
            </p>
            <div className="callout">
              <span className="callout-icon">i</span>
              <p>
                Două fire din același cupru, unul de 10 cm și altul de 10 m, au
                aceeași rezistivitate, dar rezistențe foarte diferite. Și
                invers: un fir de cupru și unul de nicrom, tăiate la fel, au
                rezistențe diferite deși arată identic.
              </p>
            </div>
          </div>
          <div className="theory-compare-table">
            <table>
              <thead>
                <tr>
                  <th>mărimea</th>
                  <th>depinde de</th>
                  <th>unitate</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <b>ρ</b> rezistivitatea
                  </td>
                  <td>material, temperatură</td>
                  <td className="num">Ω·m</td>
                </tr>
                <tr>
                  <td>
                    <b>R</b> rezistența
                  </td>
                  <td>ρ, L, A, t</td>
                  <td className="num">Ω</td>
                </tr>
                <tr>
                  <td>
                    <b>G</b> conductanța
                  </td>
                  <td>1/R</td>
                  <td className="num">S</td>
                </tr>
              </tbody>
            </table>
            <div className="theory-compare-foot">
              <span>
                <Formula tex="G=\dfrac{1}{R}" />
              </span>
              <span>siemens = 1/ohm</span>
            </div>
          </div>
        </Reveal>

        <Reveal className="theory-link-row" delay={40}>
          <p>
            Legea firului se combină cu <strong>legea lui Ohm</strong> pentru o
            porțiune de circuit, <Formula tex="U=R\,I" />: aceeași tensiune
            produce un curent mai mic într-un fir mai rezistent.
          </p>
          <a className="button button-secondary button-small" href="#laborator">
            Vezi efectul în laborator
            <ArrowRight size={16} />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
