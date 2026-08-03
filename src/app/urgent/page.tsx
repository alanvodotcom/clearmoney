import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/ButtonLink";

export const metadata: Metadata = {
  title: "Urgent help",
  description: "Quick paths for debt stress and scam response.",
};

function ExternalLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={className}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export default function UrgentPage() {
  return (
    <main id="main" className="mx-auto max-w-[var(--max)] px-4 py-12 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-urgent">
        Urgent help
      </p>
      <h1 className="font-display mt-2 text-4xl tracking-tight">
        Get support sooner.
      </h1>
      <p className="mt-3 max-w-2xl text-muted">
        If money stress or a scam is affecting you now, use these paths first.
        ClearMoney is information only—contact your bank and official services
        for urgent action.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section className="rounded-[var(--radius)] border border-urgent/20 bg-urgent-soft/40 p-6">
          <h2 className="font-display text-2xl">Struggling with debt</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted">
            <li>Contact lenders early and ask about hardship options.</li>
            <li>Prioritise rent, food, utilities, and medicine.</li>
            <li>Speak with a free financial counsellor.</li>
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/topics/loans-credit-debt/managing-debt/financial-hardship">
              Hardship guide
            </ButtonLink>
            <ButtonLink
              href="/topics/loans-credit-debt/managing-debt/urgent-help-with-money"
              variant="secondary"
            >
              Urgent money help
            </ButtonLink>
          </div>
          <p className="mt-4 text-sm">
            National Debt Helpline:{" "}
            <ExternalLink
              href="https://ndh.org.au/"
              className="font-medium text-urgent underline"
            >
              ndh.org.au
            </ExternalLink>{" "}
            ·{" "}
            <a href="tel:1800007007" className="font-medium text-urgent underline">
              1800 007 007
            </a>
          </p>
        </section>

        <section className="rounded-[var(--radius)] border border-border bg-surface p-6">
          <h2 className="font-display text-2xl">Think you’ve been scammed?</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted">
            <li>Call your bank or card provider immediately.</li>
            <li>Change passwords and secure your email.</li>
            <li>Report via official scam channels.</li>
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <ButtonLink href="/topics/scams-safety/check-report/what-to-do-if-youve-been-scammed">
              Scam response guide
            </ButtonLink>
            <ButtonLink
              href="/topics/scams-safety/financial-scams/investment-scams"
              variant="secondary"
            >
              Investment scams
            </ButtonLink>
          </div>
          <p className="mt-4 text-sm text-muted">
            Report:{" "}
            <ExternalLink
              href="https://www.scamwatch.gov.au/"
              className="text-accent underline"
            >
              Scamwatch
            </ExternalLink>
            {" · "}
            <ExternalLink
              href="https://www.cyber.gov.au/report-and-recover/report"
              className="text-accent underline"
            >
              ReportCyber
            </ExternalLink>
          </p>
        </section>
      </div>

      <p className="mt-10 text-sm text-muted">
        Also see{" "}
        <Link href="/topics/loans-credit-debt" className="text-accent underline">
          Loans & debt
        </Link>{" "}
        and{" "}
        <Link href="/topics/scams-safety" className="text-accent underline">
          Scams & safety
        </Link>
        .
      </p>
    </main>
  );
}
