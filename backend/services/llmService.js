const { GoogleGenAI } = require('@google/genai');

// Ensure you have GEMINI_API_KEY in your .env file
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const summarizeSnippet = async (code, language) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured.");
    }

    try {
        const prompt = `You are an expert developer. Please summarize the following ${language} code snippet. 
Keep it concise (2-3 sentences). Explain what it does, and mention any key dependencies or inputs/outputs if obvious.

Code:
\`\`\`${language}
${code}
\`\`\`
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("LLM Summarization Error:", error);
        throw new Error("Failed to generate summary from AI.");
    }
};

module.exports = { summarizeSnippet };
