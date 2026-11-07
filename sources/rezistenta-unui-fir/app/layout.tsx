import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "katex/dist/katex.min.css";
import "./globals.css";
import "./theory.css";
import "./lab.css";
import "./factor.css";
import "./comparison.css";
import "./calculator.css";
import "./quiz.css";
import "./resources.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Rezistența unui fir · Fizică interactivă",
  description:
    "Lecție interactivă de electricitate: de ce depinde rezistența unui conductor, legea R = ρL/A, laborator animat cu fir, materiale, temperatură, calculator și quiz.",
  authors: [{ name: "Praxis Science Lab" }],
  keywords: [
    "rezistența unui fir",
    "rezistență electrică",
    "rezistivitate",
    "legea lui Ohm",
    "fizică clasa a VIII-a",
    "fizică clasa a IX-a",
    "R = rho l / S",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b1219",
};

const themeScript = `(function(){try{var t=localStorage.getItem('fir-theme');if(t!=='dark'&&t!=='light'){t='light';}document.documentElement.dataset.theme=t;if(localStorage.getItem('fir-board')==='1'){document.documentElement.dataset.board='true';}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <head>
        <Script
          id="fir-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
