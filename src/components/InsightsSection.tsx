import React from 'react';
import { Product, ForecastPoint, SalesData } from '../types';
import { Lightbulb, TrendingUp, TrendingDown, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface InsightsSectionProps {
  product: Product;
  forecast: ForecastPoint[];
  historical: SalesData[];
}

export const InsightsSection: React.FC<InsightsSectionProps> = ({ product, forecast, historical }) => {
  const generateInsights = () => {
    const insights = [];
    const totalForecast = forecast.reduce((acc, f) => acc + f.predictedSales, 0);
    const avgHistorical = historical.slice(-7).reduce((acc, h) => acc + h.sales, 0) / 7;
    const forecastAvg = totalForecast / forecast.length;
    
    const trend = forecastAvg > avgHistorical * 1.1 ? 'up' : forecastAvg < avgHistorical * 0.9 ? 'down' : 'stable';
    const isLowStock = product.currentStock < totalForecast;

    if (trend === 'up') {
      insights.push({
        title: 'Demand Surge Predicted',
        description: `Demand for ${product.name} is expected to increase by ${Math.round((forecastAvg / avgHistorical - 1) * 100)}% over the next period.`,
        recommendation: 'Increase stock levels immediately and consider a featured placement in-store.',
        type: 'opportunity',
        icon: <TrendingUp className="w-5 h-5 text-emerald-500" />
      });
    } else if (trend === 'down') {
      insights.push({
        title: 'Demand Decline Expected',
        description: `We anticipate a ${Math.round((1 - forecastAvg / avgHistorical) * 100)}% drop in demand compared to last week.`,
        recommendation: 'Launch a "Flash Sale" or bundle this item with high-demand products to clear inventory.',
        type: 'warning',
        icon: <TrendingDown className="w-5 h-5 text-amber-500" />
      });
    }

    if (isLowStock) {
      insights.push({
        title: 'Potential Stockout Risk',
        description: `Current stock (${product.currentStock}) is insufficient for the predicted demand (${Math.round(totalForecast)}).`,
        recommendation: `Order at least ${Math.round(totalForecast - product.currentStock + product.minStockLevel)} units to maintain safety buffer.`,
        type: 'danger',
        icon: <AlertCircle className="w-5 h-5 text-red-500" />
      });
    }

    if (trend === 'stable' && !isLowStock) {
      insights.push({
        title: 'Stable Market Performance',
        description: `${product.name} is showing consistent demand patterns with healthy stock levels.`,
        recommendation: 'Maintain current replenishment schedule. Focus marketing efforts on other categories.',
        type: 'info',
        icon: <Lightbulb className="w-5 h-5 text-indigo-500" />
      });
    }

    return insights;
  };

  const insights = generateInsights();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
          Actionable Insights
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-6 rounded-2xl border flex flex-col gap-4 backdrop-blur-sm transition-all hover:translate-y-[-2px] ${
              insight.type === 'danger' ? 'bg-red-500/5 border-red-500/20 shadow-[0_8px_30px_rgb(239,68,68,0.05)]' :
              insight.type === 'warning' ? 'bg-amber-500/5 border-amber-500/20 shadow-[0_8px_30px_rgb(245,158,11,0.05)]' :
              insight.type === 'opportunity' ? 'bg-emerald-500/5 border-emerald-500/20 shadow-[0_8px_30px_rgb(16,185,129,0.05)]' :
              'bg-sky-500/5 border-sky-500/20 shadow-[0_8px_30px_rgb(14,165,233,0.05)]'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 shadow-inner">
                {insight.icon}
              </div>
              <h4 className="font-black text-white tracking-tight">{insight.title}</h4>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">{insight.description}</p>
            <div className="mt-auto pt-4 border-t border-slate-800 flex items-start gap-3">
              <div className="mt-1 p-1 bg-slate-800 rounded-full">
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </div>
              <p className="text-xs font-medium text-slate-300 italic">
                <span className="font-bold uppercase text-[10px] text-slate-500 block mb-1 tracking-widest">Recommendation</span>
                {insight.recommendation}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
