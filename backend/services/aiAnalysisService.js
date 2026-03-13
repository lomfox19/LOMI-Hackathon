const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config();

/**
 * AI Analysis Service using Gemini API
 */
class AiAnalysisService {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY?.trim();
        
        if (!apiKey) {
            console.error("❌ GEMINI_API_KEY is missing in environment variables.");
        }
        
        try {
            this.genAI = new GoogleGenerativeAI(apiKey || 'DUMMY_KEY');
            this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        } catch (error) {
            console.error("Failed to initialize Gemini Client:", error);
            throw error;
        }
    }

    /**
     * Analyze a list of feedback texts using Gemini
     * @param {string[]} feedbackList 
     */
    async analyzeFeedback(feedbackList) {
        try {
            if (!feedbackList || feedbackList.length === 0) {
                return null;
            }

            const prompt = `
                Perform a comprehensive NLP analysis on the following customer feedback entries. 
                Return a structured JSON object containing:
                1. "sentiment_summary": An object with "positive", "negative", and "neutral" percentages (totaling 100).
                2. "top_topics": An array of the top 3-5 detected topics/issues (e.g., "delivery delay").
                3. "insight_summary": A concise business insight summarizing the general mood and main points.
                4. "recommendation": A specific business action to improve customer satisfaction.
                5. "keywords": An array of the most significant 8-12 keywords extracted from the text.

                Feedback Entries:
                ${feedbackList.map((text, i) => `${i + 1}. "${text}"`).join("\n")}

                Output EXACTLY and ONLY the JSON object.
            `;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Extract JSON from the response (sometimes Gemini wraps JSON in markdown blocks)
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error("Failed to extract JSON from AI response");
            }

            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.error("AI Analysis Error:", error);
            throw error;
        }
    }

    /**
     * Generate a full business intelligence report
     * @param {string[]} feedbackList 
     * @param {Object} analyticsSummary
     */
    async generateInsightReport(feedbackList, analyticsSummary) {
        try {
            const prompt = `
                Generate a professional Business Intelligence Report based on the following customer feedback data and analytics.
                
                Data Summary:
                - Total Feedback: ${analyticsSummary.totalFeedback}
                - Sentiment Breakdown: Positive ${analyticsSummary.sentimentCounts.positive}, Neutral ${analyticsSummary.sentimentCounts.neutral}, Negative ${analyticsSummary.sentimentCounts.negative}
                - Top Topics: ${analyticsSummary.topTopics.map(t => t.name).join(", ")}

                Feedback Samples:
                ${feedbackList.slice(0, 20).map((text, i) => `${i + 1}. "${text}"`).join("\n")}

                Return a structured JSON object with EXACTLY these keys:
                1. "executiveSummary": A paragraph summarizing the overall customer mood and main feedback themes.
                2. "keyBusinessProblems": An array of 3-5 major pain points identified.
                3. "businessRecommendations": An array of 3-5 actionable steps for the business.
                4. "futureStrategy": An array of 3-5 long-term strategic growth suggestions.

                Output ONLY the JSON object.
            `;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean the response text (remove markdown code blocks if present)
            const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
            
            if (!jsonMatch) throw new Error("Failed to extract JSON from AI response");

            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.error("AI Report Generation Error:", error);
            
            // Fallback: Return a structured mock report if AI fails
            return {
                executiveSummary: "Due to high safety filtering or technical limitations, a detailed AI summary could not be generated at this time. However, statistical analysis shows active customer engagement.",
                keyBusinessProblems: [
                    "Data processing limitations detected",
                    "Safety filters blocked specific feedback analysis",
                    "Check source datasets for anomalies"
                ],
                businessRecommendations: [
                    "Review raw feedback manually for sensitive content",
                    "Verify Gemini API quota and availability",
                    "Try subdividing the dataset for processing"
                ],
                futureStrategy: [
                    "Implement multi-layer data sanitization",
                    "Scale intelligence processing batches",
                    "Enable localized NLP fallback models"
                ],
                isFallback: true
            };
        }
    }
}

module.exports = new AiAnalysisService();
