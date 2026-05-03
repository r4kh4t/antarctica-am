import { PortfolioDashboard } from "@/components/dashboard";
import { getPortfolioData } from "@/lib/portfolio/data";
import { buildPortfolioRecommendation } from "@/lib/portfolio/recommendation";

export default function Home() {
  const { holdings, prices, benchmark, constraints, dataWarnings } = getPortfolioData();
  const recommendation = buildPortfolioRecommendation(
    holdings,
    prices,
    benchmark,
    constraints,
    dataWarnings,
  );

  return <PortfolioDashboard recommendation={recommendation} />;
}
