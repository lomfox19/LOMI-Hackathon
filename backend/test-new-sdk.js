const { GoogleGenAI } = require("@google/genai");
require('dotenv').config();

async function test() {
    const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    try {
        const response = await client.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: [{ role: 'user', parts: [{ text: 'Explain AI in one sentence.' }] }]
        });
        console.log("SUCCESS:", JSON.stringify(response));
    } catch (e) {
        console.error("ERROR:", e.message);
    }
}

test();
