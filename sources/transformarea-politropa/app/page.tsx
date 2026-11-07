import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { TheorySection } from "@/components/TheorySection";
import { PolytropicLab } from "@/components/PolytropicLab";
import { LinearLab } from "@/components/LinearLab";
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
        <PolytropicLab />
        <LinearLab />
        <CalculatorSection />
        <Quiz />
        <ResourcesSection />
      </main>
      <Footer />
      <PrintSheet />
    </>
  );
}
