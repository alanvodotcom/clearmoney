import Link from "next/link";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { lifeEvents, pillars, tools } from "@/lib/content/taxonomy";

export default function HomePage() {
  const featuredTools = tools.slice(0, 6);

  return (
    <main id="main">
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 100% 0%, #e6f3f3 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 0% 100%, #f0f4f2 0%, transparent 50%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-[var(--max)] px-4 py-16 sm:px-6 sm:py-24">
          <p className="animate-fade-up text-sm font-semibold uppercase tracking-[0.14em] text-accent">
            ClearMoney
          </p>
          <h1 className="animate-fade-up-delay font-display mt-3 max-w-2xl text-4xl leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
            Money decisions, without the noise.
          </h1>
          <p className="animate-fade-up-delay-2 mt-5 max-w-xl text-lg text-muted">
            Minimal guides and fast calculators for budgeting, borrowing, super,
            and staying safe—built mobile-first.
          </p>
          <div className="animate-fade-up-delay-2 mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/tools">Open tools</ButtonLink>
            <ButtonLink href="/topics" variant="secondary">
              Browse topics
            </ButtonLink>
            <ButtonLink href="/urgent" variant="urgent">
              Urgent help
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--max)] px-4 py-14 sm:px-6">
        <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
          What do you need to do?
        </h2>
        <p className="mt-2 max-w-2xl text-muted">
          Start from a life event—or jump straight into a topic.
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lifeEvents.map((event) => (
            <li key={event.id}>
              <Link
                href={event.href}
                className="block rounded-[var(--radius)] border border-transparent py-2 no-underline transition-colors hover:border-border hover:bg-surface"
              >
                <span className="font-semibold text-foreground">{event.title}</span>
                <span className="mt-1 block text-sm text-muted">
                  {event.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-[var(--max)] px-4 py-14 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
                Tools first
              </h2>
              <p className="mt-2 text-muted">
                Calculators are easy to find—not buried in topic trees.
              </p>
            </div>
            <ButtonLink href="/tools" variant="secondary">
              All {tools.length} tools
            </ButtonLink>
          </div>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTools.map((tool) => (
              <li key={tool.id}>
                <Link href={tool.href} className="group block no-underline">
                  <span className="font-semibold text-foreground group-hover:text-accent">
                    {tool.title}
                  </span>
                  <span className="mt-1 block text-sm text-muted">
                    {tool.description}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--max)] px-4 py-14 sm:px-6">
        <h2 className="font-display text-2xl tracking-tight sm:text-3xl">
          Topics
        </h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <li key={pillar.id}>
              <Link href={`/topics/${pillar.id}`} className="block no-underline">
                <span className="text-xs font-semibold uppercase tracking-wide text-accent">
                  {pillar.shortLabel}
                </span>
                <span className="mt-1 block font-semibold">{pillar.title}</span>
                <span className="mt-1 block text-sm text-muted">
                  {pillar.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-[var(--max)] px-4 pb-16 sm:px-6">
        <Disclaimer />
      </section>
    </main>
  );
}
