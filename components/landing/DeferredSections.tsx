"use client";

import dynamic from "next/dynamic";

// Below-the-fold sections. Splitting them into separate client bundles keeps
// them out of the initial JS payload while still server-rendering their markup
// (no ssr:false), so SEO and layout are preserved.
const HowItWorks = dynamic(() =>
  import("@/components/landing/HowItWorks").then((m) => m.HowItWorks)
);
const StatsSection = dynamic(() =>
  import("@/components/landing/StatsCTA").then((m) => m.StatsSection)
);
const CTASection = dynamic(() =>
  import("@/components/landing/StatsCTA").then((m) => m.CTASection)
);

export function DeferredSections() {
  return (
    <>
      <div id="how-it-works">
        <HowItWorks />
      </div>
      <StatsSection />
      <CTASection />
    </>
  );
}
