import Hero from "@/components/sections/Hero";
import ValueMetrics from "@/components/sections/ValueMetrics";
import AboutPreview from "@/components/sections/AboutPreview";
import ServicesPreview from "@/components/sections/ServicesPreview";
import Testimonials from "@/components/sections/Testimonials";
import CTASection from "@/components/sections/CTASection";

export default function Home() {
  return (
    <>
      <Hero />
      <ValueMetrics />
      <AboutPreview />
      <ServicesPreview />
      <Testimonials />
      <CTASection />
    </>
  );
}
