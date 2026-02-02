
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini with the API Key from environment variables.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Uses Gemini 3 Flash to polish user text into a more engaging format.
 */
export const polishText = async (text: string): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a social media manager for a friendly club. 
      Rewrite this post to be more engaging, clear, and professional while keeping the original intent. 
      Do not add extra meta-commentary, just return the polished text.
      
      Text: "${text}"`,
    });
    return response.text?.trim() || text;
  } catch (error) {
    console.error("Gemini text polish error:", error);
    throw error;
  }
};
