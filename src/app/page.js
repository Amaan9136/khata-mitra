import LandingNav from "@/components/landing/LandingNav";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import AiHelp from "@/components/landing/AiHelp";
import Benefits from "@/components/landing/Benefits";
import Footer from "@/components/landing/Footer";
import CursorAura from "@/components/landing/CursorAura";
export default function HomePage() {
  return (
    <div className="relative overflow-x-clip">
      <CursorAura />
      <LandingNav />
      <Hero />
      <HowItWorks />
      <AiHelp />
      <Benefits />
      <Footer />
    </div>
  );
}
