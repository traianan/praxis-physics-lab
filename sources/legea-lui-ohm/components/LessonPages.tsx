"use client";

import { Children, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

/** Secondary activities stay separate while their experiment's state stays in its parent. */
export function LessonPages({ id, title, labels, children }: {
  id: string; title?: string; labels: string[]; children: ReactNode;
}) {
  const [active, setActive] = useState(0);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const pages = Children.toArray(children);
  useEffect(() => {
    const sync = () => {
      const index = labels.findIndex((_, i) => window.location.hash === `#${id}-page-tab-${i}`);
      if (index >= 0) setActive(index);
    };
    sync(); window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [id, labels.length]);
  const move = (event: KeyboardEvent<HTMLButtonElement>) => {
    let next = active;
    if (event.key === "ArrowRight") next = (active + 1) % labels.length;
    else if (event.key === "ArrowLeft") next = (active + labels.length - 1) % labels.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = labels.length - 1;
    else return;
    event.preventDefault(); setActive(next); buttons.current[next]?.focus();
  };
  return <div className={`ohm-pages${title ? " has-title" : ""}`} onClick={event => {
    const link = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
    const index = labels.findIndex((_, i) => link?.hash === `#${id}-page-tab-${i}`);
    if (index < 0) return;
    event.preventDefault(); setActive(index);
    window.location.hash = `${id}-page-tab-${index}`;
  }}>
    {title ? <h2 className="ohm-panel-title">{title}</h2> : null}
    <div className="ohm-page-tabs" role="tablist" aria-label={title ?? "Activități"}>
      {labels.map((label, index) => <button key={label} type="button" role="tab"
        ref={node => { buttons.current[index] = node; }}
        id={`${id}-page-tab-${index}`} aria-controls={`${id}-page-panel`}
        aria-selected={active === index} tabIndex={active === index ? 0 : -1}
        onKeyDown={move} onClick={() => setActive(index)}>{label}</button>)}
    </div>
    <div className="ohm-page-panel" id={`${id}-page-panel`} role="tabpanel"
      aria-labelledby={`${id}-page-tab-${active}`} tabIndex={0}>{pages[active]}</div>
  </div>;
}
