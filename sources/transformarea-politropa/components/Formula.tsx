"use client";

import katex from "katex";
import { useMemo } from "react";

interface FormulaProps {
  tex: string;
  block?: boolean;
  className?: string;
  label?: string;
}

export function Formula({ tex, block = false, className = "", label }: FormulaProps) {
  const html = useMemo(
    () =>
      katex.renderToString(tex, {
        displayMode: block,
        throwOnError: false,
        strict: false,
        trust: false,
        output: "htmlAndMathml",
      }),
    [tex, block],
  );

  if (block) {
    return (
      <div
        className={`formula formula-block ${className}`}
        role="math"
        aria-label={label}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`formula ${className}`}
      role="math"
      aria-label={label}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
