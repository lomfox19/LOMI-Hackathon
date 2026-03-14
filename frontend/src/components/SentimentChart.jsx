import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip
} from 'recharts';
import { Sparkles, BrainCircuit, Activity } from 'lucide-react';
import apiClient from '../api/client';

const SentimentChart = ({ stats: externalStats }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    
    // Exact colors: Positive -> Green, Neutral -> Yellow, Negative -> Red
    const COLORS = {
        Positive: '#2E7D5B', 
        Neutral: '#FCBF49', 
        Negative: '#D62828'
    };

    const updateFromExternal = useCallback((s) => {
        setStats(s);
        const total = s.totalFeedback || 0;
        if (total === 0) {
            setData([]);
            setLoading(false);
            return;
        }

        const chartData = [
            { name: 'Positive', value: Math.round((s.sentimentCounts?.positive || 0) / total * 100) },
            { name: 'Neutral', value: Math.round((s.sentimentCounts?.neutral || 0) / total * 100) },
            { name: 'Negative', value: Math.round((s.sentimentCounts?.negative || 0) / total * 100) },
        ];
        setData(chartData);
        setLoading(false);
    }, []);

    const fetchInsights = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/api/feedback/analytics');
            updateFromExternal(response.data);
        } catch (error) {
            console.error('Failed to fetch sentiment insights:', error);
        } finally {
            setLoading(false);
        }
    }, [updateFromExternal]);

    useEffect(() => {
        if (externalStats) {
            updateFromExternal(externalStats);
        } else {
            fetchInsights();
        }
    }, [externalStats, fetchInsights, updateFromExternal]);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/90 backdrop-blur-md border border-ai-primary/10 p-3 rounded-xl shadow-ai-card">
                    <p className="text-xs font-bold text-ai-primary uppercase tracking-wider mb-1">
                        {payload[0].name}
                    </p>
                    <p className="text-lg font-heading font-bold" style={{ color: COLORS[payload[0].name] }}>
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
                    <h3 className="text-lg font-heading font-bold text-ai-primary flex items-center gap-2">
                        <BrainCircuit className="w-5 h-5 text-ai-secondary" />
                        Sentiment Analysis
                    </h3>
                    <p className="text-[10px] text-ai-primary/50 mt-0.5 font-medium uppercase tracking-wider">
                        AI Visual Insights Breakdown
                    </p>
                </div>
                <motion.button
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.5 }}
                    onClick={fetchInsights}
                    className="p-2 rounded-lg bg-ai-bg/50 border border-ai-primary/5 text-ai-primary/40 hover:text-ai-secondary transition-colors"
                >
                    <Activity className="w-4 h-4" />
                </motion.button>
            </div>

            <div className="flex-1 min-h-[220px] relative mt-2">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-10 h-10 border-4 border-ai-secondary/30 border-t-ai-secondary rounded-full"
                        />
                    </div>
                ) : data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={95}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                                animationBegin={0}
                                animationDuration={1000}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-ai-primary/20">
                        <Sparkles className="w-12 h-12 mb-2" />
                        <p className="text-xs font-bold uppercase tracking-widest">No Data Samples</p>
                    </div>
                )}

                {!loading && data.length > 0 && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                        <p className="text-[9px] font-bold text-ai-primary/40 uppercase tracking-widest">Growth</p>
                        <p className="text-3xl font-heading font-bold text-ai-primary leading-none">
                            {stats?.totalFeedback || '0'}
                        </p>
                        <p className="text-[10px] text-ai-secondary font-bold mt-1">SAMPLES</p>
                    </div>
                )}
            </div>

            {/* Visual Breakdown Bars as requested */}
            <div className="mt-8 space-y-4">
                {loading ? null : data.length > 0 ? (
                    data.map((item, idx) => (
                        <div key={item.name} className="space-y-1.5">
                            <div className="flex justify-between items-end px-1">
                                <span className="text-[10px] font-bold text-ai-primary/60 uppercase tracking-widest flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[item.name] }} />
                                    {item.name}
                                </span>
                                <span className="text-xs font-heading font-bold text-ai-primary">
                                    {item.value}%
                                </span>
                            </div>
                            <div className="h-2 w-full bg-ai-primary/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${item.value}%` }}
                                    transition={{ duration: 1, delay: 0.8 + idx * 0.1, ease: "easeOut" }}
                                    className="h-full rounded-full"
                                    style={{ 
                                        backgroundColor: COLORS[item.name],
                                        boxShadow: `0 0 10px ${COLORS[item.name]}33`
                                    }}
                                />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="pt-4 border-t border-ai-primary/5 text-center">
                        <p className="text-[10px] font-bold text-ai-primary/30 uppercase tracking-widest">Awaiting Datasets...</p>
                    </div>
                )}
            </div>

            {stats?.topCustomerIssue && (
                <div className="mt-6 pt-5 border-t border-ai-primary/5">
                    <div className="p-3 rounded-xl bg-ai-secondary/5 border border-ai-secondary/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-ai-secondary" />
                            <span className="text-[10px] font-bold text-ai-primary/60 uppercase tracking-widest">Key Trend</span>
                        </div>
                        <span className="text-[10px] font-bold text-ai-secondary px-2 py-0.5 rounded-full border border-ai-secondary/10 bg-white/50 truncate max-w-[140px]">
                            {stats.topCustomerIssue}
                        </span>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default SentimentChart;
