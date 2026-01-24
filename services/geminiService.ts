
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Google GenAI SDK with the API key from environment variables
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseOrderText = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Extract the customer name, phone, and address from this text. Format it cleanly as a structured note. Text: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            phone: { type: Type.STRING },
            address: { type: Type.STRING },
            cleanNote: { type: Type.STRING, description: "A summary of the order details" }
          },
          required: ["name", "phone", "address", "cleanNote"]
        }
      }
    });

    // response.text is a property that returns the generated text
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    return null;
  }
};
