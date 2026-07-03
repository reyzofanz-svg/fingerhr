"use client";

import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { StatsSection, CTASection } from "@/components/landing/StatsCTA";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <div id="how-it-works">
        <HowItWorks />
      </div>
      <StatsSection />
      <CTASection />
    </>
  );
}
