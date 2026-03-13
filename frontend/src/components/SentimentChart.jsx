import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts';
import { TrendingUp, Sparkles, BrainCircuit } from 'lucide-react';
import apiClient from '../api/client';
const SentimentChart = ({ stats: externalStats }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const COLORS = ['#2E7D5B', '#FCBF49', '#D62828']; // Positive, Neutral, Negative

    useEffect(() => {
        if (externalStats) {
            updateFromExternal(externalStats);
        } else {
            fetchInsights();
        }
    }, [externalStats]);

    const updateFromExternal = (s) => {
        setStats(s);
        const total = s.totalFeedback || 1;
        const chartData = [
            { name: 'Positive', value: Math.round((s.sentimentCounts?.positive || 0) / total * 100) },
            { name: 'Neutral', value: Math.round((s.sentimentCounts?.neutral || 0) / total * 100) },
            { name: 'Negative', value: Math.round((s.sentimentCounts?.negative || 0) / total * 100) },
        ];
        setData(chartData);
        setLoading(false);
    };

    const fetchInsights = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/api/feedback/insights');
            const insights = response.data;

            setStats(insights);
            // Parse percentages from strings like "50.0%" to numbers
            const chartData = [
                { name: 'Positive', value: parseFloat(insights.sentimentDistribution.positive) },
                { name: 'Neutral', value: parseFloat(insights.sentimentDistribution.neutral) },
                { name: 'Negative', value: parseFloat(insights.sentimentDistribution.negative) },
            ];
            setData(chartData);
        } catch (error) {
            console.error('Failed to fetch sentiment insights:', error);
        } finally {
            setLoading(false);
        }
    };
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/90 backdrop-blur-md border border-ai-primary/10 p-3 rounded-xl shadow-ai-card">
                    <p className="text-xs font-bold text-ai-primary uppercase tracking-wider mb-1">
                        {payload[0].name}
                    </p>
                    <p className="text-lg font-heading font-bold text-ai-secondary">
                        {payload[0].value}%
                    </p>
                </div>
            );
        }
        return null;
    };
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="bg-white/60 backdrop-blur-xl rounded-xl-card border border-ai-primary/8 shadow-ai-card p-6 h-full flex flex-col"
        >
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-heading font-bold text-ai-primary flex items-center gap-2">
                        <BrainCircuit className="w-5 h-5 text-ai-secondary" />
                        Sentiment Analysis
                    </h3>
                    <p className="text-xs text-ai-primary/50 mt-1 font-medium italic">
                        AI-driven emotional intelligence distribution
                    </p>
                </div>
                <motion.button
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.5 }}
                    onClick={fetchInsights}
                    className="p-2 rounded-lg bg-ai-bg/50 border border-ai-primary/5 text-ai-primary/40 hover:text-ai-secondary transition-colors"
                >
                    <TrendingUp className="w-4 h-4" />
                </motion.button>
            </div>
            <div className="flex-1 min-h-[300px] relative">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-10 h-10 border-4 border-ai-secondary/30 border-t-ai-secondary rounded-full"
                        />
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={8}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                formatter={(value) => <span className="text-[11px] font-bold text-ai-primary/70 uppercase tracking-widest pl-2">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                )}

                {/* Center Text Overlay */}
                {!loading && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                        <p className="text-[10px] font-bold text-ai-primary/40 uppercase tracking-tighter">Total</p>
                        <p className="text-2xl font-heading font-bold text-ai-primary leading-none">
                            {stats?.totalFeedback || '0'}
                        </p>
                    </div>
                )}
            </div>
            {stats && (
                <div className="mt-4 pt-4 border-t border-ai-primary/5">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-ai-secondary/5 border border-ai-secondary/10">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-ai-secondary" />
                            <span className="text-xs font-semibold text-ai-primary/70">Top Insight</span>
                        </div>
                        <span className="text-[10px] font-bold text-ai-secondary bg-white/50 px-2 py-0.5 rounded-full border border-ai-secondary/10">
                            {stats.topCustomerIssue}
                        </span>
                    </div>
                </div>
            )}
        </motion.div>
    );
};
export default SentimentChart;