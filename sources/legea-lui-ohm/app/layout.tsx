import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "katex/dist/katex.min.css";
import "./globals.css";
import "./hero.css";
import "./theory.css";
import "./lab.css";
import "./circuit.css";
import "./rheostat.css";
import "./measure.css";
import "./problems.css";
import "./quiz.css";
import "./resources.css";
import "./concepts.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Legea lui Ohm · Fizică interactivă",
  description:
    "Lecție interactivă despre legea lui Ohm: rezistența electrică, caracteristica U–I, circuitul complet, reostatul și montajul potențiometric, măsurători cu voltmetrul și ampermetrul.",
  authors: [{ name: "Praxis Science Lab" }],
  keywords: [
    "legea lui Ohm",
    "rezistență electrică",
    "caracteristica curent-tensiune",
    "circuit complet",
    "rezistență internă",
    "reostat",
    "montaj potențiometric",
    "fizică electricitate curent continuu",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b1220",
};

const themeScript = `(function(){try{var t=localStorage.getItem('ohm-theme');if(t!=='dark'&&t!=='light'){t='light';}document.documentElement.dataset.theme=t;if(localStorage.getItem('ohm-board')==='1'){document.documentElement.dataset.board='true';}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <head>
        <Script
          id="ohm-theme-init"
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
