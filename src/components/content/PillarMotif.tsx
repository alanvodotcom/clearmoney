import type { PillarId } from "@/lib/content/types";
import type { ReactNode } from "react";

type Props = {
  pillar: PillarId;
  className?: string;
};

const size = { width: 56, height: 56, className: "h-14 w-14 shrink-0" };

function Svg({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 56 56"
      width={size.width}
      height={size.height}
      className={size.className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

const stroke = "currentColor";
const strokeProps = {
  stroke,
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function BankingMotif() {
  return (
    <Svg>
      <rect x="10" y="18" width="36" height="24" rx="3" {...strokeProps} />
      <path d="M10 26h36" {...strokeProps} />
      <circle cx="18" cy="34" r="2.5" fill="currentColor" opacity="0.35" />
      <path d="M28 34h12" {...strokeProps} opacity="0.5" />
    </Svg>
  );
}

function LoansMotif() {
  return (
    <Svg>
      <rect x="14" y="12" width="28" height="36" rx="2" {...strokeProps} />
      <path d="M20 20h16M20 28h16M20 36h10" {...strokeProps} opacity="0.55" />
      <path d="M38 40l6 6M44 40l-6 6" {...strokeProps} />
    </Svg>
  );
}

function InvestingMotif() {
  return (
    <Svg>
      <path d="M10 40L22 28l8 8 16-20" {...strokeProps} />
      <path d="M38 16h8v8" {...strokeProps} />
      <circle cx="22" cy="28" r="2" fill="currentColor" />
      <circle cx="30" cy="36" r="2" fill="currentColor" opacity="0.5" />
    </Svg>
  );
}

function SuperMotif() {
  return (
    <Svg>
      <circle cx="28" cy="28" r="16" {...strokeProps} />
      <path d="M28 14v14l10 6" {...strokeProps} />
      <circle cx="28" cy="28" r="2" fill="currentColor" />
    </Svg>
  );
}

function InsuranceMotif() {
  return (
    <Svg>
      <path
        d="M28 10l16 8v12c0 10-7 16-16 20-9-4-16-10-16-20V18l16-8z"
        {...strokeProps}
      />
      <path d="M20 28l5 5 11-12" {...strokeProps} />
    </Svg>
  );
}

function ScamsMotif() {
  return (
    <Svg>
      <path
        d="M28 12l14 24H14L28 12z"
        {...strokeProps}
      />
      <path d="M28 24v8" {...strokeProps} />
      <circle cx="28" cy="38" r="1.75" fill="currentColor" />
    </Svg>
  );
}

function CommunityMotif() {
  return (
    <Svg>
      <circle cx="20" cy="22" r="6" {...strokeProps} />
      <circle cx="36" cy="22" r="6" {...strokeProps} />
      <path
        d="M10 42c2-8 6-12 10-12s8 4 10 12M26 42c2-8 6-12 10-12s8 4 10 12"
        {...strokeProps}
      />
    </Svg>
  );
}

const motifs: Record<PillarId, () => ReactNode> = {
  "banking-budgeting": BankingMotif,
  "loans-credit-debt": LoansMotif,
  "investing-planning": InvestingMotif,
  "super-retirement": SuperMotif,
  insurance: InsuranceMotif,
  "scams-safety": ScamsMotif,
  community: CommunityMotif,
};

export function PillarMotif({ pillar, className }: Props) {
  const Motif = motifs[pillar] ?? BankingMotif;
  return (
    <div
      className={`flex h-16 w-16 items-center justify-center rounded-[var(--radius)] bg-accent-soft text-accent ${className ?? ""}`}
      aria-hidden="true"
    >
      <Motif />
    </div>
  );
}
