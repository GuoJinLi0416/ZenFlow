
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { YogaSequence, YogaPose } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, delay = 1000): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      if (err?.status && err.status >= 400 && err.status < 500 && err.status !== 429) {
        throw err;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; 
    }
  }
  throw lastError;
}

export const generateYogaSequence = async (userInput: string): Promise<YogaSequence> => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `You are a yoga anatomical sequencing expert. Create a safe flow based on: "${userInput}".
      Return a sequence of 5-10 poses. 
      Rules for Anatomical Sequencing:
      1. Warmup: Start with low-intensity 'Beginner' poses (intensity 1-3).
      2. Progression: Gradually increase intensity.
      3. Peak: Save 'Advanced' poses for the middle-end.
      4. Cooldown: End with restorative 'Supine' or 'Seated' poses.
      
      For each pose, provide an 'intensity' (1-10) and 'difficulty' ('Beginner', 'Intermediate', 'Advanced').`,
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
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  category: { type: Type.STRING },
                  difficulty: { type: Type.STRING },
                  intensity: { type: Type.NUMBER },
                  duration: { type: Type.STRING },
                  description: { type: Type.STRING },
                  benefits: { type: Type.STRING },
                  breathingGuidance: { type: Type.STRING },
                  imagePrompt: { type: Type.STRING }
                },
                required: ["id", "name", "category", "difficulty", "intensity", "duration", "description", "benefits", "breathingGuidance", "imagePrompt"]
              }
            }
          },
          required: ["title", "description", "poses"]
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  });
};

export const generatePoseImage = async (imagePrompt: string): Promise<string> => {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `${imagePrompt}. Professional yoga instructional illustration style, white background, soft lighting.` }]
      },
      config: { imageConfig: { aspectRatio: "4:3" } }
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("No image data");
  });
};

export interface PracticeGuidance {
  script: string;
  audioBase64: string;
}

export const generateYogaAudio = async (title: string, poses: YogaPose[]): Promise<PracticeGuidance> => {
  const narrativeScript = await withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a soothing yoga script for session "${title}". Only spoken words. Namaste at end.`,
    });
    return response.text || "";
  });

  const audioBase64 = await withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: narrativeScript }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
  });

  return { script: narrativeScript, audioBase64 };
};
