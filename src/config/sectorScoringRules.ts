export interface SectorScoringWeights {
  trendWeight: number;
  breadthWeight: number;
  momentumWeight: number;
  relativeStrengthWeight: number;
  volumeWeight: number;
}

export const sectorScoringWeights: SectorScoringWeights = {
  trendWeight: 0.3,
  breadthWeight: 0.2,
  momentumWeight: 0.2,
  relativeStrengthWeight: 0.15,
  volumeWeight: 0.15
};

export const getCompositeScoreExplanation = () => {
  return "Demo Composite Score = (Trend Score * 30%) + (Breadth Score * 20%) + (Momentum Score * 20%) + (Relative Strength * 15%) + (Volume Expansion * 15%)";
};
