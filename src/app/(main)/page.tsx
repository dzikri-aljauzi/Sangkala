import Hero from "@/components/sections/Hero";
import ProofStrip from "@/components/sections/ProofStrip";
import PillarsOverview from "@/components/sections/PillarsOverview";
import MethodSteps from "@/components/sections/MethodSteps";
import IndustriesTeaser from "@/components/sections/IndustriesTeaser";
import PlatformBand from "@/components/sections/PlatformBand";
import Testimonials from "@/components/sections/Testimonials";
import InsightsTeaser from "@/components/sections/InsightsTeaser";
import ClosingCTA from "@/components/sections/ClosingCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <ProofStrip />
      <PillarsOverview />
      <MethodSteps />
      <IndustriesTeaser />
      <PlatformBand />
      <Testimonials />
      <InsightsTeaser />
      <ClosingCTA />
    </>
  );
}
