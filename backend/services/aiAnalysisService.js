const Groq = require("groq-sdk");
const { spawn } = require("child_process");
const path = require("path");
const dotenv = require('dotenv');
dotenv.config();

/** Path to local NLP engine (Python). Used when Groq fails or quota exceeded. */
const NLP_ENGINE_DIR = path.resolve(__dirname, "..", "nlp_engine");
const NLP_ENGINE_SCRIPT = path.join(NLP_ENGINE_DIR, "engine.py");

/**
 * AI Analysis Service: Groq AI primary, local NLP fallback.
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
     * Run local Python NLP engine. Returns same shape as Groq for dashboard/analytics.
     * @param {string[]} feedbackList - capped to 50 inside engine; pass latest 50 here for consistency
     */
    _runLocalNlp(feedbackList) {
        return new Promise((resolve, reject) => {
            const pythonCmd = process.env.PYTHON_PATH || "python";
            const proc = spawn(pythonCmd, [NLP_ENGINE_SCRIPT], {
                cwd: NLP_ENGINE_DIR,
                stdio: ["pipe", "pipe", "pipe"],
            });
            const input = JSON.stringify({ feedback_list: feedbackList });
            proc.stdin.write(input, "utf8");
            proc.stdin.end();
            let stdout = "";
            let stderr = "";
            proc.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
            proc.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
            proc.on("close", (code) => {
                if (code !== 0) {
                    return reject(new Error(stderr || `Local NLP exited with code ${code}`));
                }
                try {
                    const result = JSON.parse(stdout);
                    if (result.error) return reject(new Error(result.error));
                    resolve(result);
                } catch (e) {
                    reject(new Error("Failed to parse local NLP output: " + stdout.slice(0, 200)));
                }
            });
            proc.on("error", (err) => reject(err));
        });
    }

    /**
     * Analyze a list of feedback texts: Groq AI primary, local NLP fallback.
     * Only the latest 50 entries are analyzed for performance.
     * @param {string[]} feedbackList
     */
    async analyzeFeedback(feedbackList) {
        if (!feedbackList || feedbackList.length === 0) {
            return null;
        }

        const latest50 = feedbackList.slice(-50);

        try {
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
                ${latest50.map((text, i) => `${i + 1}. "${text}"`).join("\n")}

                Output EXACTLY and ONLY a valid JSON object. Do not include markdown formatting or extra text.
            `;

            const completion = await this.groq.chat.completions.create({
                messages: [
                    { role: "system", content: "You are an AI business intelligence assistant that analyzes customer feedback. You must output results in EXACT JSON format." },
                    { role: "user", content: prompt }
                ],
                model: this.model,
                response_format: { type: "json_object" }
            });

            const text = completion.choices[0]?.message?.content;
            if (!text) throw new Error("Empty response from Groq AI");
            console.log("Groq response received.");
            return JSON.parse(text);
        } catch (error) {
            console.warn("Groq AI Analysis failed, using local NLP fallback:", error.message);
            try {
                const localResult = await this._runLocalNlp(latest50);
                console.log("Local NLP analysis completed (source: local_nlp).");
                return localResult;
            } catch (fallbackErr) {
                console.error("Local NLP fallback also failed:", fallbackErr.message);
                throw error;
            }
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
