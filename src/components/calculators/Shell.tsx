"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useId,
  useState,
} from "react";
import { Disclaimer } from "@/components/ui/Disclaimer";

export function CalculatorShell({
  title,
  description,
  children,
  results,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  results: React.ReactNode;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="space-y-4" aria-labelledby="calc-title">
        <div>
          <h1
            id="calc-title"
            className="font-display text-3xl tracking-tight sm:text-4xl"
          >
            {title}
          </h1>
          <p className="mt-2 text-muted">{description}</p>
        </div>
        <div className="space-y-4 rounded-[var(--radius)] border border-border bg-surface p-4 sm:p-6">
          {children}
        </div>
        <Disclaimer compact />
      </section>
      <section
        className="rounded-[var(--radius)] border border-border bg-accent-soft/50 p-4 sm:p-6 lg:sticky lg:top-24 lg:self-start"
        aria-labelledby="calc-results"
      >
        <h2
          id="calc-results"
          className="text-sm font-semibold uppercase tracking-wide text-muted"
        >
          Results
        </h2>
        <div className="mt-4 space-y-3">{results}</div>
      </section>
    </div>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  const hintId = useId();
  const child = Children.only(children);
  const describedBy = hint ? hintId : undefined;
  const enhanced =
    isValidElement<{ "aria-describedby"?: string }>(child) && describedBy
      ? cloneElement(child, {
          "aria-describedby": [child.props["aria-describedby"], describedBy]
            .filter(Boolean)
            .join(" "),
        })
      : children;

  return (
    <label className="block text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <div className="mt-1.5">{enhanced}</div>
      {hint ? (
        <span id={hintId} className="mt-1 block text-xs text-muted">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  id,
  "aria-describedby": ariaDescribedBy,
  "aria-label": ariaLabel,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  id?: string;
  "aria-describedby"?: string;
  "aria-label"?: string;
}) {
  const [touched, setTouched] = useState(false);
  const finite = Number.isFinite(value);
  const outOfRange =
    finite &&
    ((min != null && value < min) || (max != null && value > max));
  const invalid = touched && (!finite || outOfRange);
  const errorId = id ? `${id}-error` : undefined;
  const unitId = useId();
  const unitHint = [prefix, suffix].filter(Boolean).join(" ");

  return (
    <div className="relative">
      {unitHint ? (
        <span id={unitId} className="sr-only">
          Unit: {unitHint}
        </span>
      ) : null}
      {prefix ? (
        <span
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          aria-hidden="true"
        >
          {prefix}
        </span>
      ) : null}
      <input
        id={id}
        type="number"
        className={`cm-control w-full rounded-[var(--radius)] border bg-background px-3 py-2.5 ${prefix ? "pl-7" : ""} ${suffix ? "pr-10" : ""} ${invalid ? "border-urgent" : ""}`}
        value={finite ? value : ""}
        min={min}
        max={max}
        step={step}
        aria-invalid={invalid || undefined}
        aria-describedby={
          [
            ariaDescribedBy,
            unitHint ? unitId : null,
            invalid ? errorId : null,
          ]
            .filter(Boolean)
            .join(" ") || undefined
        }
        aria-label={ariaLabel}
        onBlur={() => setTouched(true)}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") {
            onChange(Number.NaN);
            return;
          }
          onChange(Number(raw));
        }}
      />
      {suffix ? (
        <span
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
          aria-hidden="true"
        >
          {suffix}
        </span>
      ) : null}
      {invalid && errorId ? (
        <span id={errorId} className="mt-1 block text-xs text-urgent" role="alert">
          {!finite
            ? "Enter a number."
            : min != null && value < min
              ? `Minimum is ${min}${suffix ?? ""}.`
              : max != null && value > max
                ? `Maximum is ${max}${suffix ?? ""}.`
                : "Invalid value."}
        </span>
      ) : null}
    </div>
  );
}

export function Stat({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p
        className={`mt-1 font-display tracking-tight ${emphasize ? "text-3xl text-accent" : "text-2xl"}`}
      >
        {value}
      </p>
    </div>
  );
}

export function SelectInput({
  value,
  onChange,
  options,
  id,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  id?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
}) {
  return (
    <select
      id={id}
      className="cm-control w-full rounded-[var(--radius)] border bg-background px-3 py-2.5"
      value={value}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function ModeTabs({
  modes,
  value,
  onChange,
  label = "Calculation mode",
}: {
  modes: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  label?: string;
}) {
  const groupId = useId();

  return (
    <div
      className="flex flex-wrap gap-2"
      role="radiogroup"
      aria-labelledby={groupId}
    >
      <span id={groupId} className="sr-only">
        {label}
      </span>
      {modes.map((mode) => {
        const selected = value === mode.id;
        return (
          <button
            key={mode.id}
            type="button"
            role="radio"
            aria-checked={selected}
            className={`min-h-11 min-w-11 rounded-[var(--radius)] px-3 py-2 text-sm font-medium ${
              selected
                ? "bg-accent text-white"
                : "border border-border-strong bg-background text-foreground"
            }`}
            onClick={() => onChange(mode.id)}
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
