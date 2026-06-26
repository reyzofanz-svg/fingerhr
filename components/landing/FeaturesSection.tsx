export function FeaturesSection() {
  const features = [
    {
      icon: (
        <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
      ),
      title: "Real-time Sync",
      description:
        "Data flows instantly from terminals to the cloud. No more manual polling or batch jobs. Webhooks notify your systems the millisecond a punch occurs.",
    },
    {
      icon: (
        <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
      ),
      title: "Enterprise Security",
      description:
        "End-to-end encryption ensures biometric template data is never exposed. SOC2 Type II compliance and role-based access control built-in.",
    },
    {
      icon: (
        <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
        </svg>
      ),
      title: "API First",
      description:
        "Designed for developers. Modern REST and GraphQL endpoints. Comprehensive documentation, SDKs for major languages, and an active community.",
    },
  ];

  return (
    <section className="px-6 py-20 max-w-[1440px] mx-auto mt-20 relative">
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-tertiary/10 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-semibold text-on-surface mb-4 tracking-tight">
          Enterprise-Grade Infrastructure
        </h2>
        <p className="text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          Built for scale, security, and developer experience. FingerHR handles the complexity of biometric hardware communication so you don&apos;t have to.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, i) => (
          <div
            key={i}
            className="glass rounded-[2rem] p-8 flex flex-col gap-4 group hover:border-primary/30 transition-colors duration-300"
          >
            <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold text-on-surface tracking-tight">{feature.title}</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
