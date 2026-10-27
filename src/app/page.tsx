import { ClosingAndFooter, Faq, Industries } from "@/components/landing/LandingEnd";
import { Connected, Statement } from "@/components/landing/LandingFeatures";
import { Features } from "@/components/landing/LandingNavy";
import { HowItWorks, Results, Testimonials } from "@/components/landing/LandingProof";
import { Hero, Intro, LandingNav } from "@/components/landing/LandingTop";
import { StickyCta } from "@/components/marketing/StickyCta";

/** Landing page, built from the approved Figma template (1440w light). Inter only. */
export default function Landing() {
  return (
    <div className="bg-card font-sans">
      <LandingNav />
      <main>
        <Hero />
        <Intro />
        <Statement />
        <Connected />
        <Features />
        <Testimonials />
        <HowItWorks />
        <Results />
        <Industries />
        <Faq />
      </main>
      <ClosingAndFooter />
      <StickyCta watchId="hero" />
    </div>
  );
}
