const Groq = require("groq-sdk");
const dotenv = require('dotenv');
dotenv.config();

/**
 * AI Analysis Service using Groq AI
 */
class AiAnalysisService {
    constructor() {
        const apiKey = process.env.GROQ_API_KEY?.trim();
        
        if (!apiKey) {
            console.error("❌ GROQ_API_KEY is missing in environment variables.");
        }
        
        try {
            console.log("Groq key loaded:", !!process.env.GROQ_API_KEY);
            this.groq = new Groq({
                apiKey: apiKey || 'DUMMY_KEY'
            });
            // Using llama-3.1-8b-instant for high-quality intelligence analysis
            this.model = "llama-3.1-8b-instant";
        } catch (error) {
            console.error("Failed to initialize Groq Client:", error);
            throw error;
        }
    }

    /**
     * Analyze a list of feedback texts using Groq AI
     * @param {string[]} feedbackList 
     */
    async analyzeFeedback(feedbackList) {
        try {
            if (!feedbackList || feedbackList.length === 0) {
                return null;
            }

            console.log("Sending feedback to Groq AI...");
            
            const prompt = `
                You are an AI business intelligence assistant for a Customer Feedback Analytics Platform.
                Your job is to analyze customer reviews and extract meaningful insights for businesses.

                Analyze the following customer feedback dataset meticulously and generate structured insights.

                Provide the analysis in JSON format with the following sections:
                1. "sentiment_distribution": { "positive": percentage, "neutral": percentage, "negative": percentage } (total must be 100).
                2. "top_customer_issues": Array of the most common complaints mentioned by customers.
                3. "positive_feedback_themes": Array of common positive experiences customers mention.
                4. "business_risks": Array of potential risks or recurring problems.
                5. "business_recommendations": Array of clear recommendations for improving customer experience.
                6. "strategic_insights": Array of long-term improvements businesses should consider.
                7. "summary": A short executive summary explaining what the feedback reveals.
                8. "keywords": Array of 10-12 most significant industry-specific keywords.

                Dataset:
                ${feedbackList.map((text, i) => `${i + 1}. "${text}"`).join("\n")}

                Output EXACTLY and ONLY a valid JSON object. Do not include markdown formatting or extra text.
            `;

            const completion = await this.groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are an AI business intelligence assistant that analyzes customer feedback. You must output results in EXACT JSON format."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                model: this.model,
                response_format: { type: "json_object" }
            });

            console.log("Groq response received:", JSON.stringify(completion.choices[0]?.message?.content).substring(0, 100) + "...");
            const text = completion.choices[0]?.message?.content;

            if (!text) {
                throw new Error("Empty response from Groq AI");
            }

            return JSON.parse(text);
        } catch (error) {
            console.error("Groq AI Analysis Error:", error);
            throw error;
        }
    }

    /**
     * Generate a full business intelligence report using Groq AI
     * @param {string[]} feedbackList 
     * @param {Object} analyticsSummary
     */
    async generateInsightReport(feedbackList, analyticsSummary) {
        try {
            console.log("Sending feedback to Groq AI for full intelligence report...");
            
            const prompt = `
                You are the Chief Intelligence Officer. Generate a professional Strategic Business Intelligence Report based on the following verified customer feedback aggregates.
                
                Data Context:
                - Total Feedback Samples: ${analyticsSummary.totalFeedback}
                - Sentiment Breakdown: Positive ${analyticsSummary.sentimentCounts.positive}, Neutral ${analyticsSummary.sentimentCounts.neutral}, Negative ${analyticsSummary.sentimentCounts.negative}
                - Core Topics Identified: ${analyticsSummary.topTopics.map(t => t.name).join(", ")}

                Sample Raw Voices:
                ${feedbackList.slice(0, 25).map((text, i) => `${i + 1}. "${text}"`).join("\n")}

                Return a structured JSON object with EXACTLY these keys:
                1. "executiveSummary": A high-level overview of brand perception, major wins, and critical friction points.
                2. "keyBusinessProblems": Array of 3-5 structural or operational problems impacting the bottom line.
                3. "businessRecommendations": Array of 3-5 immediate tactical recommendations to improve retention.
                4. "futureStrategy": Array of 5 strategic roadmap suggestions to leverage positive themes and mitigate long-term risks.

                Output ONLY the JSON object.
            `;

            const completion = await this.groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are an AI business intelligence lead. You provide high-level strategic reports based on data. Output only JSON."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                model: this.model,
                response_format: { type: "json_object" }
            });

            const text = completion.choices[0]?.message?.content;
            console.log("Groq intelligence report received");

            if (!text) throw new Error("Empty report response from Groq AI");

            return JSON.parse(text);
        } catch (error) {
            console.error("Groq AI Report Generation Error:", error);
            
            // Fallback: Maintain stable dashboard experience if AI fails
            return {
                executiveSummary: "Strategic intelligence synthesis is currently unavailable. Statistical overview shows consistent customer interaction across the dataset.",
                keyBusinessProblems: [
                    "Intelligence engine rate limit or timeout",
                    "Safety filters active on source data",
                    "High volume data processing latency"
                ],
                businessRecommendations: [
                    "Review negative sentiment clusters manually",
                    "Optimize data batching for AI processing",
                    "Verify connectivity with Groq intelligence cloud"
                ],
                futureStrategy: [
                    "Scale intelligence nodes for larger datasets",
                    "Implement localized sentiment fallback",
                    "Enhance data pre-processing pipelines"
                ],
                isFallback: true
            };
        }
    }
}

module.exports = new AiAnalysisService();
