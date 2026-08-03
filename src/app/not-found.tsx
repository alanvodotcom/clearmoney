import Link from "next/link";
import { ButtonLink } from "@/components/ui/ButtonLink";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto max-w-[var(--max)] px-4 py-20 sm:px-6">
      <h1 className="font-display text-4xl tracking-tight">Page not found</h1>
      <p className="mt-3 text-muted">
        That link doesn’t match a ClearMoney guide or tool.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/">Home</ButtonLink>
        <ButtonLink href="/search" variant="secondary">
          Search
        </ButtonLink>
        <Link href="/tools" className="text-sm text-accent underline">
          Browse tools
        </Link>
      </div>
    </main>
  );
}
