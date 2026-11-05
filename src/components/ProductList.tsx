import React, { useState, useMemo } from 'react';
import { Product } from '../types';
import { Package, AlertTriangle, CheckCircle2, SortAsc, SortDesc } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ProductListProps {
  products: Product[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export const ProductList: React.FC<ProductListProps> = ({ products, selectedId, onSelect }) => {
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'category'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'stock') {
        comparison = a.currentStock - b.currentStock;
      } else if (sortBy === 'category') {
        comparison = a.category.localeCompare(b.category);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [products, sortBy, sortOrder]);

  return (
    <div className="bg-slate-900/50 rounded-2xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-sm">
      <div className="p-5 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-sky-400" />
            Inventory Status
          </h3>
          <button 
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-sky-400 transition-all border border-slate-700"
            title={sortOrder === 'asc' ? "Sort Ascending" : "Sort Descending"}
          >
            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Sort:</span>
          {(['name', 'stock', 'category'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSortBy(type)}
              className={cn(
                "text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest transition-all border",
                sortBy === type 
                  ? "bg-sky-500/10 text-sky-400 border-sky-500/20" 
                  : "bg-slate-800/50 text-slate-500 border-slate-700/50 hover:text-slate-300"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      <div className="divide-y divide-slate-800 max-h-[400px] overflow-y-auto custom-scrollbar">
        {sortedProducts.map((product) => {
          const isLow = product.currentStock <= product.minStockLevel;
          const isSelected = product.id === selectedId;

          return (
            <button
              key={product.id}
              onClick={() => onSelect(product.id)}
              className={cn(
                "w-full p-5 text-left transition-all hover:bg-slate-800 flex items-center justify-between group relative",
                isSelected && "bg-sky-500/5 border-l-4 border-sky-500"
              )}
            >
              <div>
                <p className={cn("font-bold transition-colors", isSelected ? "text-sky-400" : "text-slate-200")}>{product.name}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{product.category}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <span className={cn(
                    "text-sm font-black",
                    isLow ? "text-amber-400" : "text-emerald-400"
                  )}>
                    {product.currentStock} {product.unit}
                  </span>
                  {isLow ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
                  )}
                </div>
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1">
                  Min: {product.minStockLevel}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
