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

            // Parse CSV and extract "review" column
            fs.createReadStream(req.file.path)
                .pipe(csv())
                .on('data', (data) => {
                    const reviewText = data['review'] || data['Review'] || data['text'] || data['Text'];
                    if (reviewText) {
                        feedbackItems.push(reviewText.trim());
                    }
                })
                .on('end', async () => {
                    try {
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

/**
 * GET Aggregated Insights
 */
exports.getInsights = async (req, res) => {
    try {
        const insights = nlpService.generateInsights(uploadedFeedback);
        res.status(200).json(insights || { message: 'No data available' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get insights.' });
    }
};

/**
 * GET Dashboard Analytics
 */
exports.getAnalytics = async (req, res) => {
    try {
        const total = uploadedFeedback.length;
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

        res.status(200).json({
            totalFeedback: total,
            sentimentCounts,
            topTopics,
            recentActivity: uploadedFeedback.slice(-10).reverse()
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get analytics.' });
    }
};