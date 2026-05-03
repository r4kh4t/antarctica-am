"use client";

import { useState } from "react";
import type { ConstraintCompliance, DataWarning } from "@/lib/portfolio/types";

const SOURCE_LABEL: Record<DataWarning["source"], string> = {
  holdings: "holdings",
  prices: "prices",
  benchmark: "benchmark",
  constraints: "constraints",
};

const SOURCE_COLOR: Record<DataWarning["source"], string> = {
  holdings: "bg-blue-50 text-blue-700 hover:bg-blue-100",
  prices: "bg-violet-50 text-violet-700 hover:bg-violet-100",
  benchmark: "bg-amber-50 text-amber-800 hover:bg-amber-100",
  constraints: "bg-slate-100 text-slate-700 hover:bg-slate-200",
};

const SOURCE_FILE: Record<DataWarning["source"], string> = {
  holdings: "/data/holdings.json",
  prices: "/data/prices.json",
  benchmark: "/data/benchmark.json",
  constraints: "/data/constraints.json",
};

function CheckIcon() {
  return (
    <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function WarnIcon() {
  return (
    <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

interface DataQualitySummaryProps {
  warnings: DataWarning[];
  constraintCompliance: ConstraintCompliance;
}

export function DataQualitySummary({ warnings, constraintCompliance }: DataQualitySummaryProps) {
  const [open, setOpen] = useState(false);

  const allConstraintsPassed =
    constraintCompliance.maxAssets.passed &&
    constraintCompliance.weightBounds.passed &&
    constraintCompliance.classCaps.passed;

  const hasConstraintIssues = !allConstraintsPassed;

  return (
    <div
      className={`rounded-3xl border transition-all duration-300 shadow-sm overflow-hidden ${
        hasConstraintIssues ? "border-amber-200 bg-amber-50/40" : "border-border bg-white"
      }`}
    >
      {/* Header / toggle */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-sm font-medium text-left hover:bg-primary-subtle/60 active:scale-[0.999] transition-all focus:outline-none focus:bg-primary-subtle/60 group cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <span
            className={`flex h-2 w-2 rounded-full animate-pulse ${
              hasConstraintIssues ? "bg-amber-400" : "bg-emerald-400"
            }`}
          />
          <span className="text-secondary">
            <span className="font-semibold text-ink">{warnings.length}</span> data issue
            {warnings.length !== 1 ? "s" : ""} detected and resolved
            <span className="mx-2 text-border">·</span>
            <span
              className={`font-semibold ${
                hasConstraintIssues ? "text-amber-600" : "text-emerald-600"
              }`}
            >
              Constraints: {allConstraintsPassed ? "all satisfied" : "soft violations present"}
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
            {open ? "Collapse" : "View details"}
          </span>
          <span
            className={`text-secondary/50 transition-transform duration-300 ${open ? "rotate-180" : "rotate-0"}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
        </div>
      </button>

      {/* Animated expandable body */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-6 pt-1 border-t border-border bg-white">
            <div className="flex flex-col gap-8 mt-4">
              {/* Data Quality Resolutions */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-label text-secondary mb-3">
                  Data Quality Resolutions
                </p>
                <ul className="space-y-2">
                  {warnings.map((w, i) => (
                    <li key={i} className="flex gap-2.5 items-start group/item">
                      <a
                        href={SOURCE_FILE[w.source]}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`View ${SOURCE_LABEL[w.source]}.json`}
                        className={`font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 mt-0.5 transition-colors underline underline-offset-2 decoration-transparent hover:decoration-current ${SOURCE_COLOR[w.source]}`}
                      >
                        [{SOURCE_LABEL[w.source]}]
                      </a>
                      <span className="text-xs text-secondary leading-relaxed group-hover/item:text-ink transition-colors">
                        {w.issue}
                        <span className="mx-1.5 text-border">→</span>
                        <span className="font-semibold text-ink">{w.resolution}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Constraint Compliance */}
              <div className="pt-5 border-t border-border">
                <p className="text-xs font-semibold uppercase tracking-label text-secondary mb-3">
                  Constraint Compliance
                </p>
                <ul className="space-y-3">
                  {/* Max assets */}
                  <li className="flex items-start gap-2.5">
                    <span
                      className={`mt-0.5 flex items-center justify-center w-4 h-4 rounded-full text-white text-[10px] shrink-0 ${
                        constraintCompliance.maxAssets.passed ? "bg-emerald-500" : "bg-amber-400"
                      }`}
                    >
                      {constraintCompliance.maxAssets.passed ? <CheckIcon /> : <WarnIcon />}
                    </span>
                    <span className="text-xs text-secondary leading-relaxed">
                      <span className="font-semibold text-ink">Max Assets:</span>{" "}
                      {constraintCompliance.maxAssets.actual} unique holdings /{" "}
                      {constraintCompliance.maxAssets.limit} limit
                      <span className="block text-[10px] text-secondary/50 italic mt-0.5">
                        {constraintCompliance.maxAssets.note}
                      </span>
                    </span>
                  </li>

                  {/* Weight bounds */}
                  <li className="flex items-start gap-2.5">
                    <span
                      className={`mt-0.5 flex items-center justify-center w-4 h-4 rounded-full text-white text-[10px] shrink-0 ${
                        constraintCompliance.weightBounds.passed ? "bg-emerald-500" : "bg-red-400"
                      }`}
                    >
                      {constraintCompliance.weightBounds.passed ? <CheckIcon /> : <WarnIcon />}
                    </span>
                    <span className="text-xs text-secondary leading-relaxed">
                      <span className="font-semibold text-ink">Weight Bounds:</span> [
                      {(constraintCompliance.weightBounds.min * 100).toFixed(0)}%–
                      {(constraintCompliance.weightBounds.max * 100).toFixed(0)}%] per asset
                      {constraintCompliance.weightBounds.violations.length > 0 && (
                        <span className="block text-red-500 mt-1 pl-2 border-l-2 border-red-100 text-[10px]">
                          {constraintCompliance.weightBounds.violations.join("; ")}
                        </span>
                      )}
                    </span>
                  </li>

                  {/* Class caps */}
                  <li className="flex items-start gap-2.5">
                    <span
                      className={`mt-0.5 flex items-center justify-center w-4 h-4 rounded-full text-white text-[10px] shrink-0 ${
                        constraintCompliance.classCaps.passed ? "bg-emerald-500" : "bg-red-400"
                      }`}
                    >
                      {constraintCompliance.classCaps.passed ? <CheckIcon /> : <WarnIcon />}
                    </span>
                    <span className="text-xs text-secondary leading-relaxed">
                      <span className="font-semibold text-ink">Asset Class Caps:</span> 30% per
                      class (Equity · Fixed Income · Alternatives)
                      {constraintCompliance.classCaps.violations.length > 0 && (
                        <span className="block text-red-500 mt-1 pl-2 border-l-2 border-red-100 text-[10px]">
                          {constraintCompliance.classCaps.violations.join("; ")}
                        </span>
                      )}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
