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
      <rect width="40" height="40" rx="12" fill="url(#logo-gradient)" />
      <path
        d="M7 29c5.5-1 8.5-4.7 10.7-9.6C20 14 23.2 10 32 9.4"
        stroke="#0B2B26"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M8 13.5c6 .2 10.3 3.4 13 8.2 2.2 3.8 5.3 6.7 11 7.6"
        stroke="#0B2B26"
        strokeOpacity=".55"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="28.5" cy="14.8" r="3" fill="#0B2B26" />
      <circle cx="28.5" cy="14.8" r="1.25" fill="#E8B85C" />
      <defs>
        <linearGradient id="logo-gradient" x1="2" y1="0" x2="38" y2="40">
          <stop stopColor="#D9F7B8" />
          <stop offset=".55" stopColor="#B9E98B" />
          <stop offset="1" stopColor="#7FC9A4" />
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
      <path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01M8 20h.01M12 20h.01M16 20h.01" />
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

export function Snowflake(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 2v20M4.2 7l15.6 10M19.8 7 4.2 17" />
      <path d="m9 4 3 2 3-2M9 20l3-2 3 2M4.5 11l3.5.5L7 8M19.5 13 16 12.5l1 3.5M7 16l1-3.5-3.5.5M17 8l-1 3.5 3.5-.5" />
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
