export type Asset = {
  assetId: string;
  ticker: string;
  name: string;
  sector: string;
  region: string;
  currentWeight: number;
};

export type Holdings = {
  asOf: string;
  currency: string;
  assets: Asset[];
};

export type PricePoint = {
  date: string;
  assetId: string;
  close: number;
};

export type Prices = {
  currency: string;
  frequency: "daily";
  prices: PricePoint[];
};

export type BenchmarkPoint = {
  date: string;
  level: number;
};

export type Benchmark = {
  benchmarkId: string;
  name: string;
  currency: string;
  levels: BenchmarkPoint[];
};

export type SectorBound = {
  sector: string;
  min: number;
  max: number;
};

export type Constraints = {
  asOf: string;
  objective: string;
  maxAssetWeight: number;
  minAssetWeight: number;
  maxTurnover: number;
  sectorBounds: SectorBound[];
  notes: string[];
};

export type MonthlyReturn = {
  assetId: string;
  month: string;
  return: number;
};

export type AssetMetric = {
  asset: Asset;
  monthlyReturns: MonthlyReturn[];
  averageMonthlyReturn: number;
  monthlyVolatility: number;
  annualizedReturn: number;
  annualizedVolatility: number;
  riskAdjustedScore: number;
  benchmarkRelativeReturn: number;
};

export type RecommendationRow = {
  assetId: string;
  ticker: string;
  name: string;
  sector: string;
  region: string;
  currentWeight: number;
  recommendedWeight: number;
  weightDelta: number;
  averageMonthlyReturn: number;
  annualizedVolatility: number;
  riskAdjustedScore: number;
  rationale: string;
};

export type SectorExposure = {
  sector: string;
  min: number;
  max: number;
  currentWeight: number;
  recommendedWeight: number;
  status: "within" | "below" | "above";
};

export type PortfolioSummary = {
  expectedMonthlyReturn: number;
  currentExpectedMonthlyReturn: number;
  expectedAnnualizedVolatility: number;
  turnover: number;
  constraintStatus: "Within soft constraints" | "Review required";
  benchmarkAverageMonthlyReturn: number;
};

export type AssetMonthlyReturn = {
  assetId: string;
  ticker: string;
  month: string;
  return: number;
};

export type PortfolioRecommendation = {
  asOf: string;
  currency: string;
  objective: string;
  rows: RecommendationRow[];
  sectorExposures: SectorExposure[];
  summary: PortfolioSummary;
  benchmarkName: string;
  benchmarkMonthlyReturns: { month: string; return: number }[];
  assetMonthlyReturns: AssetMonthlyReturn[];
  methodology: string[];
};
