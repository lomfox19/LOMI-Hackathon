const { spawn } = require('child_process');
const path = require('path');
class NLPService {
    /**
     * Calls the Python NLP engine for deep analysis.
     */
    async _callPythonEngine(text) {
        return new Promise((resolve, reject) => {
            const pythonPath = 'python'; // Assumes python is in PATH
            const scriptPath = path.resolve(__dirname, '..', 'ai', 'nlp-engine', 'engine.py');

            // Log for debugging (Only in dev)
            if (process.env.NODE_ENV !== 'production') {
                console.log(`[NLP] Spawning: ${pythonPath} "${scriptPath}"`);
            }

            const pyProcess = spawn(pythonPath, [scriptPath, text]);

            let data = '';
            let error = '';
            pyProcess.stdout.on('data', (chunk) => {
                data += chunk.toString();
            });
            pyProcess.stderr.on('data', (chunk) => {
                error += chunk.toString();
            });
            pyProcess.on('close', (code) => {
                if (code !== 0) {
                    console.error(`Python process exited with code ${code}: ${error}`);
                    return reject(new Error(error || 'Python script failed'));
                }
                try {
                    const result = JSON.parse(data);
                    resolve(result);
                } catch (e) {
                    reject(new Error('Failed to parse Python output: ' + data));
                }
            });
        });
    }
    /**
     * Analyzes feedback text and returns sentiment and key issues.
     * @param {string} text - The feedback text to analyze.
     * @returns {Object} - Analysis result.
     */
    async analyzeSentiment(text) {
        try {
            const aiResult = await this._callPythonEngine(text);
            if (aiResult.status === 'success') {
                return {
                    sentiment: aiResult.analysis.sentiment.label,
                    score: aiResult.analysis.sentiment.score,
                    keywords: aiResult.analysis.keywords,
                    topics: aiResult.analysis.topics,
                    insights: aiResult.analysis.insights
                };
            }
        } catch (err) {
            console.warn('AI Engine failed, using fallback logic:', err.message);
        }
        // Placeholder for actual AI/NLP logic (e.g., OpenAI, HuggingFace, or custom rules)
        // Placeholder for actual AI/NLP logic (e.g., OpenAI, HuggingFace, or custom rules)
        // For now, returning mock analysis based on keywords
        const lowerText = text.toLowerCase();
        let sentiment = 'neutral';
        let score = 0.5;
        const positiveWords = ['great', 'excellent', 'fast', 'good', 'love', 'happy', 'amazing', 'best'];
        const negativeWords = ['slow', 'bad', 'error', 'bug', 'latency', 'crash', 'poor', 'worst', 'issue'];
        let posCount = 0;
        let negCount = 0;
        positiveWords.forEach(word => {
            if (lowerText.includes(word)) posCount++;
        });
        negativeWords.forEach(word => {
            if (lowerText.includes(word)) negCount++;
        });
        if (posCount > negCount) {
            sentiment = 'positive';
            score = 0.7 + (posCount * 0.05);
        } else if (negCount > posCount) {
            sentiment = 'negative';
            score = 0.3 - (negCount * 0.05);
        }
        return {
            sentiment,
            score: Math.max(0, Math.min(1, score)),
            keywords: this.extractKeywords(text)
        };
    }
    extractKeywords(text) {
        // Simplified keyword extraction
        const words = text.split(/\W+/);
        const stopWords = new Set(['the', 'and', 'was', 'to', 'for', 'is', 'in', 'of', 'it', 'with', 'my', 'at']);
        return [...new Set(words.filter(w => w.length > 4 && !stopWords.has(w.toLowerCase())).slice(0, 5))];
    }
    /**
     * Generates high-level insights from a collection of feedback.
     * @param {Array} feedbackList - List of feedback items.
     */
    generateInsights(feedbackList) {
        const totalCount = feedbackList.length;
        if (totalCount === 0) return null;
        const sentimentCounts = feedbackList.reduce((acc, item) => {
            acc[item.sentiment] = (acc[item.sentiment] || 0) + 1;
            return acc;
        }, {});
        const topIssues = ['Latency', 'UI Confusion', 'Auth Errors']; // Mock top issues
        // Aggregate topics from all feedback items
        const topicCounts = {};
        feedbackList.forEach(item => {
            if (item.topics && Array.isArray(item.topics)) {
                item.topics.forEach(topic => {
                    const t = topic.toLowerCase();
                    topicCounts[t] = (topicCounts[t] || 0) + 1;
                });
            }
        });
        const topicDistribution = Object.entries(topicCounts)
            .map(([name, count]) => ({
                name: name.charAt(0).toUpperCase() + name.slice(1),
                percentage: ((count / totalCount) * 100).toFixed(1)
            }))
            .sort((a, b) => b.percentage - a.percentage)
            .slice(0, 5);
        const sentimentDist = {
            positive: ((sentimentCounts.positive || 0) / totalCount * 100).toFixed(1),
            neutral: ((sentimentCounts.neutral || 0) / totalCount * 100).toFixed(1),
            negative: ((sentimentCounts.negative || 0) / totalCount * 100).toFixed(1)
        };
        // Generate dynamic summary
        let globalSummary = "";
        const topTopic = topicDistribution[0]?.name || "various aspects";
        if (parseFloat(sentimentDist.positive) > 60) {
            globalSummary = `Customers are highly satisfied, particularly with ${topTopic}.`;
        } else if (parseFloat(sentimentDist.negative) > 30) {
            globalSummary = `Critical issues detected in ${topTopic} causing significant dissatisfaction.`;
        } else {
            globalSummary = `Feedback is mixed; while ${topTopic} is mentioned frequently, sentiment remains balanced.`;
        }
        if (topicDistribution.length > 1) {
            globalSummary += ` We also noticed recurring mentions of ${topicDistribution[1].name.toLowerCase()}.`;
        }
        return {
            totalFeedback: totalCount,
            sentimentDistribution: {
                positive: sentimentDist.positive + '%',
                neutral: sentimentDist.neutral + '%',
                negative: sentimentDist.negative + '%'
            },
            topicDistribution: topicDistribution.length > 0 ? topicDistribution : [
                { name: 'Billing', percentage: '45.0' },
                { name: 'Support', percentage: '30.0' },
                { name: 'Product', percentage: '25.0' }
            ],
            topCustomerIssue: topicDistribution[0]?.name || topIssues[0],
            trend: 'up',
            globalSummary,
            recommendations: [
                `Prioritize optimizations for ${topTopic} to address current feedback volume.`,
                'Enhance the monitoring of sentiment shifts in the next development cycle.',
                'Consider a targeted survey for users mentioning secondary topics.'
            ]
        };
    }
}
module.exports = new NLPService();