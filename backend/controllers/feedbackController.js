const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const nlpService = require('../services/nlpService');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// In-memory storage for feedback data
let uploadedFeedback = [];

// Limit CSV analysis to avoid blocking and long processing (50-100 rows)
const MAX_CSV_ROWS = 100;
const ANALYSIS_BATCH_SIZE = 10;

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
            let firstRowKeys = null;
            fs.createReadStream(req.file.path)
                .pipe(csv())
                .on('data', (data) => {
                    if (!firstRowKeys) firstRowKeys = Object.keys(data);
                    if (!detectedColumn) {
                        const possibleColumns = [
                            'review', 'review_text', 'feedback', 'comment', 'customer_review', 'reviewMessage',
                            'text', 'Text', 'Review', 'reviews', 'comments', 'content', 'message', 'body', 'description'
                        ];
                        detectedColumn = possibleColumns.find(col => data[col] !== undefined && String(data[col]).trim().length > 0);
                        if (!detectedColumn && firstRowKeys.length > 0) {
                            const firstTextColumn = firstRowKeys.find(key => {
                                const val = data[key];
                                return val != null && String(val).trim().length > 2;
                            });
                            if (firstTextColumn) detectedColumn = firstTextColumn;
                        }
                        if (detectedColumn) console.log("Detected feedback column:", detectedColumn);
                    }
                    if (detectedColumn) {
                        const reviewText = data[detectedColumn];
                        if (reviewText != null && typeof reviewText === 'string') {
                            const trimmed = reviewText.trim();
                            if (trimmed.length > 2) feedbackItems.push(trimmed);
                        }
                    }
                })
                .on('end', async () => {
                    try {
                        if (!detectedColumn) {
                            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
                            return res.status(400).json({
                                error: 'No valid feedback column detected. Use a column named review, feedback, text, or comment—or ensure the first column contains text.'
                            });
                        }

                        // Limit to latest MAX_CSV_ROWS to avoid blocking and long processing
                        const limitedItems = feedbackItems.slice(-MAX_CSV_ROWS);
                        console.log("Processing feedback entries:", limitedItems.length, "(max", MAX_CSV_ROWS, ")");

                        let analyzedData = [];
                        try {
                            // Process in batches to avoid blocking the event loop and overwhelming NLP
                            for (let i = 0; i < limitedItems.length; i += ANALYSIS_BATCH_SIZE) {
                                const batch = limitedItems.slice(i, i + ANALYSIS_BATCH_SIZE);
                                const batchResults = await Promise.all(batch.map(async (text, idx) => {
                                    try {
                                        const analysis = await nlpService.analyzeSentiment(text);
                                        return {
                                            id: Date.now() + i + idx,
                                            text,
                                            sentiment: analysis.sentiment || 'neutral',
                                            score: analysis.score != null ? analysis.score : 0.5,
                                            topics: analysis.topics || []
                                        };
                                    } catch (e) {
                                        return { id: Date.now() + i + idx, text, sentiment: 'neutral', score: 0.5, topics: [] };
                                    }
                                }));
                                analyzedData.push(...batchResults);
                            }
                            console.log("AI analysis completed");
                        } catch (err) {
                            console.error('Analysis during upload failed:', err);
                            // Fallback: store raw text with neutral sentiment so upload still succeeds
                            analyzedData = limitedItems.map((text, index) => ({
                                id: Date.now() + index,
                                text,
                                sentiment: 'neutral',
                                score: 0.5,
                                topics: []
                            }));
                        }

                        uploadedFeedback = [...uploadedFeedback, ...analyzedData];
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
                        console.error('Upload/analysis error:', err);
                        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
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
 * GET Aggregated Insights (Groq AI with local NLP fallback). Never hangs; always returns valid JSON.
 */
exports.getInsights = async (req, res) => {
    try {
        if (uploadedFeedback.length === 0) {
            return res.status(200).json({ message: 'No data available' });
        }

        const feedbackTexts = uploadedFeedback.map(f => f.text);
        console.log("[Flow] Requesting aggregated insights for", feedbackTexts.length, "items...");

        let aiInsights;
        try {
            aiInsights = await aiAnalysisService.analyzeFeedback(feedbackTexts);
        } catch (aiErr) {
            console.warn("AI insights failed, using fallback:", aiErr.message);
            aiInsights = null;
        }

        if (aiInsights && !aiInsights.error) {
            const formattedInsights = {
                totalFeedback: uploadedFeedback.length,
                sentimentDistribution: {
                    positive: (aiInsights.sentiment_distribution?.positive ?? 0) + '%',
                    neutral: (aiInsights.sentiment_distribution?.neutral ?? 0) + '%',
                    negative: (aiInsights.sentiment_distribution?.negative ?? 0) + '%'
                },
                topicDistribution: (aiInsights.top_customer_issues || []).map(topic => ({
                    name: typeof topic === 'string' ? topic : (topic?.name ?? ''),
                    percentage: (100 / (aiInsights.top_customer_issues?.length || 1)).toFixed(1)
                })),
                topCustomerIssue: aiInsights.top_customer_issues?.[0],
                trend: 'up',
                globalSummary: aiInsights.summary || '',
                recommendations: [...(aiInsights.business_recommendations || []).slice(0, 1), ...(nlpService.generateInsights(uploadedFeedback)?.recommendations || []).slice(0, 2)],
                keywords: Array.isArray(aiInsights.keywords) ? aiInsights.keywords : []
            };
            return res.status(200).json(formattedInsights);
        }

        const fallback = nlpService.generateInsights(uploadedFeedback);
        res.status(200).json(fallback || { message: 'No data available' });
    } catch (error) {
        console.error('AI Insights Error:', error);
        try {
            const fallback = nlpService.generateInsights(uploadedFeedback);
            return res.status(200).json(fallback || { message: 'No data available' });
        } catch (e) {
            return res.status(200).json({ message: 'No data available' });
        }
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

        const feedbackTexts = uploadedFeedback.map(f => f.text).slice(-50);
        let report;
        try {
            report = await aiAnalysisService.generateInsightReport(feedbackTexts, analyticsSummary);
        } catch (e) {
            console.warn('Report AI failed, using fallback:', e.message);
            report = {
                executiveSummary: 'Report generation is temporarily unavailable. Summary based on uploaded data.',
                keyBusinessProblems: ['Review sentiment distribution for recurring issues.'],
                businessRecommendations: ['Prioritize top topics from analytics.'],
                futureStrategy: ['Continue monitoring feedback trends.'],
                isFallback: true
            };
        }
        res.status(200).json({
            ...report,
            timestamp: new Date().toISOString(),
            dataSummary: analyticsSummary
        });
    } catch (error) {
        console.error('Report Generation Error:', error);
        res.status(200).json({
            executiveSummary: 'Unable to generate report.',
            keyBusinessProblems: [],
            businessRecommendations: [],
            futureStrategy: [],
            isFallback: true,
            timestamp: new Date().toISOString()
        });
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

        let aiSummary = null;
        try {
            console.log("[Flow] Requesting AI summary for last 50 entries...");
            const texts = uploadedFeedback.map(f => f.text).slice(-50);
            aiSummary = await aiAnalysisService.analyzeFeedback(texts);
        } catch (e) {
            console.warn("AI Analytics summary failed:", e.message);
        }

        const dist = aiSummary?.sentiment_distribution;
        const sentimentDistribution = [
            { name: 'Positive', value: dist ? (dist.positive ?? 0) : Math.round((sentimentCounts.positive / total) * 100) },
            { name: 'Neutral', value: dist ? (dist.neutral ?? 0) : Math.round((sentimentCounts.neutral / total) * 100) },
            { name: 'Negative', value: dist ? (dist.negative ?? 0) : Math.round((sentimentCounts.negative / total) * 100) }
        ];

        const topicDistribution = (aiSummary?.top_customer_issues?.length ? aiSummary.top_customer_issues.map(t => ({ topic: typeof t === 'string' ? t : t?.name || '', count: Math.ceil(total / 5) })) : topTopics.map(t => ({ topic: t.name, count: t.count })));

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
        console.error('getAnalytics error:', error);
        // Never hang: return safe fallback so frontend does not crash
        res.status(200).json({
            totalFeedback: uploadedFeedback.length,
            sentimentCounts: { positive: 0, negative: 0, neutral: 0 },
            sentimentDistribution: [
                { name: 'Positive', value: 0 },
                { name: 'Neutral', value: 0 },
                { name: 'Negative', value: 0 }
            ],
            topicDistribution: [],
            keywordFrequencies: [],
            feedbackTrends: [],
            topTopics: [],
            recentActivity: [],
            aiInsights: null
        });
    }
};
