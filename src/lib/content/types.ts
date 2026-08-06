export type PillarId =
  | "banking-budgeting"
  | "loans-credit-debt"
  | "investing-planning"
  | "super-retirement"
  | "insurance"
  | "scams-safety"
  | "community";

export type ArticleFrontmatter = {
  title: string;
  description: string;
  pillar: PillarId;
  hub: string;
  slug: string;
  updated: string;
  relatedTools?: string[];
  relatedGuides?: string[];
  tags?: string[];
  /** Optional reusable SVG diagram id from the guide diagrams registry */
  diagram?: string;
};

export type Hub = {
  id: string;
  title: string;
  description: string;
  pillar: PillarId;
};

export type Pillar = {
  id: PillarId;
  title: string;
  description: string;
  shortLabel: string;
};

export type ToolMeta = {
  id: string;
  title: string;
  description: string;
  pillar: PillarId;
  hubs: string[];
  href: string;
};

export type LifeEvent = {
  id: string;
  title: string;
  description: string;
  href: string;
};

export type Article = ArticleFrontmatter & {
  body: string;
};
