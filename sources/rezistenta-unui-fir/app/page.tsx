import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { TheorySection } from "@/components/TheorySection";
import { WireLab } from "@/components/WireLab";
import { FactorSection } from "@/components/FactorSection";
import { MaterialsSection } from "@/components/MaterialsSection";
import { CalculatorSection } from "@/components/CalculatorSection";
import { Quiz } from "@/components/Quiz";
import { ResourcesSection } from "@/components/ResourcesSection";
import { Footer } from "@/components/Footer";
import { PrintSheet } from "@/components/PrintSheet";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#continut">
        Sari la conținut
      </a>
      <Nav />
      <main id="continut">
        <Hero />
        <TheorySection />
        <WireLab />
        <FactorSection />
        <MaterialsSection />
        <CalculatorSection />
        <Quiz />
        <ResourcesSection />
      </main>
      <Footer />
      <PrintSheet />
    </>
  );
}
