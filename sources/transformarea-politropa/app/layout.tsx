import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "katex/dist/katex.min.css";
import "./globals.css";
import "./theory.css";
import "./lab.css";
import "./linear.css";
import "./calculator.css";
import "./quiz.css";
import "./resources.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Transformarea politropă · Fizică interactivă",
  description:
    "Lecție interactivă de termodinamică: familia proceselor politrope pVⁿ = constant, laborator p-V animat, calculator, procesul liniar și quiz.",
  authors: [{ name: "Praxis Science Lab" }],
  keywords: [
    "transformare politropă",
    "proces politrop",
    "termodinamică",
    "fizică clasa a X-a",
    "pV^n",
    "indice politropic",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B2B26",
};

const themeScript = `(function(){try{var t=localStorage.getItem('politropa-theme');if(t!=='dark'&&t!=='light'){t='light';}document.documentElement.dataset.theme=t;if(localStorage.getItem('politropa-board')==='1'){document.documentElement.dataset.board='true';}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <head>
        <Script
          id="politropa-theme-init"
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
