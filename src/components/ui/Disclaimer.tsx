export function Disclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-xs text-muted">
        Estimates only. Not personal advice. Check current rates, fees, and ATO
        rules before you decide.
      </p>
    );
  }

  return (
    <aside className="rounded-[var(--radius)] border border-border bg-accent-soft/40 p-4 text-sm text-muted">
      <p className="font-semibold text-foreground">Important</p>
      <p className="mt-1">
        ClearMoney provides general information and calculators to help you
        explore options. It is not personal financial, tax, or legal advice.
        Consider speaking with a licensed adviser for decisions that affect your
        situation.
      </p>
    </aside>
  );
}
