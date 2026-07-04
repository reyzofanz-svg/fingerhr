import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { DeferredSections } from "@/components/landing/DeferredSections";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <DeferredSections />
    </>
  );
}
