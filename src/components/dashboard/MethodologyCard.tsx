import type { PortfolioRecommendation } from "@/lib/portfolio/types";

type MethodologyCardProps = {
  recommendation: PortfolioRecommendation;
};

const MONTHLY_RETURN_FORMULA = "r = P(end)/P(prev) - 1";

function MethodologyBody({ text }: { text: string }) {
  if (!text.includes(MONTHLY_RETURN_FORMULA)) {
    return <>{text}</>;
  }
  const [before, after] = text.split(MONTHLY_RETURN_FORMULA);
  const tail = after.trimStart();
  return (
    <span className="flex flex-col gap-1.5">
      <span>{before.trimEnd()}</span>
      <code className="inline-block w-fit max-w-full rounded-md border border-white/20 bg-white/12 px-2 py-1 font-mono text-[0.8125rem] font-medium leading-snug text-white/95 tabular-nums">
        {MONTHLY_RETURN_FORMULA}
      </code>
      {tail.length > 0 ? <span>{tail}</span> : null}
    </span>
  );
}

export function MethodologyCard({ recommendation }: MethodologyCardProps) {
  return (
    <section className="flex h-full flex-col rounded-3xl bg-ink p-6 text-white shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-label text-primary">Methodology</p>
      <h2 className="mt-2 text-2xl font-semibold">How the recommendation was produced</h2>
      <ul className="mt-5 flex-1 space-y-3 text-sm leading-6 text-white/78">
        {recommendation.methodology.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
            <span>
              <MethodologyBody text={item} />
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
