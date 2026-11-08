"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "../app/concepts.css";
import { useTheme } from "./ThemeProvider";

type TabId = "teorie" | "laborator" | "circuit";
type LocaleText = { ro: string; en: string };
type Concept = {
  id: string;
  kind: "quantity" | "law" | "component" | "system";
  symbol: string;
  title: LocaleText;
  summary: LocaleText;
  detail: LocaleText;
  tab: TabId;
};
type ConceptNodeData = Concept & { language: "ro" | "en" };
type ConceptFlowNode = Node<ConceptNodeData, "concept">;

const concepts: Concept[] = [
  {
    id: "voltage",
    kind: "quantity",
    symbol: "U · volt (V)",
    title: { ro: "Tensiune electrică", en: "Voltage" },
    summary: { ro: "Diferența de potențial dintre două puncte.", en: "Potential difference between two points." },
    detail: { ro: "Tensiunea la bornele rezistorului se măsoară cu voltmetrul montat în paralel.", en: "Voltage across a resistor is measured with a voltmeter connected in parallel." },
    tab: "teorie",
  },
  {
    id: "current",
    kind: "quantity",
    symbol: "I · amper (A)",
    title: { ro: "Intensitatea curentului", en: "Current" },
    summary: { ro: "Sarcina electrică transportată în unitatea de timp.", en: "Electric charge transported per unit of time." },
    detail: { ro: "Curentul printr-un rezistor se măsoară cu ampermetrul montat în serie.", en: "Current through a resistor is measured with an ammeter connected in series." },
    tab: "laborator",
  },
  {
    id: "resistance",
    kind: "quantity",
    symbol: "R · ohm (Ω)",
    title: { ro: "Rezistență electrică", en: "Electrical resistance" },
    summary: { ro: "Măsura opoziției unui conductor la trecerea curentului.", en: "A measure of how strongly a conductor opposes current." },
    detail: { ro: "Pentru un conductor liniar, raportul U/I rămâne constant și este egal cu rezistența R.", en: "For an ohmic conductor, the ratio U/I remains constant and equals resistance R." },
    tab: "teorie",
  },
  {
    id: "ohm",
    kind: "law",
    symbol: "U = R · I",
    title: { ro: "Legea lui Ohm", en: "Ohm’s law" },
    summary: { ro: "Leagă tensiunea, curentul și rezistența unui conductor liniar.", en: "Relates voltage, current and resistance in an ohmic conductor." },
    detail: { ro: "La temperatură constantă, intensitatea curentului este direct proporțională cu tensiunea și invers proporțională cu rezistența.", en: "At constant temperature, current is directly proportional to voltage and inversely proportional to resistance." },
    tab: "teorie",
  },
  {
    id: "resistor",
    kind: "component",
    symbol: "R = constantă",
    title: { ro: "Rezistor liniar", en: "Ohmic resistor" },
    summary: { ro: "Componentă cu rezistență constantă în condiții date.", en: "A component with constant resistance under given conditions." },
    detail: { ro: "Caracteristica U–I este o dreaptă care trece prin origine; panta ei depinde de rezistență.", en: "Its U–I characteristic is a straight line through the origin; its slope depends on resistance." },
    tab: "laborator",
  },
  {
    id: "source",
    kind: "component",
    symbol: "E · r",
    title: { ro: "Sursă reală", en: "Real source" },
    summary: { ro: "O sursă cu tensiune electromotoare E și rezistență internă r.", en: "A source with electromotive force E and internal resistance r." },
    detail: { ro: "Tensiunea la borne scade odată cu curentul: U = E − rI.", en: "Terminal voltage decreases as current rises: U = E − rI." },
    tab: "circuit",
  },
  {
    id: "circuit",
    kind: "system",
    symbol: "I = E / (R + r)",
    title: { ro: "Circuit electric complet", en: "Complete circuit" },
    summary: { ro: "Sursa reală alimentează un consumator într-o buclă închisă.", en: "A real source powers a load in a closed loop." },
    detail: { ro: "Curentul depinde de rezistența externă R și de rezistența internă r a sursei.", en: "Current depends on external resistance R and the source’s internal resistance r." },
    tab: "circuit",
  },
];

const nodeTypes = { concept: ConceptNode };
const initialEdges: Edge[] = [
  { id: "voltage-ohm", source: "voltage", target: "ohm", sourceHandle: "bottom-source", targetHandle: "top-target", type: "smoothstep" },
  { id: "current-ohm", source: "current", target: "ohm", sourceHandle: "bottom-source", targetHandle: "top-target", type: "smoothstep" },
  { id: "resistance-ohm", source: "resistance", target: "ohm", sourceHandle: "bottom-source", targetHandle: "top-target", type: "smoothstep" },
  { id: "ohm-resistor", source: "ohm", target: "resistor", sourceHandle: "bottom-source", targetHandle: "top-target", type: "smoothstep" },
  { id: "source-circuit", source: "source", target: "circuit", type: "smoothstep" },
  { id: "resistor-circuit", source: "resistor", target: "circuit", type: "smoothstep" },
];

function ConceptNode({ data, selected }: NodeProps<ConceptFlowNode>) {
  const language = data.language;
  return (
    <article className={`concept-node concept-node-${data.kind}${selected ? " is-selected" : ""}`}>
      <Handle id="top-target" type="target" position={Position.Top} />
      <Handle id="right-target" type="target" position={Position.Right} />
      <Handle id="bottom-target" type="target" position={Position.Bottom} />
      <Handle id="left-target" type="target" position={Position.Left} />
      <span className="concept-node-kind">{kindLabel(data.kind, language)}</span>
      <strong>{data.title[language]}</strong>
      <span className="concept-node-symbol">{data.symbol}</span>
      <Handle id="top-source" type="source" position={Position.Top} />
      <Handle id="right-source" type="source" position={Position.Right} />
      <Handle id="bottom-source" type="source" position={Position.Bottom} />
      <Handle id="left-source" type="source" position={Position.Left} />
    </article>
  );
}

function kindLabel(kind: Concept["kind"], language: "ro" | "en") {
  const labels = {
    quantity: { ro: "Mărime fizică", en: "Physical quantity" },
    law: { ro: "Lege", en: "Law" },
    component: { ro: "Componentă", en: "Component" },
    system: { ro: "Sistem", en: "System" },
  };
  return labels[kind][language];
}

function ConceptMapCanvas({ onOpenTab }: { onOpenTab: (tab: TabId) => void }) {
  const { theme, language } = useTheme();
  const english = language === "en";
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("ohm");
  const [width, setWidth] = useState(1024);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const { fitView } = useReactFlow();
  const compact = width < 760;
  const activeConcept = concepts.find((concept) => concept.id === selectedId) ?? concepts[3];
  const normalizedQuery = query.trim().toLocaleLowerCase(english ? "en" : "ro");

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(surface);
    return () => observer.disconnect();
  }, []);

  const nodes = useMemo<ConceptFlowNode[]>(() => {
    const desktopPositions: Record<string, { x: number; y: number }> = {
      voltage: { x: 25, y: 24 }, current: { x: 360, y: 24 }, resistance: { x: 695, y: 24 },
      ohm: { x: 360, y: 205 }, resistor: { x: 25, y: 408 }, circuit: { x: 360, y: 408 }, source: { x: 695, y: 408 },
    };
    const compactPositions: Record<string, { x: number; y: number }> = {
      voltage: { x: 12, y: 16 }, current: { x: 202, y: 16 }, resistance: { x: 12, y: 158 },
      ohm: { x: 202, y: 158 }, resistor: { x: 12, y: 300 }, source: { x: 202, y: 300 }, circuit: { x: 107, y: 442 },
    };
    const positions = compact ? compactPositions : desktopPositions;
    return concepts.map((concept) => ({
      id: concept.id,
      type: "concept",
      position: positions[concept.id],
      data: { ...concept, language: english ? "en" : "ro" },
      style: { opacity: normalizedQuery && !`${concept.title.ro} ${concept.title.en} ${concept.symbol}`.toLocaleLowerCase().includes(normalizedQuery) ? 0.24 : 1 },
      ariaLabel: `${concept.title[english ? "en" : "ro"]}, ${concept.symbol}`,
    }));
  }, [compact, english, normalizedQuery]);

  const edges = useMemo(() => initialEdges.map((edge) => ({
    ...edge,
    ...(edge.id === "source-circuit" || edge.id === "resistor-circuit"
      ? compact
        ? { sourceHandle: "bottom-source", targetHandle: "top-target" }
        : edge.id === "source-circuit"
          ? { sourceHandle: "left-source", targetHandle: "right-target" }
          : { sourceHandle: "right-source", targetHandle: "left-target" }
      : {}),
    label: compact && edge.id === "resistance-ohm" ? "" : edge.id === "voltage-ohm" ? (english ? "voltage" : "tensiune")
      : edge.id === "current-ohm" ? (english ? "current" : "curent")
        : edge.id === "resistance-ohm" ? (english ? "resistance" : "rezistență")
          : edge.id === "ohm-resistor" ? (english ? "linear conductor" : "conductor liniar")
            : edge.id === "source-circuit" ? (english ? "supplies" : "alimentează")
              : (english ? "load" : "consumator"),
    labelStyle: { fill: theme === "dark" ? "#c7d3cb" : "#526960", fontSize: 10, fontWeight: 600 },
    labelBgStyle: { fill: theme === "dark" ? "#142624" : "#fffefa", fillOpacity: 0.96 },
    style: { stroke: theme === "dark" ? "#5a8980" : "#8aa79b", strokeWidth: 1.6 },
    markerEnd: { type: MarkerType.ArrowClosed, color: theme === "dark" ? "#5a8980" : "#8aa79b" },
  })), [compact, english, theme]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => fitView({ padding: compact ? 0.12 : 0.16, duration: 180, maxZoom: 1 }));
    return () => cancelAnimationFrame(frame);
  }, [compact, fitView]);

  const searchMatch = concepts.find((concept) => `${concept.title.ro} ${concept.title.en} ${concept.symbol}`.toLocaleLowerCase().includes(normalizedQuery));

  return (
    <section className="concept-map" data-theme={theme} aria-labelledby="concept-map-title">
      <header className="concept-map-header">
        <div>
          <p className="section-eyebrow">{english ? "CONNECTED IDEAS" : "IDEI CONECTATE"}</p>
          <h2 id="concept-map-title">{english ? "Ohm’s law concept map" : "Harta conceptelor despre legea lui Ohm"}</h2>
          <p className="concept-map-intro">{english ? "Follow how electrical quantities, components and circuit laws relate." : "Urmărește cum se leagă mărimile electrice, componentele și legile circuitului."}</p>
        </div>
        <div className="concept-map-tools">
          <label className="concept-search">
            <span aria-hidden="true">⌕</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={english ? "Find a concept" : "Caută un concept"} aria-label={english ? "Search concepts" : "Caută concepte"} />
          </label>
          <button type="button" className="concept-reset" onClick={() => { setQuery(""); fitView({ padding: compact ? 0.12 : 0.16, duration: 320, maxZoom: 1 }); }}>
            {english ? "Show all" : "Arată toată harta"}
          </button>
        </div>
      </header>

      {normalizedQuery && <p className="concept-search-status" aria-live="polite">{searchMatch ? (english ? `Highlighted: ${searchMatch.title.en}` : `Evidențiat: ${searchMatch.title.ro}`) : (english ? "No matching concept." : "Nu am găsit un concept potrivit.")}</p>}

      <div className="concept-map-legend" aria-label={english ? "Concept types" : "Tipuri de noduri"}>
        {(["quantity", "law", "component", "system"] as const).map((kind) => (
          <span key={kind} className={`concept-legend-item is-${kind}`}><i />{kindLabel(kind, english ? "en" : "ro")}</span>
        ))}
      </div>

      <div ref={surfaceRef} className={`concept-map-surface${compact ? " is-compact" : ""}`}>
        <ReactFlow
          key={compact ? "compact" : "wide"}
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => setSelectedId(node.id)}
          fitView
          fitViewOptions={{ padding: compact ? 0.12 : 0.16, maxZoom: 1 }}
          minZoom={0.38}
          maxZoom={1.2}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable
          edgesFocusable={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background variant={BackgroundVariant.Dots} gap={22} size={1} color={theme === "dark" ? "#38524c" : "#dfe7dd"} />
          <Controls showInteractive={false} position="bottom-right" />
        </ReactFlow>
      </div>

      <article className={`concept-detail concept-detail-${activeConcept.kind}`} aria-live="polite">
        <div className="concept-detail-copy">
          <span className="concept-node-kind">{kindLabel(activeConcept.kind, english ? "en" : "ro")}</span>
          <h3>{activeConcept.title[english ? "en" : "ro"]}<span>{activeConcept.symbol}</span></h3>
          <p>{activeConcept.summary[english ? "en" : "ro"]}</p>
          <p>{activeConcept.detail[english ? "en" : "ro"]}</p>
        </div>
        <button type="button" className="button button-secondary concept-open" onClick={() => onOpenTab(activeConcept.tab)}>
          {english ? "Open related section" : "Deschide secțiunea"}<span aria-hidden="true">→</span>
        </button>
      </article>

      <p className="concept-map-hint">{english ? "Select a node to see its meaning and open the related lesson section. Drag to pan; use the controls to zoom." : "Selectează un nod pentru explicație și acces la secțiunea lecției. Trage fundalul pentru deplasare; folosește comenzile pentru zoom."}</p>
    </section>
  );
}

export function ConceptMap({ onOpenTab }: { onOpenTab: (tab: TabId) => void }) {
  return <ReactFlowProvider><ConceptMapCanvas onOpenTab={onOpenTab} /></ReactFlowProvider>;
}
