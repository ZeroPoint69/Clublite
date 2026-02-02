
import { GoogleGenAI } from "@google/genai";

// Use the Gemini API to polish text for better engagement and clarity.
export const polishText = async (text: string): Promise<string> => {
  // Initialize the Gemini client exactly as specified in the rules using the direct process.env.API_KEY.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an editor for a friendly social club app. Rewrite the following text to be more engaging, clear, and polite, but keep the original meaning. Do not add quotation marks or conversational filler. Just return the polished text.
      
      Text to polish: "${text}"`,
    });
    // Use the .text property directly as it returns the generated string output.
    return response.text?.trim() || text;
  } catch (error) {
    console.error("Gemini polish error:", error);
    throw error;
  }
};
