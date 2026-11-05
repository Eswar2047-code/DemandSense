import { SalesData, ForecastPoint } from '../types';

/**
 * A simulated demand forecasting service.
 * In a real app, this would call a backend ML model.
 */
export const forecastDemand = (
  historicalData: SalesData[],
  horizonDays: number = 7,
  promotionBoost: number = 0
): ForecastPoint[] => {
  const lastDate = new Date(historicalData[historicalData.length - 1].date);
  const forecast: ForecastPoint[] = [];

  // Simple moving average + seasonality logic
  const avgSales = historicalData.reduce((acc, d) => acc + d.sales, 0) / historicalData.length;

  for (let i = 1; i <= horizonDays; i++) {
    const date = new Date(lastDate);
    date.setDate(date.getDate() + i);
    
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Seasonal factor (weekends)
    const seasonalImpact = isWeekend ? 1.4 : 1.0;
    
    // Trend (slight growth simulation)
    const trendImpact = 1 + (i * 0.01);
    
    // Base prediction
    let predicted = avgSales * seasonalImpact * trendImpact;
    
    // Add promotion boost if applicable
    const promotionalImpact = 1 + promotionBoost;
    predicted *= promotionalImpact;

    forecast.push({
      date: date.toISOString().split('T')[0],
      predictedSales: Math.round(predicted),
      confidenceInterval: [Math.round(predicted * 0.8), Math.round(predicted * 1.2)],
      factors: {
        seasonal: seasonalImpact - 1,
        promotional: promotionalImpact - 1,
        trend: trendImpact - 1,
      }
    });
  }

  return forecast;
};
