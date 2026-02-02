import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const polishText = async (text: string): Promise<string> => {
  const ai = getClient();
  if (!ai) throw new Error("API Key not found");

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an editor for a friendly social club app. Rewrite the following text to be more engaging, clear, and polite, but keep the original meaning. Do not add quotation marks or conversational filler. Just return the polished text.
      
      Text to polish: "${text}"`,
    });
    return response.text?.trim() || text;
  } catch (error) {
    console.error("Gemini polish error:", error);
    throw error;
  }
};
