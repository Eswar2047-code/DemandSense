import { Product, SalesData } from './types';

export const PRODUCTS: Product[] = [
  { id: '1', name: 'Organic Milk 1L', category: 'Dairy', price: 3.50, currentStock: 45, minStockLevel: 20, unit: 'units', icon: '🥛' },
  { id: '2', name: 'Whole Wheat Bread', category: 'Bakery', price: 2.20, currentStock: 12, minStockLevel: 15, unit: 'units', icon: '🍞' },
  { id: '3', name: 'Avocados (Pack of 3)', category: 'Produce', price: 5.00, currentStock: 30, minStockLevel: 10, unit: 'packs', icon: '🥑' },
  { id: '4', name: 'Greek Yogurt 500g', category: 'Dairy', price: 4.50, currentStock: 25, minStockLevel: 15, unit: 'units', icon: '🍦' },
  { id: '5', name: 'Sparkling Water 6-pack', category: 'Beverages', price: 6.00, currentStock: 50, minStockLevel: 20, unit: 'packs', icon: '🥤' },
  { id: '6', name: 'Cheddar Cheese 200g', category: 'Dairy', price: 4.00, currentStock: 18, minStockLevel: 10, unit: 'units', icon: '🧀' },
  { id: '7', name: 'Croissants (4-pack)', category: 'Bakery', price: 5.50, currentStock: 8, minStockLevel: 12, unit: 'packs', icon: '🥐' },
  { id: '8', name: 'Organic Bananas', category: 'Produce', price: 1.50, currentStock: 60, minStockLevel: 20, unit: 'kg', icon: '🍌' },
  { id: '9', name: 'Cold Brew Coffee', category: 'Beverages', price: 4.90, currentStock: 15, minStockLevel: 10, unit: 'bottles', icon: '☕' },
  { id: '10', name: 'Almond Milk 1L', category: 'Dairy', price: 3.80, currentStock: 22, minStockLevel: 15, unit: 'units', icon: '🥛' },
  { id: '11', name: 'Free Range Eggs (12)', category: 'Dairy', price: 4.20, currentStock: 35, minStockLevel: 15, unit: 'packs', icon: '🥚' },
  { id: '12', name: 'Organic Spinach 200g', category: 'Produce', price: 2.50, currentStock: 15, minStockLevel: 10, unit: 'bags', icon: '🥬' },
  { id: '13', name: 'Blueberries 125g', category: 'Produce', price: 3.00, currentStock: 40, minStockLevel: 12, unit: 'punnets', icon: '🫐' },
  { id: '14', name: 'Orange Juice 1L', category: 'Beverages', price: 3.20, currentStock: 28, minStockLevel: 15, unit: 'units', icon: '🍊' },
  { id: '15', name: 'Sourdough Loaf', category: 'Bakery', price: 4.50, currentStock: 10, minStockLevel: 8, unit: 'units', icon: '🥖' },
  { id: '16', name: 'Oat Milk 1L', category: 'Dairy', price: 3.60, currentStock: 18, minStockLevel: 12, unit: 'units', icon: '🥛' },
  { id: '17', name: 'Red Apples (1kg)', category: 'Produce', price: 2.80, currentStock: 55, minStockLevel: 20, unit: 'kg', icon: '🍎' },
  { id: '18', name: 'Green Tea (20 bags)', category: 'Beverages', price: 3.50, currentStock: 32, minStockLevel: 10, unit: 'boxes', icon: '🍵' },
  { id: '19', name: 'Bagels (5-pack)', category: 'Bakery', price: 3.80, currentStock: 14, minStockLevel: 10, unit: 'packs', icon: '🥯' },
  { id: '20', name: 'Hummus 200g', category: 'Dairy', price: 2.90, currentStock: 20, minStockLevel: 10, unit: 'units', icon: '🥣' },
];

// Generate some mock historical data for the last 30 days
export const generateHistoricalData = (productId: string): SalesData[] => {
  const data: SalesData[] = [];
  const now = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Base sales + some randomness
    let sales = 10 + Math.floor(Math.random() * 15);
    
    // Weekend boost
    const day = date.getDay();
    if (day === 0 || day === 6) sales += 10;
    
    // Simulated promotion on some days
    const isPromotion = i % 10 === 0;
    if (isPromotion) sales *= 1.5;

    data.push({
      date: date.toISOString().split('T')[0],
      sales: Math.round(sales),
      promotion: isPromotion,
      holiday: false,
    });
  }
  return data;
};

export const generateAggregateHistoricalData = (): SalesData[] => {
  const aggregateData: { [date: string]: number } = {};
  const now = new Date();

  PRODUCTS.forEach(product => {
    const productData = generateHistoricalData(product.id);
    productData.forEach(d => {
      aggregateData[d.date] = (aggregateData[d.date] || 0) + d.sales;
    });
  });

  return Object.entries(aggregateData)
    .map(([date, sales]) => ({
      date,
      sales,
      promotion: false,
      holiday: false
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};
