import type { ReactNode } from "react";

export type DiagramId =
  | "budget-three-buckets"
  | "debt-priority"
  | "invest-horizon"
  | "super-contrib-flow"
  | "insurance-needs-stack"
  | "scam-stop-check"
  | "hardship-call-order"
  | "diversify-vs-concentrate";

export type DiagramMeta = {
  id: DiagramId;
  label: string;
  caption: string;
};

export const diagramMeta: Record<DiagramId, DiagramMeta> = {
  "budget-three-buckets": {
    id: "budget-three-buckets",
    label: "Three budget buckets",
    caption: "Split money into needs, wants, and goals—then automate the goals bucket.",
  },
  "debt-priority": {
    id: "debt-priority",
    label: "Debt priority order",
    caption: "Cover essentials, then high-interest debts, then lower-cost balances.",
  },
  "invest-horizon": {
    id: "invest-horizon",
    label: "Investing time horizon",
    caption: "Short horizons favour cash buffers; longer horizons can tolerate market swings.",
  },
  "super-contrib-flow": {
    id: "super-contrib-flow",
    label: "Super contribution flow",
    caption: "Employer SG plus optional extra contributions grow the balance over time.",
  },
  "insurance-needs-stack": {
    id: "insurance-needs-stack",
    label: "Insurance needs stack",
    caption: "Stack debts, dependants, and living costs, then subtract cover you already have.",
  },
  "scam-stop-check": {
    id: "scam-stop-check",
    label: "Stop–check–act",
    caption: "Pause, verify independently, then act—never under pressure from a stranger.",
  },
  "hardship-call-order": {
    id: "hardship-call-order",
    label: "Hardship call order",
    caption: "Debt Helpline, then lenders and utilities, then follow up in writing.",
  },
  "diversify-vs-concentrate": {
    id: "diversify-vs-concentrate",
    label: "Diversify vs concentrate",
    caption: "Broad exposure spreads risk; a few tips concentrate it.",
  },
};

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Frame({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <svg
      viewBox="0 0 320 140"
      width="320"
      height="140"
      className="h-auto w-full max-w-md text-accent"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={label}
    >
      {children}
    </svg>
  );
}

function BudgetThreeBuckets() {
  return (
    <Frame label={diagramMeta["budget-three-buckets"].label}>
      <rect x="16" y="36" width="88" height="72" rx="6" {...stroke} />
      <rect x="116" y="36" width="88" height="72" rx="6" {...stroke} opacity="0.75" />
      <rect x="216" y="36" width="88" height="72" rx="6" {...stroke} opacity="0.55" />
      <text x="60" y="78" textAnchor="middle" className="fill-current text-[11px]" fill="currentColor">
        Needs
      </text>
      <text x="160" y="78" textAnchor="middle" fill="currentColor" fontSize="11">
        Wants
      </text>
      <text x="260" y="78" textAnchor="middle" fill="currentColor" fontSize="11">
        Goals
      </text>
    </Frame>
  );
}

function DebtPriority() {
  return (
    <Frame label={diagramMeta["debt-priority"].label}>
      <path d="M40 110V40h60v70M120 110V55h60v55M200 110V70h60v40" {...stroke} />
      <text x="70" y="128" textAnchor="middle" fill="currentColor" fontSize="10">
        Essentials
      </text>
      <text x="150" y="128" textAnchor="middle" fill="currentColor" fontSize="10">
        High interest
      </text>
      <text x="230" y="128" textAnchor="middle" fill="currentColor" fontSize="10">
        Lower cost
      </text>
    </Frame>
  );
}

function InvestHorizon() {
  return (
    <Frame label={diagramMeta["invest-horizon"].label}>
      <path d="M24 100h272" {...stroke} opacity="0.4" />
      <path d="M40 90c40-10 60-40 100-45s80 10 120-25" {...stroke} />
      <circle cx="40" cy="90" r="3" fill="currentColor" />
      <circle cx="260" cy="20" r="3" fill="currentColor" />
      <text x="50" y="118" fill="currentColor" fontSize="10">
        Near term
      </text>
      <text x="230" y="118" fill="currentColor" fontSize="10">
        Long term
      </text>
    </Frame>
  );
}

function SuperContribFlow() {
  return (
    <Frame label={diagramMeta["super-contrib-flow"].label}>
      <rect x="20" y="48" width="70" height="44" rx="6" {...stroke} />
      <rect x="125" y="48" width="70" height="44" rx="6" {...stroke} />
      <rect x="230" y="48" width="70" height="44" rx="6" {...stroke} />
      <path d="M90 70h35M195 70h35" {...stroke} />
      <path d="M118 70l-6-4M118 70l-6 4M223 70l-6-4M223 70l-6 4" {...stroke} />
      <text x="55" y="74" textAnchor="middle" fill="currentColor" fontSize="10">
        Employer
      </text>
      <text x="160" y="74" textAnchor="middle" fill="currentColor" fontSize="10">
        Extras
      </text>
      <text x="265" y="74" textAnchor="middle" fill="currentColor" fontSize="10">
        Balance
      </text>
    </Frame>
  );
}

function InsuranceNeedsStack() {
  return (
    <Frame label={diagramMeta["insurance-needs-stack"].label}>
      <rect x="60" y="88" width="200" height="24" rx="4" {...stroke} />
      <rect x="60" y="58" width="200" height="24" rx="4" {...stroke} opacity="0.75" />
      <rect x="60" y="28" width="200" height="24" rx="4" {...stroke} opacity="0.5" />
      <text x="160" y="44" textAnchor="middle" fill="currentColor" fontSize="10">
        Living costs
      </text>
      <text x="160" y="74" textAnchor="middle" fill="currentColor" fontSize="10">
        Dependants
      </text>
      <text x="160" y="104" textAnchor="middle" fill="currentColor" fontSize="10">
        Debts
      </text>
    </Frame>
  );
}

function ScamStopCheck() {
  return (
    <Frame label={diagramMeta["scam-stop-check"].label}>
      <circle cx="60" cy="70" r="28" {...stroke} />
      <circle cx="160" cy="70" r="28" {...stroke} />
      <circle cx="260" cy="70" r="28" {...stroke} />
      <path d="M88 70h44M188 70h44" {...stroke} />
      <text x="60" y="74" textAnchor="middle" fill="currentColor" fontSize="11">
        Stop
      </text>
      <text x="160" y="74" textAnchor="middle" fill="currentColor" fontSize="11">
        Check
      </text>
      <text x="260" y="74" textAnchor="middle" fill="currentColor" fontSize="11">
        Act
      </text>
    </Frame>
  );
}

function HardshipCallOrder() {
  return (
    <Frame label={diagramMeta["hardship-call-order"].label}>
      <circle cx="50" cy="70" r="18" {...stroke} />
      <circle cx="140" cy="70" r="18" {...stroke} />
      <circle cx="230" cy="70" r="18" {...stroke} />
      <path d="M68 70h54M158 70h54" {...stroke} />
      <text x="50" y="74" textAnchor="middle" fill="currentColor" fontSize="12" fontWeight="600">
        1
      </text>
      <text x="140" y="74" textAnchor="middle" fill="currentColor" fontSize="12" fontWeight="600">
        2
      </text>
      <text x="230" y="74" textAnchor="middle" fill="currentColor" fontSize="12" fontWeight="600">
        3
      </text>
      <text x="50" y="110" textAnchor="middle" fill="currentColor" fontSize="9">
        Helpline
      </text>
      <text x="140" y="110" textAnchor="middle" fill="currentColor" fontSize="9">
        Lenders
      </text>
      <text x="230" y="110" textAnchor="middle" fill="currentColor" fontSize="9">
        Write it
      </text>
    </Frame>
  );
}

function DiversifyVsConcentrate() {
  return (
    <Frame label={diagramMeta["diversify-vs-concentrate"].label}>
      <circle cx="70" cy="50" r="8" {...stroke} />
      <circle cx="100" cy="70" r="8" {...stroke} />
      <circle cx="55" cy="85" r="8" {...stroke} />
      <circle cx="90" cy="95" r="8" {...stroke} />
      <circle cx="240" cy="70" r="28" {...stroke} />
      <text x="80" y="128" textAnchor="middle" fill="currentColor" fontSize="10">
        Diversified
      </text>
      <text x="240" y="128" textAnchor="middle" fill="currentColor" fontSize="10">
        Concentrated
      </text>
    </Frame>
  );
}

const components: Record<DiagramId, () => ReactNode> = {
  "budget-three-buckets": BudgetThreeBuckets,
  "debt-priority": DebtPriority,
  "invest-horizon": InvestHorizon,
  "super-contrib-flow": SuperContribFlow,
  "insurance-needs-stack": InsuranceNeedsStack,
  "scam-stop-check": ScamStopCheck,
  "hardship-call-order": HardshipCallOrder,
  "diversify-vs-concentrate": DiversifyVsConcentrate,
};

export function isDiagramId(id: string): id is DiagramId {
  return id in diagramMeta;
}

export function GuideDiagram({ id }: { id: string }) {
  if (!isDiagramId(id)) return null;
  const meta = diagramMeta[id];
  const Diagram = components[id];
  return (
    <figure className="cm-diagram">
      <Diagram />
      <figcaption className="cm-diagram__caption">{meta.caption}</figcaption>
    </figure>
  );
}

/** Inline SVG HTML for markdown shortcodes (server-safe string). */
export function getDiagramHtml(id: string): string {
  if (!isDiagramId(id)) {
    return `<p class="cm-diagram-missing"><em>Unknown diagram: ${escapeHtml(id)}</em></p>`;
  }
  const meta = diagramMeta[id];
  // Render a compact HTML figure; SVG duplicated as static markup for marked pipeline
  const svg = DIAGRAM_SVG[id];
  return `<figure class="cm-diagram" role="group" aria-label="${escapeHtml(meta.label)}">${svg}<figcaption class="cm-diagram__caption">${escapeHtml(meta.caption)}</figcaption></figure>`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const svgOpen =
  '<svg viewBox="0 0 320 140" width="320" height="140" class="cm-diagram__svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="none">';
const svgClose = "</svg>";
const s =
  'stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"';

const DIAGRAM_SVG: Record<DiagramId, string> = {
  "budget-three-buckets": `${svgOpen}
    <rect x="16" y="36" width="88" height="72" rx="6" ${s}/>
    <rect x="116" y="36" width="88" height="72" rx="6" ${s} opacity="0.75"/>
    <rect x="216" y="36" width="88" height="72" rx="6" ${s} opacity="0.55"/>
    <text x="60" y="78" text-anchor="middle" fill="currentColor" font-size="11">Needs</text>
    <text x="160" y="78" text-anchor="middle" fill="currentColor" font-size="11">Wants</text>
    <text x="260" y="78" text-anchor="middle" fill="currentColor" font-size="11">Goals</text>
  ${svgClose}`,
  "debt-priority": `${svgOpen}
    <path d="M40 110V40h60v70M120 110V55h60v55M200 110V70h60v40" ${s}/>
    <text x="70" y="128" text-anchor="middle" fill="currentColor" font-size="10">Essentials</text>
    <text x="150" y="128" text-anchor="middle" fill="currentColor" font-size="10">High interest</text>
    <text x="230" y="128" text-anchor="middle" fill="currentColor" font-size="10">Lower cost</text>
  ${svgClose}`,
  "invest-horizon": `${svgOpen}
    <path d="M24 100h272" ${s} opacity="0.4"/>
    <path d="M40 90c40-10 60-40 100-45s80 10 120-25" ${s}/>
    <circle cx="40" cy="90" r="3" fill="currentColor"/>
    <circle cx="260" cy="20" r="3" fill="currentColor"/>
    <text x="50" y="118" fill="currentColor" font-size="10">Near term</text>
    <text x="230" y="118" fill="currentColor" font-size="10">Long term</text>
  ${svgClose}`,
  "super-contrib-flow": `${svgOpen}
    <rect x="20" y="48" width="70" height="44" rx="6" ${s}/>
    <rect x="125" y="48" width="70" height="44" rx="6" ${s}/>
    <rect x="230" y="48" width="70" height="44" rx="6" ${s}/>
    <path d="M90 70h35M195 70h35" ${s}/>
    <text x="55" y="74" text-anchor="middle" fill="currentColor" font-size="10">Employer</text>
    <text x="160" y="74" text-anchor="middle" fill="currentColor" font-size="10">Extras</text>
    <text x="265" y="74" text-anchor="middle" fill="currentColor" font-size="10">Balance</text>
  ${svgClose}`,
  "insurance-needs-stack": `${svgOpen}
    <rect x="60" y="88" width="200" height="24" rx="4" ${s}/>
    <rect x="60" y="58" width="200" height="24" rx="4" ${s} opacity="0.75"/>
    <rect x="60" y="28" width="200" height="24" rx="4" ${s} opacity="0.5"/>
    <text x="160" y="44" text-anchor="middle" fill="currentColor" font-size="10">Living costs</text>
    <text x="160" y="74" text-anchor="middle" fill="currentColor" font-size="10">Dependants</text>
    <text x="160" y="104" text-anchor="middle" fill="currentColor" font-size="10">Debts</text>
  ${svgClose}`,
  "scam-stop-check": `${svgOpen}
    <circle cx="60" cy="70" r="28" ${s}/>
    <circle cx="160" cy="70" r="28" ${s}/>
    <circle cx="260" cy="70" r="28" ${s}/>
    <path d="M88 70h44M188 70h44" ${s}/>
    <text x="60" y="74" text-anchor="middle" fill="currentColor" font-size="11">Stop</text>
    <text x="160" y="74" text-anchor="middle" fill="currentColor" font-size="11">Check</text>
    <text x="260" y="74" text-anchor="middle" fill="currentColor" font-size="11">Act</text>
  ${svgClose}`,
  "hardship-call-order": `${svgOpen}
    <circle cx="50" cy="70" r="18" ${s}/>
    <circle cx="140" cy="70" r="18" ${s}/>
    <circle cx="230" cy="70" r="18" ${s}/>
    <path d="M68 70h54M158 70h54" ${s}/>
    <text x="50" y="74" text-anchor="middle" fill="currentColor" font-size="12" font-weight="600">1</text>
    <text x="140" y="74" text-anchor="middle" fill="currentColor" font-size="12" font-weight="600">2</text>
    <text x="230" y="74" text-anchor="middle" fill="currentColor" font-size="12" font-weight="600">3</text>
    <text x="50" y="110" text-anchor="middle" fill="currentColor" font-size="9">Helpline</text>
    <text x="140" y="110" text-anchor="middle" fill="currentColor" font-size="9">Lenders</text>
    <text x="230" y="110" text-anchor="middle" fill="currentColor" font-size="9">Write it</text>
  ${svgClose}`,
  "diversify-vs-concentrate": `${svgOpen}
    <circle cx="70" cy="50" r="8" ${s}/>
    <circle cx="100" cy="70" r="8" ${s}/>
    <circle cx="55" cy="85" r="8" ${s}/>
    <circle cx="90" cy="95" r="8" ${s}/>
    <circle cx="240" cy="70" r="28" ${s}/>
    <text x="80" y="128" text-anchor="middle" fill="currentColor" font-size="10">Diversified</text>
    <text x="240" y="128" text-anchor="middle" fill="currentColor" font-size="10">Concentrated</text>
  ${svgClose}`,
};
