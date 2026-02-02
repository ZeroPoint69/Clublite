
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

/**
 * Uses Gemini 2.5 Flash Image to generate a custom image based on a prompt.
 * Returns a base64 data URL.
 */
export const generateClubImage = async (prompt: string): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A high-quality, professional photo for a club social media post showing: ${prompt}. The style should be modern, vibrant, and welcoming.` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    // Find the image part in the response
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned from Gemini");
  } catch (error) {
    console.error("Gemini image generation error:", error);
    throw error;
  }
};
