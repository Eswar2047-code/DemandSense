import { GoogleGenAI } from "@google/genai";
import { Product, SalesData, ForecastPoint } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getAIAnalysis(
  product: Product,
  historicalData: SalesData[],
  forecast: ForecastPoint[]
) {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    As a retail demand analyst, analyze the following data for "${product.name}" (${product.category}).
    
    Current Inventory: ${product.currentStock} ${product.unit}
    Minimum Stock Level: ${product.minStockLevel} ${product.unit}
    
    Historical Sales (Last 7 days): ${JSON.stringify(historicalData.slice(-7))}
    Forecasted Demand (Next 7 days): ${JSON.stringify(forecast)}
    
    Please provide:
    1. A summary of the demand trend.
    2. Specific advice on inventory (restock now? wait?).
    3. Explanation of how seasonal or promotional factors are influencing this specific product.
    
    Return the response in a structured format with clear headings.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return "Unable to generate AI analysis at this time.";
  }
}
