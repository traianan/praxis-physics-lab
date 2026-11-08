import type { ReactNode } from "react";
import { ArrowRight, BookOpen, Bolt, Ruler, Target } from "./Icons";
import { Formula } from "./Formula";
import { FormulaTriangle } from "./FormulaTriangle";
import { CharacteristicGuide } from "./CharacteristicGuide";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

interface QuantityRow {
  symbol: string;
  name: string;
  unit: string;
  instrument: ReactNode;
  tone: string;
}

const quantities: QuantityRow[] = [
  {
    symbol: "U",
    name: "tensiunea electrică",
    unit: "volt (V)",
    instrument: "voltmetru, în paralel",
    tone: "amber",
  },
  {
    symbol: "I",
    name: "intensitatea curentului",
    unit: "amper (A)",
    instrument: "ampermetru, în serie",
    tone: "cyan",
  },
  {
    symbol: "R",
    name: "rezistența electrică",
    unit: "ohm (Ω)",
    instrument: "ohmetru sau U/I",
    tone: "copper",
  },
];

const observations = [
  {
    title: "Legea a fost formulată în 1827",
    body: (
      <>
        Dependența a fost descoperită de fizicianul german{" "}
        <strong>Georg Simon Ohm</strong>. În onoarea lui, unitatea de măsură a
        rezistenței se numește <em>ohm</em> și se notează <Formula tex="\Omega" />.
      </>
    ),
  },
  {
    title: "Valabilă doar pe o porțiune fără generatoare",
    body: (
      <>
        Forma <Formula tex="I=U/R" /> se aplică pe o porțiune de circuit care{" "}
        <strong>nu conține surse</strong>. Pentru un circuit întreg, cu sursă și
        rezistență internă, legea se extinde la{" "}
        <Formula tex="I=E/(R+r)" />.
      </>
    ),
  },
  {
    title: "Conductori ohmici",
    body: (
      <>
        Sunt conductori pentru care legea lui Ohm este valabilă: caracteristica
        U–I este o dreaptă prin origine. Un bec nu este un dispozitiv ohmic, pentru
        că filamentul se încălzește și își schimbă rezistența.
      </>
    ),
  },
  {
    title: "Ordine de mărime uzuale",
    body: (
      <>
        În circuite se folosesc rezistoare de ordinul{" "}
        <Formula tex="1\ \mathrm{k\Omega}=10^{3}\ \Omega" /> sau{" "}
        <Formula tex="1\ \mathrm{M\Omega}=10^{6}\ \Omega" />. Instrumentele de
        laborator au rezistențe interne mult mai mari sau mult mai mici decât
        acestea — de aceea contează montajul.
      </>
    ),
  },
];

export function TheorySection() {
  return (
    <section className="section theory-section" id="teorie">
      <div className="container">
        <Reveal>
          <SectionHeading
            index="01"
            eyebrow="Legea lui Ohm"
            title="Rezistența electrică și legea lui Ohm"
            lead="Un rezistor liniar are o caracteristică curent-tensiune dreaptă: intensitatea este proporțională cu tensiunea aplicată. Din acest raport se naște legea care poartă numele lui Ohm — și definiția unității de rezistență."
          />
        </Reveal>

        <div className="theory-top">
          <Reveal className="definition-panel" delay={40}>
            <div className="definition-quote">
              <span className="definition-mark">“</span>
              <p>
                Intensitatea curentului care trece printr-un rezistor este
                proporțională cu tensiunea aplicată la capetele lui.
              </p>
              <Formula
                block
                tex="I=\dfrac{U}{R}\qquad\text{sau}\qquad U=R\cdot I"
                label="I egal U supra R, sau U egal R ori I"
                className="definition-formula"
              />
              <div className="definition-chips">
                <span className="chip chip-amber">proporționalitate directă</span>
                <span className="chip chip-cyan">caracteristică liniară</span>
                <span className="chip">T = constant</span>
              </div>
            </div>
            <div className="definition-note">
              <BookOpen size={18} />
              <p>
                Rezistența <Formula tex="R" /> este constanta de proporționalitate.
                Ea nu depinde de tensiune sau de curent, ci de material, lungime,
                secțiune și temperatură. Un rezistor studiat în laborator are{" "}
                <Formula tex="R\approx 267{,}5\ \Omega" />.
              </p>
            </div>
          </Reveal>

          <Reveal className="unit-panel" delay={110}>
            <div className="unit-panel-head">
              <span className="card-kicker">definiția unității</span>
              <span className="chip chip-copper">1 Ω</span>
            </div>
            <Formula
              block
              tex="[R]_{\mathrm{SI}}=\frac{[U]_{\mathrm{SI}}}{[I]_{\mathrm{SI}}}=\frac{1\ \mathrm{V}}{1\ \mathrm{A}}=1\ \Omega"
              label="unitatea de rezistență este volt pe amper, adică un ohm"
              className="unit-formula"
            />
            <p className="unit-definition">
              <strong>1 ohm</strong> este rezistența unui conductor prin care se
              stabilește un curent de <strong>1 A</strong> atunci când la capetele
              lui se aplică o tensiune constantă de <strong>1 V</strong>.
            </p>
            <div className="unit-derived">
              <span className="card-kicker">unități derivate frecvent</span>
              <div className="unit-derived-grid">
                <div>
                  <strong>1 kΩ</strong>
                  <span>10³ Ω</span>
                </div>
                <div>
                  <strong>1 MΩ</strong>
                  <span>10⁶ Ω</span>
                </div>
                <div>
                  <strong>1 mΩ</strong>
                  <span>10⁻³ Ω</span>
                </div>
              </div>
            </div>
            <div className="unit-note">
              <Bolt size={16} />
              <p>
                Unitatea se citește „ohm”, se scrie cu literă mare Ω și nu are
                plural în SI.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={50}>
          <div className="quantity-strip">
            <span className="eyebrow">mărimile legii</span>
            <div className="quantity-grid">
              {quantities.map((row) => (
                <div className={`quantity-card quantity-card-${row.tone}`} key={row.symbol}>
                  <span className="quantity-symbol">{row.symbol}</span>
                  <div>
                    <strong>{row.name}</strong>
                    <span className="quantity-unit">{row.unit}</span>
                    <span className="quantity-instrument">
                      <Ruler size={13} />
                      {row.instrument}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="theory-split">
          <Reveal delay={40}>
            <FormulaTriangle />
          </Reveal>
          <Reveal delay={90}>
            <div className="characteristic-card">
              <div className="characteristic-head">
                <div>
                  <span className="card-kicker">caracteristica curent–tensiune</span>
                  <h3>Aceeași lege, văzută pe grafic</h3>
                </div>
                <span className="chip">U = f(I)</span>
              </div>
              <CharacteristicGuide />
              <p className="characteristic-note">
                Pentru un conductor ohmic, graficul <Formula tex="I=f(U)" /> este o
                dreaptă care trece prin origine: dublarea tensiunii dublează
                curentul. Panta dreptei este <Formula tex="1/R" />.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal className="observations-card" delay={50}>
          <div className="observations-head">
            <div>
              <span className="eyebrow">Idei esențiale</span>
              <h3>Ce trebuie reținut</h3>
            </div>
            <a className="button button-secondary button-small" href="#laborator">
              Verifică experimental
              <ArrowRight size={16} />
            </a>
          </div>
          <div className="observations-grid">
            {observations.map((item, index) => (
              <article className="observation" key={item.title}>
                <span className="observation-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal className="review-card" delay={40}>
          <div className="review-card-copy">
            <span className="eyebrow">Problemă rezolvată</span>
            <h3>Compară măsurarea cu valoarea de fabricant</h3>
            <p>
              Un rezistor este măsurat indirect: se măsoară tensiunea la capetele
              lui și curentul care îl străbate. Rezultatele sunt{" "}
              <Formula tex="U=5{,}35\ \mathrm{V}" /> și{" "}
              <Formula tex="I=20\ \mathrm{mA}" />. Ce rezistență obții și cum se
              compară cu valoarea marcată de <Formula tex="267{,}5\ \Omega" />?
            </p>
            <div className="review-card-chips">
              <span className="chip chip-amber">aplică R = U / I</span>
              <span className="chip">atenție la mA</span>
            </div>
          </div>
          <div className="review-card-solution">
            <div className="solution-step">
              <span className="solution-label">1 · unități</span>
              <p>
                <Formula tex="I=20\ \mathrm{mA}=0{,}020\ \mathrm{A}" />
              </p>
            </div>
            <div className="solution-step">
              <span className="solution-label">2 · calcul</span>
              <p>
                <Formula tex="R=\dfrac{5{,}35}{0{,}020}=267{,}5\ \Omega" />
              </p>
            </div>
            <div className="solution-step solution-step-accent">
              <span className="solution-label">3 · concluzie</span>
              <p>
                Rezultatul coincide exact cu valoarea de fabricant: în interiorul
                toleranței, conductorul este ohmic.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal className="callout-row" delay={60}>
          <div className="callout">
            <span className="callout-icon">!</span>
            <p>
              <strong>Nu confunda U cu E.</strong> Tensiunea <Formula tex="U" /> se
              măsoară la bornele consumatorului. Tensiunea electromotoare{" "}
              <Formula tex="E" /> aparține sursei. Într-un circuit închis,{" "}
              <Formula tex="U<E" />, iar diferența se pierde pe rezistența internă.
            </p>
          </div>
          <div className="callout callout-cyan">
            <span className="callout-icon">
              <Target size={16} />
            </span>
            <p>
              <strong>Verificare rapidă.</strong> La <Formula tex="U=12\ \mathrm{V}" />{" "}
              și <Formula tex="R=40\ \Omega" />, curentul este{" "}
              <Formula tex="I=0{,}3\ \mathrm{A}=300\ \mathrm{mA}" />, iar puterea
              disipată <Formula tex="P=UI=3{,}6\ \mathrm{W}" />.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
