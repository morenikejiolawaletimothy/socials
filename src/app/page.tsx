import { ClosingAndFooter, Faq, Industries } from "@/components/landing/LandingEnd";
import { Connected, Statement } from "@/components/landing/LandingFeatures";
import { Features } from "@/components/landing/LandingNavy";
import { HowItWorks, Results } from "@/components/landing/LandingProof";
import { Testimonials } from "@/components/landing/LandingTestimonials";
import { Hero, Intro, LandingNav } from "@/components/landing/LandingTop";
import { SmoothScroll } from "@/components/landing/motion";
import { StickyCta } from "@/components/marketing/StickyCta";

/** Landing page, built from the approved Figma template (1440w light). Inter only. Motion lives in landing/motion.tsx. */
export default function Landing() {
  return (
    <SmoothScroll>
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
    </SmoothScroll>
  );
}
