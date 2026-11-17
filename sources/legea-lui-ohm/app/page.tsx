import { LessonTabs } from "@/components/LessonTabs";
import { Footer } from "@/components/Footer";
import { PrintSheet } from "@/components/PrintSheet";

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#continut">
        Sari la conținut
      </a>
      <main id="continut">
        <LessonTabs />
      </main>
      <Footer />
      <PrintSheet />
    </>
  );
}
