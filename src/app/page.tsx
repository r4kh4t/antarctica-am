import { PortfolioDashboard } from "@/components/PortfolioDashboard";
import { getPortfolioData } from "@/lib/portfolio/data";
import { buildPortfolioRecommendation } from "@/lib/portfolio/recommendation";

export default function Home() {
  const { holdings, prices, benchmark, constraints } = getPortfolioData();
  const recommendation = buildPortfolioRecommendation(holdings, prices, benchmark, constraints);

  return <PortfolioDashboard recommendation={recommendation} />;
}
