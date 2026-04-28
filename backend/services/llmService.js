const { GoogleGenAI } = require('@google/genai');
const Groq = require('groq-sdk');

// Ensure you have API keys in your .env file
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

const summarizeSnippet = async (code, language) => {
    if (!process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY) {
        throw new Error("No AI API keys are configured.");
    }

    const prompt = `You are an expert developer. Please summarize the following ${language} code snippet. 
Keep it concise (2-3 sentences). Explain what it does, and mention any key dependencies or inputs/outputs if obvious.

Code:
\`\`\`${language}
${code}
\`\`\`
`;

    // Strategy: Try Groq first (fastest, generous limits), fallback to Gemini
    if (groq) {
        try {
            const chatCompletion = await groq.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.5,
                max_tokens: 150,
            });
            return chatCompletion.choices[0]?.message?.content || "";
        } catch (error) {
            console.warn("Groq API failed, falling back to Gemini:", error.message);
            // Fallback continues below
        }
    }

    if (process.env.GEMINI_API_KEY) {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            return response.text;
        } catch (error) {
            console.error("Gemini API failed:", error.message);
            throw new Error("Failed to generate summary from both Groq and Gemini APIs.");
        }
    }

    throw new Error("Failed to generate summary. Ensure API keys are correct.");
};

module.exports = { summarizeSnippet };
