import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Glossary",
  description: "Plain-language money terms.",
};

const terms = [
  {
    term: "Comparison rate",
    def: "An interest rate that includes most fees, used to compare loans more fairly.",
  },
  {
    term: "Offset account",
    def: "A transaction account linked to a home loan; its balance reduces interest charged.",
  },
  {
    term: "Preservation age",
    def: "The age you can generally access super, depending on when you were born.",
  },
  {
    term: "SG (Super Guarantee)",
    def: "Compulsory employer contributions to super based on ordinary time earnings.",
  },
  {
    term: "Variable rate",
    def: "An interest rate that can move up or down over the life of a loan.",
  },
  {
    term: "Hardship",
    def: "A process to ask a lender for temporary relief when you can’t meet repayments.",
  },
  {
    term: "Diversification",
    def: "Spreading investments so one poor outcome doesn’t dominate your results.",
  },
  {
    term: "Excess (insurance)",
    def: "The amount you pay towards a claim before insurance covers the rest.",
  },
];

export default function GlossaryPage() {
  return (
    <main id="main" className="mx-auto max-w-[var(--max)] px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl tracking-tight">Glossary</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Short definitions for terms you’ll see across guides and tools.
      </p>
      <dl className="mt-10 max-w-3xl divide-y divide-border">
        {terms.map((item) => (
          <div key={item.term} className="py-5">
            <dt className="font-semibold">{item.term}</dt>
            <dd className="mt-1 text-sm text-muted">{item.def}</dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
