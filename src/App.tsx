/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Calendar,
  RefreshCw,
  Info,
  ChevronRight,
  Zap,
  Filter,
  Search,
  ArrowUpRight,
  Clock,
  SortAsc,
  SortDesc,
  Bell
} from 'lucide-react';
import { PRODUCTS, generateHistoricalData, generateAggregateHistoricalData } from './constants';
import { forecastDemand } from './services/forecastService';
import { getAIAnalysis } from './services/aiService';
import { ForecastChart } from './components/ForecastChart';
import { ProductList } from './components/ProductList';
import { AIAnalyst } from './components/AIAnalyst';
import { InsightsSection } from './components/InsightsSection';
import { Product, SalesData, ForecastPoint } from './types';
import { subDays, addDays, startOfDay } from 'date-fns';

export default function App() {
  const [selectedProductId, setSelectedProductId] = useState<string>(PRODUCTS[0].id);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [promoBoost, setPromoBoost] = useState<number>(0);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [inventorySortBy, setInventorySortBy] = useState<'name' | 'category' | 'stock' | 'minLevel'>('name');
  const [inventorySortOrder, setInventorySortOrder] = useState<'asc' | 'desc'>('asc');
  const [orderSortBy, setOrderSortBy] = useState<'name' | 'category' | 'stock'>('name');
  const [orderSortOrder, setOrderSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Date range state
  const [dateRange, setDateRange] = useState({
    start: subDays(startOfDay(new Date()), 14),
    end: addDays(startOfDay(new Date()), 14)
  });

  const aggregateHistoricalData = useMemo(() => generateAggregateHistoricalData(), []);
  const aggregateForecast = useMemo(() => forecastDemand(aggregateHistoricalData, 30, 0.1), [aggregateHistoricalData]);

  const categories = useMemo(() => 
    ['All', ...new Set(PRODUCTS.map(p => p.category))],
    []
  );

  const searchedProducts = useMemo(() => {
    if (!searchQuery) return PRODUCTS;
    const query = searchQuery.toLowerCase();
    return PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const filteredProducts = useMemo(() => 
    selectedCategory === 'All' 
      ? searchedProducts 
      : searchedProducts.filter(p => p.category === selectedCategory),
    [selectedCategory, searchedProducts]
  );

  const selectedProduct = useMemo(() => 
    PRODUCTS.find(p => p.id === selectedProductId) || PRODUCTS[0],
    [selectedProductId]
  );

  const historicalData = useMemo(() => 
    generateHistoricalData(selectedProductId),
    [selectedProductId]
  );

  const sortedInventoryProducts = useMemo(() => {
    return [...searchedProducts].sort((a, b) => {
      let comparison = 0;
      if (inventorySortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (inventorySortBy === 'category') {
        comparison = a.category.localeCompare(b.category);
      } else if (inventorySortBy === 'stock') {
        comparison = a.currentStock - b.currentStock;
      } else if (inventorySortBy === 'minLevel') {
        comparison = a.minStockLevel - b.minStockLevel;
      }
      return inventorySortOrder === 'asc' ? comparison : -comparison;
    });
  }, [searchedProducts, inventorySortBy, inventorySortOrder]);

  const sortedOrderProducts = useMemo(() => {
    return [...searchedProducts].sort((a, b) => {
      let comparison = 0;
      if (orderSortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (orderSortBy === 'category') {
        comparison = a.category.localeCompare(b.category);
      } else if (orderSortBy === 'stock') {
        comparison = a.currentStock - b.currentStock;
      }
      return orderSortOrder === 'asc' ? comparison : -comparison;
    });
  }, [searchedProducts, orderSortBy, orderSortOrder]);

  const forecast = useMemo(() => 
    forecastDemand(historicalData, 14, promoBoost),
    [historicalData, promoBoost]
  );

  const handleRefreshAnalysis = async () => {
    setIsAiLoading(true);
    const analysis = await getAIAnalysis(selectedProduct, historicalData, forecast);
    setAiAnalysis(analysis);
    setIsAiLoading(false);
  };

  useEffect(() => {
    handleRefreshAnalysis();
  }, [selectedProductId]);

  const totalPredictedSales = forecast.reduce((acc, f) => acc + f.predictedSales, 0);
  const avgConfidence = 88;
  const outOfStockCount = PRODUCTS.filter(p => p.currentStock === 0).length;
  const lowStockCount = PRODUCTS.filter(p => p.currentStock > 0 && p.currentStock < p.minStockLevel).length;
  const totalAlerts = outOfStockCount + lowStockCount;
  
  const [userId, setUserId] = useState<string>('USR-4619X');
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [tempUserId, setTempUserId] = useState('');

  return (
    <div className="min-h-screen bg-[#020617] font-sans text-slate-200 flex">
      {/* Sidebar / Navigation */}
      <nav className="fixed left-0 top-0 h-full w-24 bg-[#0f172a] flex flex-col items-center py-8 gap-10 z-50 border-r border-slate-800 shadow-2xl">
        <div className="w-14 h-14 bg-sky-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/20 transform rotate-3">
          <Zap className="text-white w-8 h-8 fill-white" />
        </div>
        
        <div className="flex flex-col gap-6 flex-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`group relative p-4 rounded-2xl transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/40' : 'text-slate-500 hover:text-sky-400 hover:bg-slate-800'}`}
          >
            <LayoutDashboard className="w-6 h-6" />
            <span className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-slate-700">Dashboard</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`group relative p-4 rounded-2xl transition-all duration-300 ${activeTab === 'inventory' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/40' : 'text-slate-500 hover:text-sky-400 hover:bg-slate-800'}`}
          >
            <Package className="w-6 h-6" />
            <span className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-slate-700">Inventory</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('orders')}
            className={`group relative p-4 rounded-2xl transition-all duration-300 ${activeTab === 'orders' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/40' : 'text-slate-500 hover:text-sky-400 hover:bg-slate-800'}`}
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-slate-700">Orders</span>
          </button>

          <button 
            onClick={() => setActiveTab('sync')}
            className={`group relative p-4 rounded-2xl transition-all duration-300 ${activeTab === 'sync' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/40' : 'text-slate-500 hover:text-sky-400 hover:bg-slate-800'}`}
          >
            <RefreshCw className="w-6 h-6" />
            <span className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-slate-700">Sync</span>
          </button>

          <button 
            onClick={() => setActiveTab('notifications')}
            className={`group relative p-4 rounded-2xl transition-all duration-300 ${activeTab === 'notifications' ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/40' : 'text-slate-500 hover:text-sky-400 hover:bg-slate-800'}`}
          >
            <div className="relative">
              <Bell className="w-6 h-6" />
              {totalAlerts > 0 && (
                <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-[#0f172a] animate-pulse ${outOfStockCount > 0 ? 'bg-rose-500' : 'bg-amber-500'}`} />
              )}
            </div>
            <span className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 border border-slate-700">Notifications</span>
          </button>
        </div>

        <div className="mt-auto flex flex-col gap-6">
          <div className="group relative">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 overflow-hidden ring-2 ring-sky-500/20 cursor-pointer hover:ring-sky-500 transition-all">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Spiderman" alt="Profile" referrerPolicy="no-referrer" />
            </div>
            <div className="absolute left-full ml-4 bottom-0 p-4 bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 w-48">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Authenticated As</p>
              <p className="text-sm font-bold text-white truncate">{userId}</p>
              <div className="mt-3 pt-3 border-t border-slate-800">
                <p className="text-[10px] text-emerald-400 font-bold">● SYSTEM ONLINE</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 ml-24">
        {/* Top Header */}
        <header className="h-24 bg-[#020617]/80 backdrop-blur-xl border-b border-slate-800 px-10 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-8">
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">DemandSense <span className="text-sky-400">AI</span></h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Operational Intelligence v2.4</p>
              </div>
            </div>

            <div className="h-10 w-px bg-slate-800 mx-2" />

            <div className="flex items-center gap-3 bg-slate-900/50 p-1.5 rounded-xl border border-slate-800">
              <Search className="w-4 h-4 text-slate-500 ml-2" />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-64 text-slate-300 placeholder:text-slate-600 focus:text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Session</p>
              <p className="text-sm font-bold text-slate-300">{isLoggedIn ? userId : 'Guest'}</p>
            </div>
            {!isLoggedIn ? (
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="bg-sky-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-sky-500/20 hover:bg-sky-400 transition-all flex items-center gap-2"
              >
                Login
                <Zap className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={() => setIsLoggedIn(false)}
                className="bg-slate-800 text-slate-300 px-5 py-2.5 rounded-xl font-bold text-sm border border-slate-700 hover:bg-slate-700 transition-all"
              >
                Logout
              </button>
            )}
            <button 
              onClick={() => setIsReportOpen(true)}
              className="bg-sky-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-sky-500/20 hover:bg-sky-400 transition-all flex items-center gap-2"
            >
              Generate Report
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="p-10 max-w-[1600px] mx-auto">
          {activeTab === 'dashboard' ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative space-y-10"
            >
              {/* Background Glows */}
              <div className="absolute -top-40 -left-40 w-80 h-80 bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />
              <div className="absolute top-1/2 -right-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                <div className="bg-slate-900/40 p-8 rounded-3xl border border-slate-800/50 backdrop-blur-md hover:border-sky-500/30 transition-all group">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-sky-500/10 text-sky-400 rounded-2xl group-hover:bg-sky-500 group-hover:text-white transition-all shadow-lg shadow-sky-500/5">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-lg border border-emerald-400/20">+12.5%</span>
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">14-Day Forecast</p>
                  <h3 className="text-3xl font-black text-white tracking-tight">379 <span className="text-sm font-medium text-slate-500">Units</span></h3>
                </div>

                <div className="bg-slate-900/40 p-8 rounded-3xl border border-slate-800/50 backdrop-blur-md hover:border-amber-500/30 transition-all group">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl group-hover:bg-amber-500 group-hover:text-white transition-all shadow-lg shadow-amber-500/5">
                      <Package className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">Action Required</span>
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Current Inventory</p>
                  <h3 className="text-3xl font-black text-white tracking-tight">45 <span className="text-sm font-medium text-slate-500">units</span></h3>
                </div>

                <div className="bg-slate-900/40 p-8 rounded-3xl border border-slate-800/50 backdrop-blur-md hover:border-emerald-500/30 transition-all group">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-lg shadow-emerald-500/5">
                      <Zap className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 bg-slate-800/50 px-2.5 py-1 rounded-lg border border-slate-700">Confidence</span>
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Model Accuracy</p>
                  <h3 className="text-3xl font-black text-white tracking-tight">88%</h3>
                </div>

                <div className="bg-slate-900/40 p-8 rounded-3xl border border-slate-800/50 backdrop-blur-md hover:border-slate-500/30 transition-all group">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 bg-slate-800 text-slate-400 rounded-2xl group-hover:bg-slate-700 group-hover:text-white transition-all">
                      <Calendar className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Next Peak Period</p>
                  <h3 className="text-2xl font-black text-white tracking-tight">Upcoming Weekend</h3>
                </div>
              </div>

              {/* Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-800">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <select 
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-transparent border-none outline-none text-sm font-semibold text-slate-300 cursor-pointer focus:text-sky-400"
                    >
                      {categories.map(cat => <option key={cat} value={cat} className="bg-slate-900">{cat} Category</option>)}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-800">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <select 
                      className="bg-transparent border-none outline-none text-sm font-semibold text-slate-300 cursor-pointer focus:text-sky-400"
                      defaultValue="14"
                      onChange={(e) => {
                        const days = parseInt(e.target.value);
                        setDateRange({
                          start: subDays(startOfDay(new Date()), days),
                          end: addDays(startOfDay(new Date()), days)
                        });
                      }}
                    >
                      <option value="7" className="bg-slate-900">Last 7 Days</option>
                      <option value="14" className="bg-slate-900">Last 14 Days</option>
                      <option value="30" className="bg-slate-900">Last 30 Days</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Confidence Level</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className={`w-6 h-1.5 rounded-full ${i <= 4 ? 'bg-sky-500 shadow-[0_0_8px_rgba(56,189,248,0.4)]' : 'bg-slate-800'}`} />
                    ))}
                  </div>
                  <span className="text-xs font-black text-sky-400">88%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
                {/* Left Column */}
                <div className="lg:col-span-4 space-y-10">
                  <ProductList 
                    products={filteredProducts} 
                    selectedId={selectedProductId} 
                    onSelect={setSelectedProductId} 
                  />

                  <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-8 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-white flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-sky-400" />
                        Market Simulator
                      </h3>
                      <div className="px-2 py-1 bg-sky-500/10 text-sky-400 text-[10px] font-bold rounded border border-sky-500/20">BETA</div>
                    </div>
                    
                    <div className="space-y-8">
                      <div>
                        <div className="flex justify-between mb-3">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Promotion Intensity</label>
                          <span className="text-sm font-black text-sky-400">+{Math.round(promoBoost * 100)}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.05" 
                          value={promoBoost}
                          onChange={(e) => setPromoBoost(parseFloat(e.target.value))}
                          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                        />
                        <div className="flex justify-between mt-2">
                          <span className="text-[10px] text-slate-500 font-bold">ORGANIC</span>
                          <span className="text-[10px] text-slate-500 font-bold">AGGRESSIVE</span>
                        </div>
                      </div>
                      
                      <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 shadow-xl">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-sky-500/10 rounded-lg">
                            <Info className="w-4 h-4 text-sky-400" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-sky-300 mb-1">Impact Analysis</p>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              Increasing promotion to <span className="text-white font-bold">{Math.round(promoBoost * 100)}%</span> is likely to deplete stock <span className="text-amber-400 font-bold">3 days earlier</span> than normal.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-8 space-y-10">
                  <ForecastChart 
                    historical={historicalData} 
                    forecast={forecast} 
                    dateRange={dateRange}
                  />
                  
                  <InsightsSection 
                    product={selectedProduct}
                    forecast={forecast}
                    historical={historicalData}
                  />

                  <AIAnalyst analysis={aiAnalysis} loading={isAiLoading} />
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'inventory' ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tight">Inventory Intelligence</h2>
                  <p className="text-slate-500 mt-1">Real-time stock monitoring and replenishment optimization.</p>
                </div>
                <button className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold text-sm border border-slate-700 hover:bg-slate-700 transition-all">
                  Export Inventory Log
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Total SKU Count', value: PRODUCTS.length, color: 'sky' },
                  { label: 'Out of Stock', value: PRODUCTS.filter(p => p.currentStock === 0).length, color: 'rose' },
                  { label: 'Low Stock Alerts', value: PRODUCTS.filter(p => p.currentStock < p.minStockLevel).length, color: 'amber' }
                ].map((stat, i) => (
                  <div key={i} className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{stat.label}</p>
                    <h3 className={`text-3xl font-black text-${stat.color}-400`}>{stat.value}</h3>
                  </div>
                ))}
              </div>

              <div className="bg-slate-900/50 rounded-3xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-950/50 border-b border-slate-800">
                    <tr>
                      <th 
                        className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:text-sky-400 transition-colors"
                        onClick={() => {
                          if (inventorySortBy === 'name') setInventorySortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                          else { setInventorySortBy('name'); setInventorySortOrder('asc'); }
                        }}
                      >
                        <div className="flex items-center gap-2">
                          Product
                          {inventorySortBy === 'name' && (inventorySortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />)}
                        </div>
                      </th>
                      <th 
                        className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:text-sky-400 transition-colors"
                        onClick={() => {
                          if (inventorySortBy === 'category') setInventorySortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                          else { setInventorySortBy('category'); setInventorySortOrder('asc'); }
                        }}
                      >
                        <div className="flex items-center gap-2">
                          Category
                          {inventorySortBy === 'category' && (inventorySortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />)}
                        </div>
                      </th>
                      <th 
                        className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:text-sky-400 transition-colors"
                        onClick={() => {
                          if (inventorySortBy === 'stock') setInventorySortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                          else { setInventorySortBy('stock'); setInventorySortOrder('asc'); }
                        }}
                      >
                        <div className="flex items-center gap-2">
                          Stock Level
                          {inventorySortBy === 'stock' && (inventorySortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />)}
                        </div>
                      </th>
                      <th 
                        className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:text-sky-400 transition-colors"
                        onClick={() => {
                          if (inventorySortBy === 'minLevel') setInventorySortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                          else { setInventorySortBy('minLevel'); setInventorySortOrder('asc'); }
                        }}
                      >
                        <div className="flex items-center gap-2">
                          Min Level
                          {inventorySortBy === 'minLevel' && (inventorySortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />)}
                        </div>
                      </th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {sortedInventoryProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-lg">{product.icon}</div>
                            <span className="font-bold text-white">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-sm text-slate-400">{product.category}</span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="flex-1 h-1.5 bg-slate-800 rounded-full max-w-[100px]">
                              <div 
                                className={`h-full rounded-full ${product.currentStock < product.minStockLevel ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                style={{ width: `${Math.min(100, (product.currentStock / (product.minStockLevel * 2)) * 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-white">{product.currentStock} {product.unit}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-sm text-slate-500 font-bold">{product.minStockLevel}</span>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${product.currentStock < product.minStockLevel ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                            {product.currentStock < product.minStockLevel ? 'Low Stock' : 'Optimal'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : activeTab === 'orders' ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10"
            >
              <div className="lg:col-span-8 space-y-8">
                <div className="flex items-end justify-between">
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Place Orders</h2>
                    <p className="text-slate-500 mt-1">Select products from inventory to add to your order.</p>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-900/50 p-2 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-2 px-2 border-r border-slate-800">
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Sort:</span>
                      {(['name', 'stock', 'category'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setOrderSortBy(type)}
                          className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest transition-all border ${orderSortBy === type ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 'bg-slate-800/50 text-slate-500 border-slate-700/50 hover:text-slate-300'}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => setOrderSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                      className="p-1.5 bg-slate-800 rounded-lg text-slate-400 hover:text-sky-400 transition-all border border-slate-700"
                    >
                      {orderSortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sortedOrderProducts.map((product) => (
                    <div key={product.id} className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800/50 flex items-center justify-between hover:border-sky-500/30 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-xl">{product.icon}</div>
                        <div>
                          <h4 className="font-bold text-white">{product.name}</h4>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">${product.price.toFixed(2)} / {product.unit}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          const existing = cart.find(item => item.product.id === product.id);
                          if (existing) {
                            setCart(cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
                          } else {
                            setCart([...cart, { product, quantity: 1 }]);
                          }
                        }}
                        className="p-2 bg-sky-500/10 text-sky-400 rounded-xl hover:bg-sky-500 hover:text-white transition-all"
                      >
                        <ArrowUpRight className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4">
                <div className="bg-slate-900/50 rounded-3xl border border-slate-800 p-8 sticky top-32 backdrop-blur-md">
                  <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                    <ShoppingCart className="w-6 h-6 text-sky-400" />
                    Your Cart
                  </h3>

                  <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {cart.length === 0 ? (
                      <p className="text-slate-500 text-center py-10 font-bold">Your cart is empty</p>
                    ) : (
                      cart.map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{item.product.icon}</span>
                            <div>
                              <p className="text-sm font-bold text-white">{item.product.name}</p>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                {item.quantity} x ${item.product.price.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-black text-sky-400">${(item.product.price * item.quantity).toFixed(2)}</span>
                            <button 
                              onClick={() => setCart(cart.filter(c => c.product.id !== item.product.id))}
                              className="text-slate-600 hover:text-rose-400 transition-colors"
                            >
                              <Zap className="w-4 h-4 fill-current" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="border-t border-slate-800 pt-6 space-y-4">
                    <div className="flex justify-between text-slate-400">
                      <span className="text-xs font-bold uppercase tracking-widest">Subtotal</span>
                      <span className="text-sm font-bold">${cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span className="text-xs font-bold uppercase tracking-widest">Tax (5%)</span>
                      <span className="text-sm font-bold">${(cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) * 0.05).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-end pt-2">
                      <span className="text-sm font-black text-white uppercase tracking-[0.2em]">Total Amount</span>
                      <span className="text-2xl font-black text-sky-400">
                        ${(cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) * 1.05).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button 
                    disabled={cart.length === 0}
                    onClick={() => {
                      alert('Order placed successfully!');
                      setCart([]);
                    }}
                    className="w-full bg-sky-500 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] mt-8 shadow-lg shadow-sky-500/20 hover:bg-sky-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Place Order
                  </button>
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'notifications' ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight">System Notifications</h2>
                <p className="text-slate-500 mt-1">Critical alerts and operational updates.</p>
              </div>

              <div className="space-y-4">
                {totalAlerts > 0 ? (
                  <>
                    {PRODUCTS.filter(p => p.currentStock === 0).map(product => (
                      <div key={product.id} className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center text-xl">
                            {product.icon}
                          </div>
                          <div>
                            <h4 className="font-bold text-white">{product.name} is Out of Stock</h4>
                            <p className="text-sm text-slate-500">Immediate replenishment required to avoid lost sales.</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setActiveTab('orders')}
                          className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold hover:bg-rose-400 transition-all"
                        >
                          Order Now
                        </button>
                      </div>
                    ))}
                    {PRODUCTS.filter(p => p.currentStock > 0 && p.currentStock < p.minStockLevel).map(product => (
                      <div key={product.id} className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-xl">
                            {product.icon}
                          </div>
                          <div>
                            <h4 className="font-bold text-white">{product.name} is Low on Stock</h4>
                            <p className="text-sm text-slate-500">Current: {product.currentStock} {product.unit} (Min: {product.minStockLevel})</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setActiveTab('orders')}
                          className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-400 transition-all"
                        >
                          Restock
                        </button>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="bg-slate-900/50 border border-slate-800 p-12 rounded-3xl text-center">
                    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Bell className="w-8 h-8 text-slate-500" />
                    </div>
                    <h3 className="text-white font-bold text-lg">All Systems Nominal</h3>
                    <p className="text-slate-500 mt-2">No critical stock alerts at this time.</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : activeTab === 'sync' ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-10"
            >
              <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-800 shadow-2xl">
                  <RefreshCw className="w-10 h-10 text-sky-500 animate-spin-slow" />
                </div>
                <h2 className="text-3xl font-black text-white mb-4 capitalize">System Synchronization</h2>
                <p className="text-slate-400 max-w-md text-lg leading-relaxed">
                  Our neural networks are currently processing real-time data streams for the <span className="text-sky-400 font-bold">DemandSense AI</span> ecosystem. 
                  Expected synchronization complete in <span className="text-emerald-400 font-bold">~42ms</span>.
                </p>
                
                <div className="mt-12 grid grid-cols-3 gap-8 w-full max-w-2xl">
                  {[
                    { label: 'Data Integrity', value: '99.9%' },
                    { label: 'Processing', value: 'Active' },
                    { label: 'Sync Status', value: 'Encrypted' }
                  ].map((stat, i) => (
                    <div key={i} className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className="text-sm font-bold text-white">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-10"
            >
              <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center mb-8 border border-slate-800 shadow-2xl">
                  <RefreshCw className="w-10 h-10 text-sky-500 animate-spin-slow" />
                </div>
                <h2 className="text-3xl font-black text-white mb-4 capitalize">{activeTab} Intelligence</h2>
                <p className="text-slate-400 max-w-md text-lg leading-relaxed">
                  Module initialization in progress. Connecting to secure data nodes...
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Global Status Bar */}
      <footer className="fixed bottom-0 left-24 right-0 h-10 bg-[#020617] border-t border-slate-800 px-10 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] z-50">
        <div className="flex gap-8">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_4px_rgba(52,211,153,0.6)]" />
            <span>Node: AS-01-PROD</span>
          </div>
          <span>Latency: 42ms</span>
        </div>
        <div className="flex gap-8">
          <span>Model: Gemini 3.1 Flash Preview</span>
          <span>Last Training: 2026-03-09</span>
        </div>
        {/* Login Modal */}
        <AnimatePresence>
          {isLoginModalOpen && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsLoginModalOpen(false)}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl p-10"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-sky-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-sky-500/20">
                    <Zap className="w-8 h-8 text-sky-400" />
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">System Login</h2>
                  <p className="text-slate-500 mt-1">Enter your operator ID to continue.</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Operator ID</label>
                    <input 
                      type="text" 
                      placeholder="e.g. USR-4619X"
                      value={tempUserId}
                      onChange={(e) => setTempUserId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-sky-500 transition-colors"
                    />
                  </div>
                  
                  <button 
                    onClick={() => {
                      if (tempUserId.trim()) {
                        setUserId(tempUserId);
                        setIsLoggedIn(true);
                        setIsLoginModalOpen(false);
                      }
                    }}
                    className="w-full bg-sky-500 text-white py-4 rounded-xl font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-sky-500/20 hover:bg-sky-400 transition-all"
                  >
                    Authenticate
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </footer>

      {/* Report Modal */}
      <AnimatePresence>
        {isReportOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReportOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-10 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tight">Inventory & Sales Report</h2>
                  <p className="text-slate-500 mt-1 font-bold uppercase text-[10px] tracking-widest">Generated on {new Date().toLocaleDateString()} • Operator: {userId}</p>
                </div>
                <button 
                  onClick={() => setIsReportOpen(false)}
                  className="p-3 bg-slate-800 text-slate-400 rounded-2xl hover:text-white transition-colors"
                >
                  <Zap className="w-6 h-6 rotate-45" />
                </button>
              </div>

              <div className="p-10 overflow-y-auto custom-scrollbar space-y-12">
                {/* Inventory Status */}
                <section>
                  <h3 className="text-lg font-black text-white mb-6 flex items-center gap-3">
                    <Package className="w-5 h-5 text-sky-400" />
                    Current Inventory Status
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchedProducts.map(product => {
                      const isEnough = product.currentStock >= product.minStockLevel;
                      return (
                        <div key={product.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{product.icon}</span>
                            <div>
                              <p className="text-sm font-bold text-white">{product.name}</p>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Qty: {product.currentStock}</p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest ${isEnough ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {isEnough ? 'Enough' : 'Not Enough'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Sales Graphs */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <section className="bg-slate-950 p-8 rounded-3xl border border-slate-800">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      Previous Month Sales (Total)
                    </h3>
                    <div className="h-[250px] w-full">
                      <ForecastChart 
                        historical={aggregateHistoricalData} 
                        forecast={[]} 
                        dateRange={{ start: subDays(new Date(), 30), end: new Date() }}
                      />
                    </div>
                  </section>

                  <section className="bg-slate-950 p-8 rounded-3xl border border-slate-800">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-sky-400" />
                      Expected Sales Next Month (Total)
                    </h3>
                    <div className="h-[250px] w-full">
                      <ForecastChart 
                        historical={[]} 
                        forecast={aggregateForecast} 
                        dateRange={{ start: new Date(), end: addDays(new Date(), 30) }}
                      />
                    </div>
                  </section>
                </div>

                <div className="p-8 bg-sky-500/5 rounded-3xl border border-sky-500/10">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-sky-500/10 rounded-2xl">
                      <Info className="w-6 h-6 text-sky-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-black mb-2">AI Summary</h4>
                      <p className="text-slate-400 leading-relaxed text-sm">
                        Based on current inventory levels, <span className="text-amber-400 font-bold">{PRODUCTS.filter(p => p.currentStock < p.minStockLevel).length} items</span> are below their safety threshold. 
                        Next month's forecast predicts a <span className="text-emerald-400 font-bold">15% surge</span> in demand for {selectedProduct.category} items. 
                        We recommend placing replenishment orders for low-stock items immediately to avoid stockouts during the upcoming peak period.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-950/50 border-t border-slate-800 flex justify-end">
                <button 
                  onClick={() => setIsReportOpen(false)}
                  className="bg-sky-500 text-white px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-sky-500/20 hover:bg-sky-400 transition-all"
                >
                  Close Report
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
