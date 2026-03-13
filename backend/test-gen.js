const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        // Note: listModels is not directly on genAI usually, but let's try to find it or check docs
        // Actually, there is no direct listModels in the SDK usually.
        // But we can try a simple generation to see if it works.
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hi");
        console.log("SUCCESS:", result.response.text());
    } catch (e) {
        console.error("ERROR:", e.message);
    }
}

listModels();
