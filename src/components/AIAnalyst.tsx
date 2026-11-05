import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIAnalystProps {
  analysis: string | null;
  loading: boolean;
}

export const AIAnalyst: React.FC<AIAnalystProps> = ({ analysis, loading }) => {
  return (
    <div className="bg-slate-900/80 text-slate-100 rounded-2xl p-8 shadow-2xl border border-slate-800 relative overflow-hidden backdrop-blur-md">
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <Sparkles className="w-32 h-32 text-sky-400" />
      </div>
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-sky-500 rounded-xl shadow-lg shadow-sky-500/20">
          <Sparkles className="w-5 h-5 text-white fill-white" />
        </div>
        <h3 className="text-xl font-black tracking-tight text-white">Gemini Demand Analyst</h3>
      </div>

      <div className="min-h-[200px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full py-16 gap-6">
            <div className="relative">
              <Loader2 className="w-10 h-10 text-sky-400 animate-spin" />
              <div className="absolute inset-0 blur-lg bg-sky-400/20 animate-pulse" />
            </div>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest animate-pulse">Analyzing market intelligence...</p>
          </div>
        ) : analysis ? (
          <div className="prose prose-invert prose-sky max-w-none">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <p className="text-slate-500 italic font-medium">Select a product to generate AI demand insights.</p>
          </div>
        )}
      </div>
    </div>
  );
};
