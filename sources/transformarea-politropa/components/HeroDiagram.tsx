export function HeroDiagram() {
  return (
    <div className="hero-visual" aria-hidden="true">
      <div className="hero-visual-glow" />
      <div className="hero-badge hero-badge-top">
        <span className="hero-badge-dot" />
        <span>o singură lege</span>
      </div>
      <svg
        className="hero-svg"
        viewBox="0 0 580 480"
        role="presentation"
        focusable="false"
      >
        <defs>
          <pattern id="hero-grid" width="34" height="34" patternUnits="userSpaceOnUse">
            <path
              d="M 34 0 L 0 0 0 34"
              fill="none"
              stroke="rgba(197,232,165,.10)"
              strokeWidth="1"
            />
          </pattern>
          <linearGradient id="hero-current" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#E8B85C" />
            <stop offset="1" stopColor="#C5E8A5" />
          </linearGradient>
          <radialGradient id="hero-halo">
            <stop stopColor="#C5E8A5" stopOpacity=".35" />
            <stop offset="1" stopColor="#C5E8A5" stopOpacity="0" />
          </radialGradient>
          <filter id="hero-soft-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect x="44" y="34" width="500" height="404" rx="28" fill="rgba(255,255,255,.025)" />
        <rect x="44" y="34" width="500" height="404" rx="28" fill="url(#hero-grid)" />

        <g stroke="rgba(238,246,240,.16)" strokeWidth="1.2">
          <line x1="82" y1="404" x2="538" y2="404" />
          <line x1="82" y1="404" x2="82" y2="58" />
        </g>
        <path d="M82 48l-5 10h10Z" fill="rgba(238,246,240,.55)" />
        <path d="M548 404l-10-5v10Z" fill="rgba(238,246,240,.55)" />
        <text x="64" y="58" fill="rgba(238,246,240,.7)" fontSize="13" fontFamily="Georgia, serif" fontStyle="italic">
          p
        </text>
        <text x="532" y="430" fill="rgba(238,246,240,.7)" fontSize="13" fontFamily="Georgia, serif" fontStyle="italic">
          V
        </text>

        <g fill="none" strokeLinecap="round">
          <path
            d="M82 404 C150 330 205 285 270 270 C355 250 455 190 538 160"
            stroke="rgba(232,184,92,.48)"
            strokeWidth="1.6"
            strokeDasharray="5 6"
          />
          <path
            d="M270 270 C340 300 435 330 538 348"
            stroke="rgba(116,197,255,.7)"
            strokeWidth="2"
          />
          <path
            d="M270 270 C342 306 440 344 538 368"
            stroke="rgba(197,232,165,.75)"
            strokeWidth="2"
          />
          <path
            d="M270 270 C360 315 455 355 538 385"
            stroke="rgba(244,145,145,.55)"
            strokeWidth="1.6"
            strokeDasharray="4 5"
          />
          <path
            d="M270 270 L538 270"
            stroke="rgba(238,246,240,.5)"
            strokeWidth="1.6"
            strokeDasharray="4 6"
          />
          <path
            d="M270 270 L270 404"
            stroke="rgba(203,174,255,.55)"
            strokeWidth="1.6"
            strokeDasharray="4 6"
          />
          <path
            d="M82 404 L538 98"
            stroke="url(#hero-current)"
            strokeWidth="2.6"
            filter="url(#hero-soft-glow)"
          />
        </g>

        <g stroke="rgba(238,246,240,.14)" strokeDasharray="3 5">
          <line x1="270" y1="270" x2="82" y2="270" />
          <line x1="270" y1="270" x2="270" y2="404" />
        </g>

        <g fontFamily="ui-monospace, SFMono-Regular, Consolas, monospace" fontSize="11">
          <g fill="#E8B85C">
            <circle cx="548" cy="158" r="3.5" />
            <text x="518" y="143" textAnchor="end">n = −1</text>
          </g>
          <g fill="rgba(238,246,240,.78)">
            <circle cx="548" cy="270" r="3.5" />
            <text x="528" y="258" textAnchor="end">n = 0</text>
          </g>
          <g fill="#74C5FF">
            <circle cx="548" cy="348" r="3.5" />
            <text x="518" y="340" textAnchor="end">n = 1</text>
          </g>
          <g fill="#C5E8A5">
            <circle cx="548" cy="368" r="3.5" />
            <text x="518" y="388" textAnchor="end">n = γ</text>
          </g>
          <g fill="#CBAEFF">
            <circle cx="270" cy="74" r="3.5" />
            <text x="282" y="78">n → ±∞</text>
          </g>
        </g>

        <circle cx="270" cy="270" r="54" fill="url(#hero-halo)">
          <animate attributeName="r" values="44;62;44" dur="4.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values=".55;.2;.55" dur="4.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="270" cy="270" r="7" fill="#0B2B26" stroke="#E8B85C" strokeWidth="2.5" />
        <circle cx="270" cy="270" r="2.4" fill="#F7F5EE" />
        <text x="248" y="252" fill="rgba(247,245,238,.7)" fontSize="11" fontFamily="ui-monospace, monospace">
          stare inițială
        </text>

        <circle r="5" fill="#F7F5EE" filter="url(#hero-soft-glow)">
          <animateMotion
            dur="8s"
            repeatCount="indefinite"
            path="M270,270 C340,300 435,330 538,348"
          />
        </circle>

        <g fontFamily="Georgia, serif" fontSize="15" fill="rgba(247,245,238,.9)">
          <text x="96" y="82">pVⁿ = constant</text>
          <text x="96" y="102" fontSize="11" fill="rgba(197,232,165,.7)" fontFamily="ui-monospace, monospace">
            n ∈ (−∞, ∞)
          </text>
        </g>
      </svg>
      <div className="hero-visual-caption">
        <span className="hero-visual-caption-line" />
        <span>aceeași stare inițială · cinci procese simple</span>
      </div>
    </div>
  );
}
