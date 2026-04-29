"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const TOOLTIP_GAP_PX = 10;

type TooltipProps = {
  content: string;
  children: React.ReactNode;
  /** Width of the tooltip bubble. Defaults to "w-56". */
  width?: string;
  /** When true the tooltip bubble is never shown. */
  disabled?: boolean;
};

export function Tooltip({ content, children, width = "w-56", disabled = false }: TooltipProps) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ left: number; top: number } | null>(null);

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setCoords({
      left: r.left + r.width / 2,
      top: r.top - TOOLTIP_GAP_PX,
    });
  }, []);

  const show = useCallback(() => {
    if (disabled) return;
    updatePosition();
    setVisible(true);
  }, [disabled, updatePosition]);

  const hide = useCallback(() => {
    setVisible(false);
    setCoords(null);
  }, []);

  useEffect(() => {
    if (!visible) return;
    updatePosition();
    const onScrollOrResize = () => updatePosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [visible, updatePosition]);

  const bubble =
    typeof document !== "undefined" &&
    visible &&
    !disabled &&
    coords &&
    createPortal(
      <span
        role="tooltip"
        className={`pointer-events-none relative z-60 ${width} rounded-xl bg-ink px-3 py-2.5 text-xs leading-5 text-white shadow-lg ring-1 ring-primary/45`}
        style={{
          position: "fixed",
          left: coords.left,
          top: coords.top,
          transform: "translate(-50%, -100%)",
        }}
      >
        {content}
        <span className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-ink" />
      </span>,
      document.body,
    );

  return (
    <>
      <span
        ref={triggerRef}
        className="relative inline-flex items-center"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        <span className="inline-flex cursor-help">{children}</span>
      </span>
      {bubble}
    </>
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
