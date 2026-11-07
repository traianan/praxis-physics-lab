import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 20, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function LogoMark({ size = 34, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <rect width="40" height="40" rx="12" fill="url(#wire-logo)" />
      <path
        d="M6 20h7c2.2 0 2.2-6 4.4-6s2.2 12 4.4 12 2.2-6 4.4-6H34"
        stroke="#0b1119"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="33" cy="20" r="2.2" fill="#0b1119" />
      <circle cx="7" cy="20" r="2.2" fill="#0b1119" />
      <defs>
        <linearGradient id="wire-logo" x1="2" y1="0" x2="38" y2="40">
          <stop stopColor="#f2c98a" />
          <stop offset=".55" stopColor="#d18a52" />
          <stop offset="1" stopColor="#b06a3c" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function ArrowRight(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </Icon>
  );
}

export function ArrowDown(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 4v15" />
      <path d="m6 13 6 6 6-6" />
    </Icon>
  );
}

export function ArrowLeft(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 12H5" />
      <path d="m11 6-6 6 6 6" />
    </Icon>
  );
}

export function Play(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m8 5 11 7-11 7Z" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function Pause(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="7" y="5" width="3.5" height="14" rx="1" fill="currentColor" stroke="none" />
      <rect x="13.5" y="5" width="3.5" height="14" rx="1" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function Reset(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 11a8 8 0 1 1 2.3 6.1" />
      <path d="M4 5v6h6" />
    </Icon>
  );
}

export function Sun(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </Icon>
  );
}

export function Moon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 14.6A8.2 8.2 0 0 1 9.4 4 8.5 8.5 0 1 0 20 14.6Z" />
    </Icon>
  );
}

export function Board(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20l4-4 4 4M12 16v-3" />
    </Icon>
  );
}

export function BookOpen(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H11v17H5.5A2.5 2.5 0 0 0 3 22.5Z" />
      <path d="M21 5.5A2.5 2.5 0 0 0 18.5 3H13v17h5.5a2.5 2.5 0 0 1 2.5 2.5Z" />
    </Icon>
  );
}

export function Flask(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 3h6M10 3v6l-5.5 9.2A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-2.8L14 9V3" />
      <path d="M7.2 16h9.6" />
    </Icon>
  );
}

export function CalculatorIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2.5" />
      <path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01" />
    </Icon>
  );
}

export function CheckCircle(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.7 2.7L16.5 9" />
    </Icon>
  );
}

export function XCircle(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6M15 9l-6 6" />
    </Icon>
  );
}

export function ExternalLink(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14 4h6v6M20 4l-9 9" />
      <path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
    </Icon>
  );
}

export function ChevronDown(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6 9 6 6 6-6" />
    </Icon>
  );
}

export function Menu(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Icon>
  );
}

export function Close(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </Icon>
  );
}

export function Sparkles(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6Z" />
      <path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8ZM5 15l.6 1.4L7 17l-1.4.6L5 19l-.6-1.4L3 17l1.4-.6Z" />
    </Icon>
  );
}

export function Thermometer(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4.5 4.5 0 1 0 4 0Z" />
      <path d="M12 9v6" />
    </Icon>
  );
}

export function Gauge(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.2 18a9 9 0 1 1 15.6 0" />
      <path d="m12 14 4-4" />
      <circle cx="12" cy="14" r="1.6" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function Ruler(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 15 15 4l5 5L9 20Z" />
      <path d="m7 12 2 2M10 9l2 2M13 6l2 2" />
    </Icon>
  );
}

export function Flame(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 21c4 0 7-2.6 7-6.3 0-2.5-1.4-4.5-3.2-6.2-.5 1.7-1.3 2.8-2.5 3.4.1-2.8-1.2-5.4-3.8-7.4.2 3.2-1.2 5-2.8 6.8A8.3 8.3 0 0 0 5 14.7C5 18.4 8 21 12 21Z" />
    </Icon>
  );
}

export function Copy(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="8" y="8" width="12" height="12" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </Icon>
  );
}

export function Printer(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
      <rect x="7" y="14" width="10" height="7" rx="1" />
    </Icon>
  );
}

export function Bolt(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13Z" />
    </Icon>
  );
}

export function Battery(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="2" y="8" width="17" height="8" rx="2" />
      <path d="M22 11v2" />
      <path d="M5.5 12h3M7 10.5v3M12.5 10.5h2M12.5 13.5h2" />
    </Icon>
  );
}

export function Wire(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 8c3 0 3 8 6 8s3-8 6-8 3 8 6 8" />
      <circle cx="3" cy="8" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="21" cy="16" r="1.4" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function CrossSection(props: IconProps) {
  return (
    <Icon {...props}>
      <ellipse cx="12" cy="12" rx="7" ry="7" />
      <circle cx="12" cy="12" r="2.2" />
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
    </Icon>
  );
}

export function Scale(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 4v16M7 20h10" />
      <path d="M5 8h14" />
      <path d="M5 8 2.5 14h5Z" />
      <path d="M19 8l-2.5 6h5Z" />
      <circle cx="12" cy="4" r="1.4" />
    </Icon>
  );
}

export function Atom(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none" />
      <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(30 12 12)" />
      <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-30 12 12)" />
    </Icon>
  );
}

export function Layers(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m12 3 9 5-9 5-9-5Z" />
      <path d="m3 13 9 5 9-5" />
      <path d="m3 17.5 9 5 9-5" />
    </Icon>
  );
}

export function Lightbulb(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3Z" />
    </Icon>
  );
}

export function Plug(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 3v6M15 3v6" />
      <path d="M6 9h12v2a6 6 0 0 1-12 0Z" />
      <path d="M12 17v4" />
      <path d="M8 21h8" />
    </Icon>
  );
}

export function Search(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
    </Icon>
  );
}

export function Warning(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3 2.6 20h18.8Z" />
      <path d="M12 9v5" />
      <circle cx="12" cy="17.2" r=".9" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function Compare(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3v18" />
      <path d="M6 8 3 14h6Z" />
      <path d="M18 16l3-6h-6Z" />
      <path d="M6 8h6M18 16h-6" />
    </Icon>
  );
}
