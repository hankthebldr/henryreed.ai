"use client";

const cards = [
  {
    title: "Workspace Insights",
    description: "See a real-time breakdown of workspace adoption across regions.",
    accent: "from-cortex-accent/80 via-cortex-accent/40 to-transparent",
  },
  {
    title: "Automation Pipeline",
    description: "Track automations that move content from staging to production workspaces.",
    accent: "from-cortex-success/80 via-cortex-success/40 to-transparent",
  },
  {
    title: "Engagement Timeline",
    description: "Visualize cross-workspace handoffs for each customer journey.",
    accent: "from-cortex-purple/80 via-cortex-purple/40 to-transparent",
  },
];

export function WorkspaceTransitionShowcase() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-cortex-border-secondary bg-cortex-bg-secondary/60 p-8 shadow-2xl shadow-black/20 backdrop-blur-2xl">
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        aria-hidden="true"
      >
        <div className="absolute -left-1/3 top-0 h-[28rem] w-[28rem] rounded-full bg-cortex-accent/40 blur-3xl" />
        <div className="absolute right-0 top-10 h-[30rem] w-[24rem] rounded-full bg-cortex-purple/30 blur-[120px]" />
        <div className="absolute bottom-[-6rem] left-1/4 h-[20rem] w-[32rem] rounded-full bg-cortex-success/25 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.15),_transparent_45%)]" />
      </div>

      <div className="relative z-10 flex flex-col gap-6">
        <div className="max-w-xl space-y-3">
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-widest text-cortex-text-secondary">
            Workspace Transitions
          </span>
          <h2 className="text-3xl font-semibold text-cortex-text-primary">
            Seamless movement between exploratory and production workspaces
          </h2>
          <p className="text-cortex-text-secondary">
            Monitor how teams transition from planning to launch-ready workspaces with actionable telemetry and guardrails that keep execution on track.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <article
              key={card.title}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-cortex-bg-primary/70 p-6 transition-transform duration-300 hover:-translate-y-1 hover:border-cortex-accent/40"
            >
              <div className={`pointer-events-none absolute inset-0 ${card.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-70`} />
              <div className="relative flex h-full flex-col gap-3">
                <h3 className="text-lg font-semibold text-cortex-text-primary">{card.title}</h3>
                <p className="text-sm text-cortex-text-secondary">{card.description}</p>
                <div className="mt-auto flex items-center gap-2 text-sm font-medium text-cortex-accent">
                  Explore
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path d="M7 17L17 7" />
                    <path d="M8 7h9v9" />
                  </svg>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WorkspaceTransitionShowcase;
