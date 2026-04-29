"use client";

import { useState } from "react";

type TooltipProps = {
  content: string;
  children: React.ReactNode;
  /** Width of the tooltip bubble. Defaults to "w-56". */
  width?: string;
};

export function Tooltip({ content, children, width = "w-56" }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <span className="group relative inline-flex items-center">
      <span
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="inline-flex cursor-help"
      >
        {children}
      </span>
      {visible && (
        <span
          role="tooltip"
          className={`pointer-events-none absolute bottom-full left-1/2 z-20 mb-2.5 ${width} -translate-x-1/2 rounded-xl bg-(--antarctica-ink) px-3 py-2.5 text-xs leading-5 text-white shadow-lg`}
        >
          {content}
          {/* Arrow */}
          <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-(--antarctica-ink)" />
        </span>
      )}
    </span>
  );
}

/** A small circular info icon intended for use inside a Tooltip trigger. */
export function InfoIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={`inline-block h-3.5 w-3.5 ${className}`}
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="7" opacity="0.15" />
      <circle cx="8" cy="5.5" r="1" />
      <rect x="7.25" y="7.5" width="1.5" height="4" rx="0.75" />
    </svg>
  );
}
