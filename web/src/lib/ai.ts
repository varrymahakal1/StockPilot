import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn('Missing VITE_GEMINI_API_KEY');
}

const genAI = new GoogleGenerativeAI(apiKey);
// Using gemini-2.5-flash as listed in available models
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const startBusinessChat = (context: string) => {
  return model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: `You are Stockpilot AI, a dedicated business assistant for this retail business. 
Here is the real-time business data snapshot:
${context}

Your instructions:
1. Answer questions based on this specific data.
2. If the user asks for advice, provide actionable steps.
3. You can use your general knowledge for market trends or business strategies.
4. Be professional, encouraging, and concise.
5. If you need to search the web for external info, assume you have general knowledge up to your training cutoff, but prioritize the provided internal data.` }],
      },
      {
        role: "model",
        parts: [{ text: "Hello! I've analyzed your latest sales, inventory, and expenses. I'm ready to help you optimize your business. What would you like to know?" }],
      },
    ],
  });
};

export const generateInsight = async (context: string) => {
    // Legacy support if needed, or re-route to chat
    const chat = startBusinessChat(context);
    const result = await chat.sendMessage("Give me a quick executive summary of my business health.");
    return result.response.text();
};
