const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const nlpService = require('../services/nlpService');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// In-memory storage for feedback data
let uploadedFeedback = [];

/**
 * Handle CSV Upload & Analysis
 */
exports.uploadFeedback = [
    upload.single('file'),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded.' });
            }

            const feedbackItems = [];
            const results = [];

            // Parse CSV and extract feedback column automatically
            let detectedColumn = null;
            fs.createReadStream(req.file.path)
                .pipe(csv())
                .on('data', (data) => {
                    if (!detectedColumn) {
                        const possibleColumns = ['review', 'review_text', 'feedback', 'comment', 'customer_review', 'reviewMessage', 'text', 'Text', 'Review'];
                        detectedColumn = possibleColumns.find(col => data[col] !== undefined);
                        if (detectedColumn) {
                            console.log("Detected feedback column:", detectedColumn);
                        }
                    }

                    if (detectedColumn) {
                        const reviewText = data[detectedColumn];
                        if (reviewText && typeof reviewText === 'string') {
                            const trimmed = reviewText.trim();
                            if (trimmed.length > 3) {
                                feedbackItems.push(trimmed);
                            }
                        }
                    }
                })
                .on('end', async () => {
                    try {
                        if (!detectedColumn) {
                            fs.unlinkSync(req.file.path);
                            return res.status(400).json({ error: 'No valid feedback column detected. Please include a column named review, review_text, or feedback.' });
                        }

                        console.log(`[Flow] CSV Parsed: ${feedbackItems.length} items found.`);
                        // Analyze each extracted review
                        const analyzedData = await Promise.all(feedbackItems.map(async (text, index) => {
                            const analysis = await nlpService.analyzeSentiment(text);
                            return {
                                id: Date.now() + index,
                                text,
                                sentiment: analysis.sentiment,
                                score: analysis.score,
                                topics: analysis.topics || []
                            };
                        }));

                        // Store in memory (Concatenate with existing or replace?)
                        // User said "processed statistics for the dashboard", usually implies a fresh or growing dataset.
                        // We'll append for now for a better dashboard experience.
                        uploadedFeedback = [...uploadedFeedback, ...analyzedData];

                        // Cleanup uploaded file
                        fs.unlinkSync(req.file.path);

                        res.status(200).json({
                            message: 'CSV uploaded and analyzed successfully.',
                            count: analyzedData.length,
                            totalRecords: uploadedFeedback.length,
                            sentimentCounts: {
                                positive: analyzedData.filter(f => f.sentiment === 'positive').length,
                                negative: analyzedData.filter(f => f.sentiment === 'negative').length,
                                neutral: analyzedData.filter(f => f.sentiment === 'neutral').length
                            },
                            preview: analyzedData.slice(0, 5)
                        });
                    } catch (err) {
                        console.error('Analysis during upload failed:', err);
                        res.status(500).json({ error: 'Failed to analyze records after upload.' });
                    }
                });
        } catch (error) {
            console.error('Upload Error:', error);
            res.status(500).json({ error: 'Internal server error during upload.' });
        }
    }
];

/**
 * Single Feedback Analysis
 */
exports.analyzeFeedback = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'Text is required for analysis.' });
        
        const analysis = await nlpService.analyzeSentiment(text);
        res.status(200).json({ originalText: text, analysis });
    } catch (error) {
        res.status(500).json({ error: 'Analysis failed.' });
    }
};

const aiAnalysisService = require('../services/aiAnalysisService');

/**
 * GET Aggregated Insights (Powered by Groq AI)
 */
exports.getInsights = async (req, res) => {
    try {
        if (uploadedFeedback.length === 0) {
            return res.status(200).json({ message: 'No data available' });
        }

        // Collect all feedback text for the AI
        const feedbackTexts = uploadedFeedback.map(f => f.text);
        
        // Get Deep AI Insights from Groq AI
        console.log(`[Flow] Requesting aggregated insights for ${feedbackTexts.length} items...`);
        const aiInsights = await aiAnalysisService.analyzeFeedback(feedbackTexts);

        // Map AI response to dashboard structure
        const formattedInsights = {
            totalFeedback: uploadedFeedback.length,
            sentimentDistribution: {
                positive: (aiInsights.sentiment_distribution?.positive || 0) + '%',
                neutral: (aiInsights.sentiment_distribution?.neutral || 0) + '%',
                negative: (aiInsights.sentiment_distribution?.negative || 0) + '%'
            },
            topicDistribution: (aiInsights.top_customer_issues || []).map(topic => ({
                name: topic,
                percentage: (100 / (aiInsights.top_customer_issues?.length || 1)).toFixed(1) // Approximate distribution if not provided
            })),
            topCustomerIssue: aiInsights.top_customer_issues?.[0],
            trend: 'up',
            globalSummary: aiInsights.summary,
            recommendations: [...(aiInsights.business_recommendations || []).slice(0, 1), ...nlpService.generateInsights(uploadedFeedback).recommendations.slice(0, 2)],
            keywords: aiInsights.keywords || []
        };

        res.status(200).json(formattedInsights);
    } catch (error) {
        console.error('AI Insights Error:', error);
        // Fallback to basic insights if AI fails
        const fallback = nlpService.generateInsights(uploadedFeedback);
        res.status(200).json(fallback);
    }
};

/**
 * POST Generate Full Business Intelligence Report
 */
exports.generateInsightReport = async (req, res) => {
    try {
        if (uploadedFeedback.length === 0) {
            return res.status(400).json({ error: 'No feedback data available. Please upload a dataset first.' });
        }

        const analyticsSummary = {
            totalFeedback: uploadedFeedback.length,
            sentimentCounts: {
                positive: uploadedFeedback.filter(f => f.sentiment === 'positive').length,
                negative: uploadedFeedback.filter(f => f.sentiment === 'negative').length,
                neutral: uploadedFeedback.filter(f => f.sentiment === 'neutral').length
            },
            topTopics: [] // Logic to extract top topics if needed, but analyzeFeedback handles most
        };

        // Get top topics from existing logic in getAnalytics (simplified)
        const topicCounts = {};
        uploadedFeedback.forEach(f => {
            f.topics?.forEach(topic => {
                topicCounts[topic] = (topicCounts[topic] || 0) + 1;
            });
        });
        analyticsSummary.topTopics = Object.entries(topicCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));

        const feedbackTexts = uploadedFeedback.map(f => f.text);
        const report = await aiAnalysisService.generateInsightReport(feedbackTexts, analyticsSummary);

        res.status(200).json({
            ...report,
            timestamp: new Date().toISOString(),
            dataSummary: analyticsSummary
        });
    } catch (error) {
        console.error('Report Generation Error:', error);
        res.status(500).json({ error: 'Failed to generate AI insight report.' });
    }
};

/**
 * GET Dashboard Analytics (Enhanced with AI)
 */
exports.getAnalytics = async (req, res) => {
    try {
        const total = uploadedFeedback.length;
        if (total === 0) {
            return res.status(200).json({ totalFeedback: 0, sentimentCounts: { positive: 0, negative: 0, neutral: 0 }, topTopics: [] });
        }

        const sentimentCounts = {
            positive: uploadedFeedback.filter(f => f.sentiment === 'positive').length,
            negative: uploadedFeedback.filter(f => f.sentiment === 'negative').length,
            neutral: uploadedFeedback.filter(f => f.sentiment === 'neutral').length
        };

        const topicCounts = {};
        uploadedFeedback.forEach(f => {
            f.topics?.forEach(topic => {
                topicCounts[topic] = (topicCounts[topic] || 0) + 1;
            });
        });

        const topTopics = Object.entries(topicCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));

        // Optional: Include AI summary in main stats if needed
        let aiSummary = null;
        try {
            console.log(`[Flow] Requesting AI summary for last 50 entries...`);
            const texts = uploadedFeedback.map(f => f.text).slice(-50); // Analyze last 50 for speed
            aiSummary = await aiAnalysisService.analyzeFeedback(texts);
        } catch (e) {
            console.warn("AI Analytics summary failed:", e);
        }

        const sentimentDistribution = [
            { name: 'Positive', value: aiSummary ? aiSummary.sentiment_distribution.positive : Math.round((sentimentCounts.positive / total) * 100) },
            { name: 'Neutral', value: aiSummary ? aiSummary.sentiment_distribution.neutral : Math.round((sentimentCounts.neutral / total) * 100) },
            { name: 'Negative', value: aiSummary ? aiSummary.sentiment_distribution.negative : Math.round((sentimentCounts.negative / total) * 100) }
        ];

        const topicDistribution = (aiSummary ? (aiSummary.top_customer_issues || []).map(t => ({ topic: t, count: Math.ceil(total / 5) })) : topTopics.map(t => ({ topic: t.name, count: t.count })));

        // Extract keywords from all feedback
        const allKeywords = [];
        uploadedFeedback.forEach(f => {
            if (f.keywords) allKeywords.push(...f.keywords);
        });
        if (aiSummary?.keywords) allKeywords.push(...aiSummary.keywords);

        const keywordMap = {};
        allKeywords.forEach(kw => {
            const k = kw.toLowerCase();
            keywordMap[k] = (keywordMap[k] || 0) + 1;
        });
        const keywordFrequencies = Object.entries(keywordMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word, frequency]) => ({ word, frequency }));

        // Generate mock trends based on the feedback timestamps
        // Groups feedback by day (or just simulated batches if timestamps are close)
        const feedbackTrends = [];
        const sortedFeedback = [...uploadedFeedback].sort((a, b) => a.id - b.id);
        
        // Split into 5-7 data points for the trend chart
        const chunkSize = Math.ceil(total / 5);
        for (let i = 0; i < total; i += chunkSize) {
            const chunk = sortedFeedback.slice(i, i + chunkSize);
            const date = new Date(chunk[0].id).toLocaleDateString([], { month: 'short', day: 'numeric' });
            const pos = chunk.filter(f => f.sentiment === 'positive').length;
            const neg = chunk.filter(f => f.sentiment === 'negative').length;
            const neu = chunk.filter(f => f.sentiment === 'neutral').length;
            feedbackTrends.push({
                date,
                positive: Math.round((pos / chunk.length) * 100),
                negative: Math.round((neg / chunk.length) * 100),
                neutral: Math.round((neu / chunk.length) * 100)
            });
        }

        res.status(200).json({
            totalFeedback: total,
            sentimentCounts,
            sentimentDistribution,
            topicDistribution,
            keywordFrequencies,
            feedbackTrends,
            topTopics,
            recentActivity: uploadedFeedback.slice(-10).reverse(),
            aiInsights: aiSummary
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get analytics.' });
    }
};