
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { YogaSequence, YogaPose } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Utility to retry API calls in case of transient 500 errors or network hiccups.
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, delay = 1000): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      // If it's a 4xx error (other than 429), don't bother retrying as it's likely a client issue
      if (err?.status && err.status >= 400 && err.status < 500 && err.status !== 429) {
        throw err;
      }
      console.warn(`API call failed (attempt ${i + 1}/${maxRetries}). Retrying in ${delay}ms...`, err);
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
  throw lastError;
}

export const generateYogaSequence = async (userInput: string): Promise<YogaSequence> => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Upgraded to Pro for better reasoning and stability
      contents: `You are a yoga master. Create a sequence based on: "${userInput}".
      Return a professional sequence of 5-10 poses. For each pose, choose a realistic name, duration, and instructions.
      Be creative but ensure the flow is logical (warmup -> peak -> cooldown).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            poses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "A unique slug for the pose" },
                  name: { type: Type.STRING },
                  category: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  description: { type: Type.STRING },
                  benefits: { type: Type.STRING },
                  breathingGuidance: { type: Type.STRING }
                },
                required: ["id", "name", "category", "duration", "description", "benefits", "breathingGuidance"]
              }
            }
          },
          required: ["title", "description", "poses"]
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as YogaSequence;
  });
};

export interface PracticeGuidance {
  script: string;
  audioBase64: string;
}

export const generateYogaAudio = async (title: string, poses: YogaPose[]): Promise<PracticeGuidance> => {
  // Step 1: Generate script text
  const narrativeScript = await withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a professional yoga instructor. Write a cohesive, soothing guided script for a session titled "${title}". 
      Do not include any metadata, speaker labels, or formatting like asterisks. Just the spoken words.
      Include these poses in order:
      ${poses.map((p, i) => `${i + 1}. ${p.name} (${p.duration}). Breathing: ${p.breathingGuidance}. Focus: ${p.description}`).join('\n')}
      
      The script should start with a gentle welcome and end with "Namaste".`,
    });
    const text = response.text;
    if (!text) throw new Error("Failed to generate practice script text");
    return text;
  });

  // Step 2: Convert to Audio
  const audioBase64 = await withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: narrativeScript }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    const base64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64) throw new Error("TTS model failed to generate audio");
    return base64;
  });

  return {
    script: narrativeScript,
    audioBase64
  };
};
