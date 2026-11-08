import type { ReactNode } from "react";

interface SectionHeadingProps {
  index: string;
  eyebrow: string;
  title: string;
  lead?: string;
  action?: ReactNode;
}

export function SectionHeading({
  index,
  eyebrow,
  title,
  lead,
  action,
}: SectionHeadingProps) {
  return (
    <header className={`section-heading ${action ? "section-heading-row" : ""}`}>
      <div className="section-heading-copy">
        <div className="section-eyebrow">
          <span className="section-index">{index}</span>
          <span>{eyebrow}</span>
        </div>
        <h2>{title}</h2>
        {lead ? <p className="section-lead">{lead}</p> : null}
      </div>
      {action ? <div className="section-heading-action">{action}</div> : null}
    </header>
  );
}
