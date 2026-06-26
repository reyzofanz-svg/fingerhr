import Link from "next/link";

export function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "$49",
      period: "/mo",
      featured: false,
      features: [
        { text: "Up to 3 Devices", included: true },
        { text: "15 Min Sync Interval", included: true },
        { text: "Standard API Access", included: true },
        { text: "Real-time Webhooks", included: false },
      ],
      cta: "Start Free Trial",
      href: "#",
    },
    {
      name: "Pro",
      price: "$149",
      period: "/mo",
      featured: true,
      features: [
        { text: "Up to 15 Devices", included: true },
        { text: "Real-time Sync", included: true },
        { text: "Real-time Webhooks", included: true },
        { text: "Priority Support", included: true },
      ],
      cta: "Get Started",
      href: "/login",
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      featured: false,
      features: [
        { text: "Unlimited Devices", included: true },
        { text: "Custom Integrations", included: true },
        { text: "Dedicated Account Manager", included: true },
        { text: "On-premise Deployment Options", included: true },
      ],
      cta: "Contact Sales",
      href: "#",
    },
  ];

  return (
    <section className="px-6 py-20 max-w-[1440px] mx-auto mt-20 relative">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-semibold text-on-surface mb-4 tracking-tight">
          Transparent Pricing
        </h2>
        <p className="text-base text-on-surface-variant max-w-xl mx-auto leading-relaxed">
          Scalable plans designed for businesses of all sizes. No hidden fees.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
        {plans.map((plan, i) => (
          <div
            key={i}
            className={`glass rounded-[2rem] p-8 flex flex-col transition-all duration-300 relative ${
              plan.featured
                ? "border-primary/50 glow-indigo md:-translate-y-4 relative p-10 z-10"
                : "border-white/5 hover:border-white/10"
            }`}
          >
            {plan.featured && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-on-primary font-mono text-[10px] px-3.5 py-1.5 rounded-full uppercase tracking-wider font-bold shadow-lg">
                Most Popular
              </div>
            )}
            
            <h3 className={`text-xl font-semibold mb-2 tracking-tight ${plan.featured ? "text-primary" : "text-on-surface"}`}>
              {plan.name}
            </h3>
            
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl md:text-5xl font-bold text-on-surface">
                {plan.price}
              </span>
              {plan.period && <span className="text-sm text-on-surface-variant">{plan.period}</span>}
            </div>
            
            <ul className="flex flex-col gap-3 mb-8 flex-grow">
              {plan.features.map((feature, j) => (
                <li
                  key={j}
                  className={`flex items-center gap-3 text-sm leading-relaxed ${
                    plan.featured ? "text-on-surface" : "text-on-surface-variant"
                  } ${!feature.included ? "opacity-50" : ""}`}
                >
                  {feature.included ? (
                    <svg className="h-5 w-5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  )}
                  {feature.text}
                </li>
              ))}
            </ul>
            
            <Link
              href={plan.href}
              className={`rounded-full py-3 text-center font-mono text-xs font-bold tracking-wider uppercase w-full transition-all duration-300 ${
                plan.featured
                  ? "bg-gradient-to-r from-[#6366f1] to-[#3b82f6] text-white hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                  : "border border-white/10 text-on-surface hover:bg-white/5"
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
