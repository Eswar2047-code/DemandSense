/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  currentStock: number;
  minStockLevel: number;
  unit: string;
  icon?: string;
}

export interface SalesData {
  date: string;
  sales: number;
  promotion: boolean;
  holiday: boolean;
}

export interface ForecastPoint {
  date: string;
  predictedSales: number;
  confidenceInterval: [number, number];
  factors: {
    seasonal: number;
    promotional: number;
    trend: number;
  };
}

export interface AIInsight {
  title: string;
  description: string;
  type: 'warning' | 'opportunity' | 'info';
}
