// Centralized AI service layer for all AI-related features.
// This is intentionally provider-agnostic and reads configuration
// from environment variables so new tools can plug in easily.

const axios = require('axios');

const AI_PROVIDER = process.env.AI_PROVIDER || 'stub';
const AI_API_KEY = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || '';

const ensureConfigured = () => {
  if (AI_PROVIDER === 'stub' || !AI_API_KEY) {
    // For now we keep a graceful stub that does not call
    // any external provider until Shailesh provides an API key.
    return false;
  }
  return true;
};

// Core chat interface used by chatbot and other conversational tools
async function chatWithAssistant({ userId, message, context = {} }) {
  const isConfigured = ensureConfigured();

  if (!isConfigured) {
    return {
      provider: 'stub',
      message:
        'AI service is not fully configured yet. Shailesh, please provide the required API key so the real medical AI assistant can be enabled.',
    };
  }

  // Placeholder for real provider integration
  // Example structure (not active until configured):
  //
  // const response = await axios.post(
  //   'https://api.your-ai-provider.com/chat',
  //   { message, context },
  //   { headers: { Authorization: `Bearer ${AI_API_KEY}` } }
  // );
  //
  // return response.data;

  return {
    provider: AI_PROVIDER,
    message:
      'AI provider is marked as configured, but no concrete integration has been implemented yet.',
  };
}

// Structured medical symptom analysis interface
async function analyzeSymptoms({ userId, symptoms, age, gender, notes }) {
  const isConfigured = ensureConfigured();

  if (!isConfigured) {
    return {
      provider: 'stub',
      summary:
        'This is a placeholder analysis. Shailesh, please connect a real medical AI service by providing an API key.',
      riskLevel: 'unknown',
      recommendations: [
        'This system is currently running in demo mode without real medical AI.',
        'For any urgent or serious symptoms, contact a licensed medical professional immediately.',
      ],
      echo: { symptoms, age, gender, notes },
    };
  }

  // Placeholder structure for real integration
  // const response = await axios.post(
  //   'https://api.your-ai-provider.com/medical/analyze',
  //   { symptoms, age, gender, notes },
  //   { headers: { Authorization: `Bearer ${AI_API_KEY}` } }
  // );
  //
  // return response.data;

  return {
    provider: AI_PROVIDER,
    summary:
      'AI provider is marked as configured, but symptom analysis integration is not implemented yet.',
    riskLevel: 'unknown',
    recommendations: [],
    echo: { symptoms, age, gender, notes },
  };
}

// This module is intentionally small and composable so that
// future AI tools (imaging, report generators, etc.) can add
// new functions here without touching existing ones.

module.exports = {
  chatWithAssistant,
  analyzeSymptoms,
};

