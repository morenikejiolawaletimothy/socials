import { ClosingAndFooter, Faq, Industries } from "@/components/marketing/SectionsBottom";
import { Features, HowItWorks, Outcomes, Pricing, Testimonials } from "@/components/marketing/SectionsMiddle";
import { Connected, Hero, MarketingNav, Problem, Statement } from "@/components/marketing/SectionsTop";
import { StickyCta } from "@/components/marketing/StickyCta";

/** Landing page, in the order of the approved PDF layout (1440w_light). */
export default function Landing() {
  return (
    <>
      <MarketingNav />
      <main>
        <Hero />
        <Problem />
        <Statement />
        <Connected />
        <Features />
        <Testimonials />
        <HowItWorks />
        <Outcomes />
        <Pricing />
        <Industries />
        <Faq />
      </main>
      <ClosingAndFooter />
      <StickyCta watchId="hero" />
    </>
  );
}
