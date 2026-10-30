import type { Metadata } from "next";
import { ClosingAndFooter, Faq, Industries } from "@/components/landing/LandingEnd";
import { Connected, Statement } from "@/components/landing/LandingFeatures";
import { Features } from "@/components/landing/LandingNavy";
import { HowItWorks, Results } from "@/components/landing/LandingProof";
import { Testimonials } from "@/components/landing/LandingTestimonials";
import { Hero, Intro, LandingNav } from "@/components/landing/LandingTop";
import { PageTone, SmoothScroll, ToneZone } from "@/components/landing/motion";
import { StickyCta } from "@/components/marketing/StickyCta";

export const metadata: Metadata = { title: "Bluecut Socials: be known for the right things on LinkedIn" };

/** Landing page, built from the approved Figma template (1440w light). Inter only. Motion lives in landing/motion.tsx. */
// One page background (PageTone). Each ToneZone names its section colour; the zone in the middle of the screen sets it.
export default function Landing() {
  return (
    <SmoothScroll>
      <PageTone initialBg="bg-page" className="font-sans">
        <LandingNav />
        <main>
          <ToneZone bg="bg-page">
            <Hero />
            <Intro />
          </ToneZone>
          <ToneZone bg="bg-card">
            <Statement />
            <Connected />
          </ToneZone>
          <ToneZone bg="bg-primary-900" dark>
            <Features />
          </ToneZone>
          <ToneZone bg="bg-card">
            <Testimonials />
            <HowItWorks />
          </ToneZone>
          <ToneZone bg="bg-neutral-950" dark>
            <Results />
            <Industries />
          </ToneZone>
          <ToneZone bg="bg-card">
            <Faq />
          </ToneZone>
        </main>
        <ToneZone bg="bg-primary-900" dark>
          <ClosingAndFooter />
        </ToneZone>
        <StickyCta watchId="hero" />
      </PageTone>
    </SmoothScroll>
  );
}
