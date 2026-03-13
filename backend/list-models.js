const { GoogleGenAI } = require("@google/genai");
require('dotenv').config();

async function test() {
    const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    try {
        const response = await client.models.list();
        // The response might be a paginated list
        const models = response.pageInternal || response || [];
        console.log("AVAILABLE MODELS:");
        models.forEach(m => console.log("- " + (m.name || m)));
    } catch (e) {
        console.error("ERROR:", e.message);
    }
}

test();
