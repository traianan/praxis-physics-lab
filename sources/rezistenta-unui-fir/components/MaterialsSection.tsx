"use client";

import { useMemo, useState } from "react";
import { compareMaterials, MATERIALS, MATERIAL_MAP } from "@/lib/resistance";
import { fmt, fmtResistance, fmtRho } from "@/lib/format";
import { Formula } from "./Formula";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { Compare, Layers, Scale, Sparkles } from "./Icons";

type SortKey = "resistance" | "alpha" | "density";

const SORTS: Array<{ key: SortKey; label: string; hint: string }> = [
  { key: "resistance", label: "după rezistență", hint: "cel mai bun conductor sus" },
  { key: "alpha", label: "după α", hint: "stabilitate cu temperatura" },
  { key: "density", label: "după densitate", hint: "ușurința construcției" },
];

export function MaterialsSection() {
  const [sortKey, setSortKey] = useState<SortKey>("resistance");
  const [selected, setSelected] = useState("nicrom");

  const rows = useMemo(() => {
    const base = compareMaterials(1, 1, 20);
    const sorted = [...base];
    if (sortKey === "alpha") {
      sorted.sort(
        (a, b) => Math.abs(a.material.alpha) - Math.abs(b.material.alpha),
      );
    } else if (sortKey === "density") {
      sorted.sort((a, b) => a.material.density - b.material.density);
    }
    return sorted;
  }, [sortKey]);

  const maxResistance = Math.max(...rows.map((row) => row.resistance));
  const active = MATERIAL_MAP[MATERIALS.find((m) => m.id === selected)?.id ?? "cupru"];
  const copper = MATERIAL_MAP.cupru;
  const activeRatio = active.rho20 / copper.rho20;
  const activeAreaRatio = active.rho20 / copper.rho20;
  const activeMassRatio =
    (active.density * active.rho20) / (copper.density * copper.rho20);

  return (
    <section className="section section-materials section-deep" id="materiale">
      <div className="container">
        <Reveal>
          <SectionHeading
            index="04"
            eyebrow="Tabel de materiale"
            title="Aceeași formă, materiale diferite"
            lead="Toate firele din tabel au 1 m lungime și 1 mm² secțiune. Diferența de rezistență vine exclusiv din rezistivitate — adică din material. Alege un rând pentru detalii și pentru comparația cu cuprul."
            action={
              <span className="head-chip">
                <Layers size={16} />
                10 materiale
              </span>
            }
          />
        </Reveal>

        <Reveal className="materials-shell" delay={40}>
          <div className="materials-toolbar">
            <div className="materials-sorts" role="group" aria-label="Ordonează tabelul">
              {SORTS.map((sort) => (
                <button
                  key={sort.key}
                  type="button"
                  className={`materials-sort ${sortKey === sort.key ? "is-active" : ""}`}
                  onClick={() => setSortKey(sort.key)}
                  aria-pressed={sortKey === sort.key}
                  title={sort.hint}
                >
                  {sort.label}
                </button>
              ))}
            </div>
            <span className="materials-unit">
              ρ la 20 °C · L = 1 m · A = 1 mm²
            </span>
          </div>

          <div className="materials-table" role="table" aria-label="Rezistivitatea materialelor">
            <div className="materials-row materials-row-head" role="row">
              <span role="columnheader">materialul</span>
              <span role="columnheader">ρ (Ω·mm²/m)</span>
              <span role="columnheader">R la 1 m · 1 mm²</span>
              <span role="columnheader">α (K⁻¹)</span>
              <span role="columnheader">densitate</span>
            </div>

            {rows.map((row) => {
              const material = row.material;
              const isActive = material.id === active.id;
              return (
                <button
                  key={material.id}
                  type="button"
                  role="row"
                  className={`materials-row ${isActive ? "is-active" : ""}`}
                  onClick={() => setSelected(material.id)}
                  aria-pressed={isActive}
                >
                  <span className="materials-name" role="cell">
                    <i
                      className="materials-swatch"
                      style={{ background: material.color }}
                    />
                    <span>
                      <strong>
                        {material.name} <em>{material.symbol}</em>
                      </strong>
                      <small>{material.use}</small>
                    </span>
                  </span>
                  <span className="materials-rho" role="cell">
                    {fmt(material.rho20 * 1e6, material.rho20 < 1e-7 ? 3 : 2)}
                  </span>
                  <span className="materials-bar-cell" role="cell">
                    <span className="materials-bar">
                      <i
                        style={{
                          width: `${Math.max(
                            3,
                            (Math.log10(row.resistance * 1e4 + 1) /
                              Math.log10(maxResistance * 1e4 + 1)) *
                              100,
                          ).toFixed(2)}%`,
                          background: material.color,
                        }}
                      />
                    </span>
                    <b>{fmtResistance(row.resistance, row.resistance < 0.1 ? 3 : 2)}</b>
                  </span>
                  <span className="materials-alpha" role="cell">
                    {material.alpha >= 0 ? "+" : "−"}
                    {fmt(Math.abs(material.alpha), 5)}
                  </span>
                  <span className="materials-density" role="cell">
                    {fmt(material.density, 0)} kg/m³
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <div className="materials-detail">
          <Reveal className="materials-detail-card" delay={40}>
            <div className="materials-detail-head">
              <div>
                <span className="card-kicker">material selectat</span>
                <h3>
                  {active.name} <em>{active.symbol}</em>
                </h3>
              </div>
              <span className="chip">{active.note}</span>
            </div>

            <p className="materials-detail-lead">
              {active.family === "metal"
                ? "Metal: electroni aproape liberi, rezistivitate mică și α pozitiv. Se folosește unde contează pierderile mici."
                : active.family === "aliaj"
                  ? active.id === "constantan"
                    ? "Aliaj cu α foarte mic: rezistența aproape nu se schimbă cu temperatura, de aceea se folosește la rezistențe etalon și la termocuple."
                    : "Aliaj cu rezistivitate mare și rezistență bună la temperaturi înalte — exact ce trebuie pentru un element de încălzire."
                  : "Nemetal: rețea covalentă, purtători puțini. La grafit α este negativ, deci rezistența scade la încălzire."}
            </p>

            <div className="materials-compare-grid">
              <div>
                <span className="card-kicker">față de cupru, aceeași formă</span>
                <strong>×{fmt(activeRatio, 1)}</strong>
                <small>rezistență</small>
              </div>
              <div>
                <span className="card-kicker">aria necesară pentru același R</span>
                <strong>×{fmt(activeAreaRatio, 1)}</strong>
                <small>
                  {activeAreaRatio > 1
                    ? "fir mai gros decât cuprul"
                    : "fir mai subțire decât cuprul"}
                </small>
              </div>
              <div>
                <span className="card-kicker">masa la rezistență egală</span>
                <strong>×{fmt(activeMassRatio, 2)}</strong>
                <small>
                  {activeMassRatio < 1
                    ? "mai ușor decât cuprul"
                    : "mai greu decât cuprul"}
                </small>
              </div>
            </div>

            <div className="materials-formula">
              <Formula tex="R=\rho\dfrac{L}{A}\ \Rightarrow\ A_{egal}=\dfrac{\rho\,L}{R}" />
            </div>

            <p className="materials-detail-note">
              De aceea liniile electrice folosesc aluminiu, deși are rezistivitate
              mai mare: la aceeași rezistență, un conductor de aluminiu cântărește
              aproximativ <b>jumătate</b> față de unul de cupru. La reșouri se
              alege nicromul tocmai pentru că rezistivitatea lui mare produce
              căldură cu un fir scurt.
            </p>
          </Reveal>

          <Reveal className="materials-cards" delay={80}>
            <div className="materials-card">
              <span className="materials-card-icon">
                <Compare size={18} />
              </span>
              <h4>Cei mai buni conductori</h4>
              <p>
                Argintul, cuprul și aurul stau în frunte. Argintul conduce cel
                mai bine, dar costul îl rezervă contactelor; cuprul rămâne
                standardul practic.
              </p>
              <span className="materials-card-metric">
                ρ(Ag) ≈ {fmtRho(MATERIAL_MAP.argint.rho20)}
              </span>
            </div>
            <div className="materials-card">
              <span className="materials-card-icon">
                <Scale size={18} />
              </span>
              <h4>Compromisul masei</h4>
              <p>
                Aluminiul are ρ de circa 1,6 ori mai mare decât cuprul, dar
                densitatea de 3,3 ori mai mică. La aceeași rezistență iese mai
                ușor.
              </p>
              <span className="materials-card-metric">
                masa(Al)/masa(Cu) ≈{" "}
                {fmt(
                  (MATERIAL_MAP.aluminiu.density * MATERIAL_MAP.aluminiu.rho20) /
                    (MATERIAL_MAP.cupru.density * MATERIAL_MAP.cupru.rho20),
                  2,
                )}
              </span>
            </div>
            <div className="materials-card">
              <span className="materials-card-icon">
                <Sparkles size={18} />
              </span>
              <h4>Aliaje „stabile”</h4>
              <p>
                Constantanul are α ≈ 0,00002 K⁻¹: rezistența aproape nu se
                schimbă cu temperatura. De aceea se folosește la rezistențe
                etalon și la termocuple.
              </p>
              <span className="materials-card-metric">
                α(constantan) = {fmt(MATERIAL_MAP.constantan.alpha, 5)} K⁻¹
              </span>
            </div>
            <div className="materials-card materials-card-warn">
              <span className="materials-card-icon">
                <Layers size={18} />
              </span>
              <h4>Excepția grafitului</h4>
              <p>
                La grafit, α este negativ: la încălzire rezistivitatea scade.
                Comportamentul este tipic pentru semiconductori și nemetale.
              </p>
              <span className="materials-card-metric">
                α(grafit) = {fmt(MATERIAL_MAP.grafit.alpha, 5)} K⁻¹
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
