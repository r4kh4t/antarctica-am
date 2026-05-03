/** Stops Recharts 3 from logging -1×-1 before the first ResizeObserver tick (SSR / first paint). */
export const RECHARTS_INITIAL_DIMENSION = { width: 1200, height: 360 } as const;
