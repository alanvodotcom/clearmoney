import Link from "next/link";
import { clsx } from "clsx";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "urgent";
  className?: string;
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
}: Props) {
  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex items-center justify-center rounded-[var(--radius)] px-4 py-2.5 text-sm font-semibold transition-colors no-underline",
        variant === "primary" &&
          "bg-accent text-white hover:bg-accent-hover",
        variant === "secondary" &&
          "bg-accent-soft text-accent hover:bg-[#d5ecec]",
        variant === "ghost" &&
          "bg-transparent text-foreground underline-offset-2 hover:underline",
        variant === "urgent" &&
          "bg-urgent text-white hover:bg-[#7f2424]",
        className,
      )}
    >
      {children}
    </Link>
  );
}
