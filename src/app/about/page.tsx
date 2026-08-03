import type { Metadata } from "next";
import { Disclaimer } from "@/components/ui/Disclaimer";

export const metadata: Metadata = {
  title: "About",
  description: "What ClearMoney is—and isn’t.",
};

export default function AboutPage() {
  return (
    <main id="main" className="mx-auto max-w-[var(--max)] px-4 py-12 sm:px-6">
      <h1 className="font-display text-4xl tracking-tight">About ClearMoney</h1>
      <div className="prose-cm mt-8">
        <p>
          ClearMoney is a portfolio rebrand of the MoneySmart-style experience:
          task-first navigation, a persistent tools index, and a minimal
          mobile-first interface focused on PageSpeed and clarity.
        </p>
        <h2>Design principles</h2>
        <ul>
          <li>Tools are first-class—not buried under topic trees.</li>
          <li>Urgent help stays visible for debt stress and scams.</li>
          <li>Original copy; not affiliated with ASIC or government sites.</li>
          <li>Performance and accessibility are product features.</li>
        </ul>
        <h2>Tech</h2>
        <p>
          Next.js App Router, TypeScript, Tailwind CSS, pure calculator modules
          with Vitest, and static content routes for fast loads.
        </p>
      </div>
      <div className="mt-10 max-w-2xl">
        <Disclaimer />
      </div>
    </main>
  );
}
