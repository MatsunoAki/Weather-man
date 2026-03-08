import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from 'axios'; // We'll use this for the Groq backup

// 1. Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// 2. Backup Logic (Groq is excellent for this)
const fetchGroqAdvice = async (prompt: string) => {
    try {
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: prompt }]
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data.choices[0].message.content;
    } catch (err) {
        console.error("Groq also failed! Using hardcoded fallback.");
        return "Stay safe and check the local news for weather updates!";
    }
};

// 3. The Main Switcher Function
export const getAiWeatherAdvice = async (temp: number, city: string, timeframe: string) => {
    const prompt = `Give a 1-sentence weather advice for ${city}. Current temp is ${temp}°C. It is ${timeframe}. Mention what to wear or bring.`;

    try {
        // --- PRIMARY: TRY GEMINI ---
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        return response.text();

    } catch (error: any) {
        // --- DETECTION: CHECK FOR QUOTA ERROR ---
        const isQuotaError = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota');

        if (isQuotaError) {
            console.warn("Gemini Quota Exceeded. Switching to Backup (Groq)...");
            return await fetchGroqAdvice(prompt);
        }

        console.error("An unknown error occurred with Gemini:", error.message);
        return "Weather looks unpredictable; keep an umbrella handy just in case!";
    }
};