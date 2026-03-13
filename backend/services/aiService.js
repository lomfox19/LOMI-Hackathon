const Groq = require("groq-sdk");
const dotenv = require('dotenv');
dotenv.config();

const AI_API_KEY = process.env.GROQ_API_KEY || '';
const groq = AI_API_KEY ? new Groq({ apiKey: AI_API_KEY }) : null;

const ensureConfigured = () => {
  if (!AI_API_KEY) {
    return false;
  }
  return true;
};

/**
 * Core chat interface used by chatbot modules
 */
async function chatWithAssistant({ userId, message, context = {} }) {
  const isConfigured = ensureConfigured();

  if (!isConfigured) {
    return {
      provider: 'stub',
      message: 'AI intelligence is not fully configured. Please provide the GROQ_API_KEY to enable the VeriFeedback Intelligence Assistant.',
    };
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are the VeriFeedback Intelligence Assistant, an expert in customer feedback analysis and business growth."
        },
        {
          role: "user",
          content: message
        }
      ],
      model: "llama3-8b-8192",
    });

    return {
      provider: 'groq',
      message: completion.choices[0]?.message?.content || "No response received."
    };
  } catch (err) {
    console.error("Groq Chat Error:", err);
    return {
      provider: 'groq',
      message: "I encountered an error. Please try again later."
    };
  }
}

/**
 * Simplified feedback analysis interface
 */
async function analyzeSymptoms({ userId, symptoms, age, gender, notes }) {
  const isConfigured = ensureConfigured();

  if (!isConfigured) {
    return {
      provider: 'stub',
      summary: 'System is running in limited mode. Connect Groq for full intelligence.',
      riskLevel: 'unknown',
      recommendations: [
        'VeriFeedback Intelligence Hub is currently awaiting API configuration.',
      ],
      echo: { symptoms, age, gender, notes },
    };
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a business intelligence assistant analyzing customer feedback patterns."
        },
        {
          role: "user",
          content: `Analyze this feedback entry: ${symptoms}. Context: ${notes}`
        }
      ],
      model: "llama3-8b-8192",
    });

    return {
      provider: 'groq',
      summary: completion.choices[0]?.message?.content || "Analysis complete.",
      riskLevel: 'monitored',
      recommendations: [],
      echo: { symptoms, age, gender, notes },
    };
  } catch (err) {
    console.error("Groq Analysis Error:", err);
    return {
      provider: 'groq',
      summary: "Intelligence process interrupted.",
      riskLevel: 'unknown',
      recommendations: [],
      echo: { symptoms, age, gender, notes },
    };
  }
}

module.exports = {
  chatWithAssistant,
  analyzeSymptoms,
};
