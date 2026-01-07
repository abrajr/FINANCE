
import { GoogleGenAI, Type } from "@google/genai";
import { Series, GenerationResult } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateContentIdeas = async (contextSeries: Series): Promise<GenerationResult> => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Você é um estrategista de conteúdo para o canal "Finanças Pessoais e Investimentos".
    Baseado no estilo da série atual: "${contextSeries.title}", crie 3 novas ideias de séries virais.
    
    ESTILO ATUAL:
    ${contextSeries.episodes.map(ep => `- ${ep.title}: ${ep.hook}`).join('\n')}
    
    REGRAS:
    1. Mantenha o tom dramático e educativo.
    2. Cada série deve ter entre 5 a 10 episódios.
    3. Cada episódio deve conter: Título, Hook (gancho inicial), Narrativa, Cena-chave e Lição Moderna.
    4. O conteúdo deve ser em Português do Brasil.
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          newSeries: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                episodes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      hook: { type: Type.STRING },
                      narrative: { type: Type.STRING },
                      keyScene: { type: Type.STRING },
                      modernLesson: { type: Type.STRING }
                    },
                    required: ["title", "hook", "narrative", "keyScene", "modernLesson"]
                  }
                }
              },
              required: ["title", "description", "episodes"]
            }
          }
        },
        required: ["newSeries"]
      }
    }
  });

  return JSON.parse(response.text || '{"newSeries": []}');
};
