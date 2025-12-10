import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const streamCountryInfo = async (
  countryName: string,
  onChunk: (text: string) => void
): Promise<void> => {
  if (!apiKey) {
    onChunk("Error: API Key is missing. Please configure the environment variable.");
    return;
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      Provide a concise summary for the country "${countryName}" in the context of the "Child Marriage Free World" campaign.
      Include:
      1. One short sentence describing its location.
      2. Two general cultural facts.
      3. A brief, respectful note on the importance of child rights or education in this region (if applicable, or just a general positive fact).
      
      Format with Markdown. Keep it under 150 words total.
    `;

    const result = await ai.models.generateContentStream({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        maxOutputTokens: 300,
        temperature: 0.7,
      }
    });

    for await (const chunk of result) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error("Gemini Error:", error);
    onChunk("\n\n(Sorry, I encountered an error fetching data about this country.)");
  }
};

export const streamActivityInfo = async (
  activityTitle: string,
  description: string,
  onChunk: (text: string) => void
): Promise<void> => {
  if (!apiKey) {
    onChunk("Error: API Key is missing.");
    return;
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      You are a Campaign Coordinator for 'Child Marriage Free World'.
      Write an inspiring update for the activity: "${activityTitle}".
      
      Context: ${description}.
      
      Please provide:
      1. An empowering update title.
      2. A paragraph describing the impact of this action on children's rights and the local community.
      3. A "Call to Action" encouraging others to take the pledge or learn more.
      
      Format with Markdown. Keep it under 200 words. Be professional, passionate, and advocacy-focused.
    `;

    const result = await ai.models.generateContentStream({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        maxOutputTokens: 400,
        temperature: 0.7,
      }
    });

    for await (const chunk of result) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error("Gemini Error:", error);
    onChunk("\n\n(Unable to retrieve campaign details at this time.)");
  }
};