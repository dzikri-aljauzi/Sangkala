import HomeHero from "@/components/home/HomeHero";
import ClientMarquee from "@/components/home/ClientMarquee";
import Statement from "@/components/home/Statement";
import PillarTabs from "@/components/home/PillarTabs";
import MethodScroll from "@/components/home/MethodScroll";
import PlatformShowcase from "@/components/home/PlatformShowcase";
import IndustryPanels from "@/components/home/IndustryPanels";
import TestimonialSlider from "@/components/home/TestimonialSlider";
import InsightsShowcase from "@/components/home/InsightsShowcase";
import ClosingCTA from "@/components/sections/ClosingCTA";

export default function Home() {
  return (
    <>
      <HomeHero />
      <ClientMarquee />
      <Statement />
      <PillarTabs />
      <MethodScroll />
      <PlatformShowcase />
      <IndustryPanels />
      <TestimonialSlider />
      <InsightsShowcase />
      <ClosingCTA />
    </>
  );
}
