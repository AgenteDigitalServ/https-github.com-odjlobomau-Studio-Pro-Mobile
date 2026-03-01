
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeAudioEnvironment(base64AudioSnippet: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'audio/webm',
              data: base64AudioSnippet,
            },
          },
          {
            text: "Analise este snippet de áudio de locução. Identifique o nível de ruído de fundo, a qualidade acústica do ambiente (reverberação) e sugira parâmetros técnicos para: 1. Noise Gate (Threshold em dB), 2. Compressor (Ratio e Threshold), 3. EQ (Frequências para limpar). Responda em JSON.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            noiseLevel: { type: Type.STRING },
            acoustics: { type: Type.STRING },
            suggestions: {
              type: Type.OBJECT,
              properties: {
                gateThreshold: { type: Type.NUMBER },
                compThreshold: { type: Type.NUMBER },
                compRatio: { type: Type.STRING },
                eqCleansing: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["gateThreshold", "compThreshold", "compRatio", "eqCleansing"]
            }
          },
          required: ["noiseLevel", "acoustics", "suggestions"]
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return null;
  }
}
