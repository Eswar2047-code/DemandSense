import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { SalesData, ForecastPoint } from '../types';
import { format, parseISO, isWithinInterval } from 'date-fns';

interface ForecastChartProps {
  historical: SalesData[];
  forecast: ForecastPoint[];
  dateRange: { start: Date; end: Date };
}

export const ForecastChart: React.FC<ForecastChartProps> = ({ historical, forecast, dateRange }) => {
  const combinedData = [
    ...historical.map(d => ({
      date: d.date,
      actual: d.sales,
      predicted: null,
      low: null,
      high: null,
      type: 'historical'
    })),
    ...forecast.map(d => ({
      date: d.date,
      actual: null,
      predicted: d.predictedSales,
      low: d.confidenceInterval[0],
      high: d.confidenceInterval[1],
      type: 'forecast'
    }))
  ].filter(item => {
    const itemDate = parseISO(item.date);
    return isWithinInterval(itemDate, { start: dateRange.start, end: dateRange.end });
  });

  return (
    <div className="h-[450px] w-full bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Demand Intelligence</h3>
          <p className="text-xs text-slate-500">Historical sales vs. AI-predicted demand patterns</p>
        </div>
        <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-sky-400 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
            <span className="text-slate-400">Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            <span className="text-slate-400">Forecast</span>
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={combinedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(str) => format(parseISO(str), 'MMM d')}
            stroke="#475569"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="#475569" 
            fontSize={11} 
            tickLine={false}
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0f172a', 
              borderRadius: '12px', 
              border: '1px solid #1e293b', 
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)', 
              padding: '12px',
              color: '#f1f5f9'
            }}
            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
            labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
            labelFormatter={(str) => format(parseISO(str as string), 'EEEE, MMMM d, yyyy')}
          />
          
          {/* Confidence Interval Area */}
          <Area
            name="Confidence Range"
            type="monotone"
            dataKey={(d) => [d.low, d.high]}
            stroke="none"
            fill="#34d399"
            fillOpacity={0.05}
            connectNulls
          />

          <Area 
            name="Actual Sales"
            type="monotone" 
            dataKey="actual" 
            stroke="#38bdf8" 
            fillOpacity={1} 
            fill="url(#colorActual)" 
            strokeWidth={3}
            connectNulls
            dot={{ r: 4, fill: '#38bdf8', strokeWidth: 2, stroke: '#020617' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Area 
            name="Predicted Demand"
            type="monotone" 
            dataKey="predicted" 
            stroke="#34d399" 
            fillOpacity={1} 
            fill="url(#colorPredicted)" 
            strokeWidth={3}
            strokeDasharray="6 6"
            connectNulls
            dot={{ r: 4, fill: '#34d399', strokeWidth: 2, stroke: '#020617' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
