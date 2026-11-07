"use client";

import { useEffect, useState } from "react";

/**
 * Ilustrația din hero: un fir conductor tăiat, cu rețea cristalină,
 * electroni în mișcare și borna de măsurare. Mișcarea este oprită dacă
 * utilizatorul preferă animații reduse.
 */
export function HeroDiagram() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const electrons = Array.from({ length: 14 }, (_, index) => index);

  return (
    <div className="hero-visual" aria-hidden="true">
      <div className="hero-visual-glow" />
      <div className="hero-badge hero-badge-top">
        <span className="hero-badge-dot" />
        <span>conductor sub tensiune</span>
      </div>
      <svg
        className="hero-svg"
        viewBox="0 0 600 500"
        role="presentation"
        focusable="false"
      >
        <defs>
          <linearGradient id="hero-wire" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#f0b989" />
            <stop offset="0.35" stopColor="#c8804c" />
            <stop offset="0.62" stopColor="#9c5a2f" />
            <stop offset="1" stopColor="#6d3a1c" />
          </linearGradient>
          <linearGradient id="hero-glass" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="rgba(246,244,239,.10)" />
            <stop offset="1" stopColor="rgba(246,244,239,.02)" />
          </linearGradient>
          <radialGradient id="hero-halo">
            <stop stopColor="#e0a06a" stopOpacity=".38" />
            <stop offset="1" stopColor="#e0a06a" stopOpacity="0" />
          </radialGradient>
          <pattern id="hero-grid" width="34" height="34" patternUnits="userSpaceOnUse">
            <path
              d="M 34 0 L 0 0 0 34"
              fill="none"
              stroke="rgba(143,211,182,.09)"
              strokeWidth="1"
            />
          </pattern>
          <filter id="hero-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id="hero-wire-clip">
            <rect x="60" y="236" width="480" height="76" rx="10" />
          </clipPath>
        </defs>

        <rect x="30" y="30" width="540" height="440" rx="28" fill="url(#hero-glass)" />
        <rect x="30" y="30" width="540" height="440" rx="28" fill="url(#hero-grid)" />

        {/* borna de măsurare */}
        <g opacity=".9">
          <line x1="60" y1="274" x2="30" y2="274" stroke="rgba(246,244,239,.22)" />
          <line x1="540" y1="274" x2="570" y2="274" stroke="rgba(246,244,239,.22)" />
          <text
            x="44"
            y="316"
            fill="rgba(246,244,239,.55)"
            fontSize="11"
            fontFamily="ui-monospace, Consolas, monospace"
          >
            A
          </text>
          <text
            x="548"
            y="316"
            fill="rgba(246,244,239,.55)"
            fontSize="11"
            fontFamily="ui-monospace, Consolas, monospace"
          >
            B
          </text>
        </g>

        {/* firul */}
        <g>
          <rect
            x="58"
            y="234"
            width="484"
            height="80"
            rx="12"
            fill="rgba(0,0,0,.35)"
          />
          <rect x="60" y="236" width="480" height="76" rx="10" fill="url(#hero-wire)" />
          <rect
            x="60"
            y="236"
            width="480"
            height="18"
            rx="9"
            fill="rgba(255,255,255,.14)"
          />
          <ellipse cx="60" cy="274" rx="9" ry="38" fill="#7f4726" />
          <ellipse cx="60" cy="274" rx="6" ry="32" fill="#a8623a" />
          <ellipse cx="540" cy="274" rx="9" ry="38" fill="#7f4726" />
          <ellipse cx="540" cy="274" rx="6" ry="32" fill="#a8623a" />

          {/* rețeaua cristalină */}
          <g clipPath="url(#hero-wire-clip)" opacity=".5">
            {Array.from({ length: 9 }, (_, row) => (
              <g key={`row-${row}`}>
                {Array.from({ length: 18 }, (_, column) => (
                  <circle
                    key={`ion-${row}-${column}`}
                    cx={72 + column * 26 + (row % 2) * 13}
                    cy={252 + row * 8}
                    r="1.6"
                    fill="#ffe0bf"
                    opacity=".5"
                  />
                ))}
              </g>
            ))}
          </g>

          {/* electroni */}
          <g clipPath="url(#hero-wire-clip)">
            {electrons.map((index) => {
              const row = index % 5;
              const delay = (index * 0.42).toFixed(2);
              return (
                <circle key={`e-${index}`} r="2.6" fill="#ffe9c9" filter="url(#hero-soft)">
                  <animate
                    attributeName="cy"
                    values={`${248 + row * 14};${250 + row * 14};${248 + row * 14}`}
                    dur={`${2.4 + row * 0.3}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="cx"
                    values="76;524"
                    dur="6.4s"
                    begin={`${delay}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;1;1;0"
                    dur="6.4s"
                    begin={`${delay}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              );
            })}
          </g>

          {/* contur după umplere, ca marginile să rămână curate */}
          <rect
            x="60"
            y="236"
            width="480"
            height="76"
            rx="10"
            fill="none"
            stroke="rgba(255,220,190,.18)"
            strokeWidth="1"
          />
        </g>

        {/* săgeata curentului */}
        <g opacity=".8">
          <path
            d="M100 206h400"
            stroke="rgba(246,244,239,.28)"
            strokeWidth="1.2"
            strokeDasharray="4 6"
          />
          <path d="M508 206l-12-5v10Z" fill="rgba(246,244,239,.5)" />
          <text
            x="100"
            y="196"
            fill="rgba(246,244,239,.5)"
            fontSize="11"
            fontFamily="ui-monospace, Consolas, monospace"
          >
            sens convențional al curentului I
          </text>
        </g>

        {/* marcaje L și d */}
        <g fontFamily="ui-monospace, Consolas, monospace" fontSize="11">
          <g stroke="rgba(143,211,182,.5)">
            <line x1="60" y1="342" x2="540" y2="342" />
            <line x1="60" y1="336" x2="60" y2="348" />
            <line x1="540" y1="336" x2="540" y2="348" />
          </g>
          <text x="288" y="362" fill="rgba(143,211,182,.85)">
            L
          </text>
          <g stroke="rgba(217,162,74,.6)">
            <line x1="556" y1="236" x2="556" y2="312" />
            <line x1="550" y1="236" x2="562" y2="236" />
            <line x1="550" y1="312" x2="562" y2="312" />
          </g>
          <text x="566" y="278" fill="rgba(217,162,74,.9)">
            d
          </text>
        </g>

        {/* cercurile de câmp în jurul conductorului */}
        <circle cx="300" cy="274" r="120" fill="none" stroke="url(#hero-halo)" strokeWidth="1">
          {!reduced ? (
            <>
              <animate attributeName="r" values="96;140;96" dur="6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values=".5;.1;.5" dur="6s" repeatCount="indefinite" />
            </>
          ) : null}
        </circle>

        {/* formula-card */}
        <g transform="translate(66 60)">
          <rect width="212" height="104" rx="16" fill="rgba(6,16,22,.62)" stroke="rgba(246,244,239,.14)" />
          <text
            x="18"
            y="34"
            fill="rgba(246,244,239,.5)"
            fontSize="10"
            letterSpacing="1.6"
            fontFamily="ui-monospace, Consolas, monospace"
          >
            LEGEA FIRULUI
          </text>
          <text
            x="18"
            y="72"
            fill="#f6f4ef"
            fontSize="27"
            fontFamily="Georgia, 'Palatino Linotype', serif"
          >
            R = ρ·L / A
          </text>
          <text
            x="18"
            y="92"
            fill="rgba(143,211,182,.75)"
            fontSize="10"
            fontFamily="ui-monospace, Consolas, monospace"
          >
            ρ ≠ R · R depinde de geometrie
          </text>
        </g>
      </svg>
      <div className="hero-visual-caption">
        <span className="hero-visual-caption-line" />
        <span>electronii se mișcă lent · semnalul, aproape instantaneu</span>
      </div>
    </div>
  );
}
