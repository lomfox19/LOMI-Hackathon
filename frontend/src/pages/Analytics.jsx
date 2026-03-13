import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    PieChart, Pie, Cell,
    BarChart, Bar,
    LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
    BrainCircuit, 
    BarChart3, 
    TrendingUp, 
    Hash, 
    RefreshCcw,
    Sparkles
} from 'lucide-react';
import apiClient from '../api/client';

const COLORS = {
    positive: '#2E7D5B',
    neutral: '#FCBF49',
    negative: '#D62828',
    primary: '#003049',
    accent: '#F77F00'
};

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/api/feedback/analytics');
            setData(response.data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch analytics data:', err);
            setError('Failed to load intelligence data. Please ensure datasets are uploaded.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/90 backdrop-blur-md border border-ai-primary/10 p-3 rounded-xl shadow-ai-card">
                    <p className="text-xs font-bold text-ai-primary uppercase tracking-wider mb-1">{label || payload[0].name}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm font-heading font-bold" style={{ color: entry.color || entry.fill }}>
                            {entry.name}: {entry.value}%
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-ai-secondary/30 border-t-ai-secondary rounded-full mb-4"
                />
                <p className="text-ai-primary/60 font-medium animate-pulse">Initializing Intelligence Flow...</p>
            </div>
        );
    }

    if (error || !data || data.totalFeedback === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
                <div className="p-6 rounded-3xl bg-ai-primary/5 border-2 border-dashed border-ai-primary/10 mb-6">
                    <BrainCircuit className="w-16 h-16 text-ai-primary/20 mx-auto mb-4" />
                    <h3 className="text-xl font-heading font-bold text-ai-primary uppercase tracking-widest">No Intelligence Data</h3>
                    <p className="text-sm text-ai-primary/50 mt-2 max-w-sm">
                        Please upload customer feedback datasets in the Dashboard section to unlock advanced analytics.
                    </p>
                </div>
                <button 
                    onClick={fetchData}
                    className="flex items-center gap-2 px-6 py-3 bg-ai-primary text-white rounded-xl shadow-lg hover:bg-ai-primary/90 transition-all font-medium"
                >
                    <RefreshCcw className="w-4 h-4" />
                    Sync Data
                </button>
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 backdrop-blur-md p-6 rounded-2xl border border-ai-primary/5 shadow-sm">
                <div>
                    <h2 className="text-2xl font-heading font-bold text-ai-primary flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-ai-secondary" />
                        Advanced Intelligence Analytics
                    </h2>
                    <p className="text-sm text-ai-primary/60 mt-1">
                        Deep sentiment tracing and topic clustering across {data.totalFeedback} entries
                    </p>
                </div>
                <button 
                    onClick={fetchData}
                    className="self-start md:self-center flex items-center gap-2 px-4 py-2 bg-ai-secondary/10 text-ai-secondary border border-ai-secondary/20 rounded-xl hover:bg-ai-secondary/20 transition-all text-sm font-bold"
                >
                    <RefreshCcw className="w-4 h-4" />
                    Refresh Analysis
                </button>
            </div>

            {/* 2x2 Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* 1. Sentiment Pie Chart */}
                <motion.div variants={cardVariants} className="bg-white/60 backdrop-blur-xl rounded-xl-card border border-ai-primary/8 shadow-ai-card p-6 min-h-[400px] flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-ai-secondary/10 text-ai-secondary">
                            <BrainCircuit className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-heading font-bold text-ai-primary">Sentiment Distribution</h3>
                            <p className="text-xs text-ai-primary/50">Overall emotional landscape</p>
                        </div>
                    </div>
                    <div className="flex-1 min-h-[250px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.sentimentDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {data.sentimentDistribution.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={COLORS[entry.name.toLowerCase()] || COLORS.neutral} 
                                        />
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
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
                            <p className="text-[10px] font-bold text-ai-primary/40 uppercase tracking-tighter">Samples</p>
                            <p className="text-3xl font-heading font-bold text-ai-primary leading-none">{data.totalFeedback}</p>
                        </div>
                    </div>
                </motion.div>

                {/* 2. Topic Distribution Bar Chart */}
                <motion.div variants={cardVariants} className="bg-white/60 backdrop-blur-xl rounded-xl-card border border-ai-primary/8 shadow-ai-card p-6 min-h-[400px] flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-ai-primary/5 text-ai-primary">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-heading font-bold text-ai-primary">Topic Distribution</h3>
                            <p className="text-xs text-ai-primary/50">Most common feedback categories</p>
                        </div>
                    </div>
                    <div className="flex-1 min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.topicDistribution} layout="vertical" margin={{ left: 20, right: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,48,73,0.05)" />
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="topic" 
                                    type="category" 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fontWeight: 700, fill: '#003049' }}
                                    width={100}
                                />
                                <Tooltip 
                                    cursor={{ fill: 'rgba(46,125,91,0.05)' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-white/90 backdrop-blur-md border border-ai-primary/10 p-3 rounded-xl shadow-ai-card">
                                                    <p className="text-xs font-bold text-ai-primary uppercase tracking-wider">{payload[0].payload.topic}</p>
                                                    <p className="text-lg font-heading font-bold text-ai-secondary">{payload[0].value} Mentions</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar 
                                    dataKey="count" 
                                    fill={COLORS.secondary} 
                                    radius={[0, 8, 8, 0]} 
                                    barSize={24}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* 3. Feedback Trend Line Chart */}
                <motion.div variants={cardVariants} className="bg-white/60 backdrop-blur-xl rounded-xl-card border border-ai-primary/8 shadow-ai-card p-6 min-h-[400px] flex flex-col lg:col-span-2 xl:col-span-1">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-ai-accent-gold/10 text-ai-accent-gold" style={{ backgroundColor: 'rgba(252,191,73,0.1)', color: '#FCBF49' }}>
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-heading font-bold text-ai-primary">Sentiment Trends</h3>
                            <p className="text-xs text-ai-primary/50">Emotional trajectory over time</p>
                        </div>
                    </div>
                    <div className="flex-1 min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.feedbackTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,48,73,0.05)" />
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fontWeight: 600, fill: '#003049' }}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fontWeight: 600, fill: '#003049' }}
                                    tickFormatter={(val) => `${val}%`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend 
                                    verticalAlign="top" 
                                    align="right"
                                    iconType="circle"
                                    height={36}
                                    formatter={(value) => <span className="text-[10px] font-bold text-ai-primary/70 uppercase tracking-widest pl-1">{value}</span>}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="positive" 
                                    name="Positive" 
                                    stroke={COLORS.positive} 
                                    strokeWidth={3} 
                                    dot={{ r: 4, fill: COLORS.positive, strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="negative" 
                                    name="Negative" 
                                    stroke={COLORS.negative} 
                                    strokeWidth={3} 
                                    dot={{ r: 4, fill: COLORS.negative, strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="neutral" 
                                    name="Neutral" 
                                    stroke={COLORS.neutral} 
                                    strokeWidth={3} 
                                    dot={{ r: 4, fill: COLORS.neutral, strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* 4. Keyword Frequency Chart */}
                <motion.div variants={cardVariants} className="bg-white/60 backdrop-blur-xl rounded-xl-card border border-ai-primary/8 shadow-ai-card p-6 min-h-[400px] flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-ai-primary/5 text-ai-primary">
                            <Hash className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-heading font-bold text-ai-primary">Keyword Intelligence</h3>
                            <p className="text-xs text-ai-primary/50">Most significant term frequencies</p>
                        </div>
                    </div>
                    <div className="flex-1 min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.keywordFrequencies} margin={{ bottom: 20 }}>
                                <XAxis 
                                    dataKey="word" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#003049', angle: -45, textAnchor: 'end' }}
                                />
                                <Tooltip 
                                    cursor={{ fill: 'rgba(0,48,73,0.03)' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-white/90 backdrop-blur-md border border-ai-primary/10 p-3 rounded-xl shadow-ai-card">
                                                    <p className="text-xs font-bold text-ai-primary uppercase tracking-wider">"{payload[0].payload.word}"</p>
                                                    <p className="text-lg font-heading font-bold text-ai-primary">{payload[0].value} Occurrences</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar 
                                    dataKey="frequency" 
                                    fill={COLORS.primary} 
                                    radius={[8, 8, 0, 0]} 
                                    barSize={20}
                                >
                                    {data.keywordFrequencies.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={index < 3 ? COLORS.accent : `${COLORS.primary}${Math.max(20, 100 - (index * 10))}`} 
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

            </div>

            {/* AI Summary Banner */}
            {data.aiInsights?.insight_summary && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="p-6 rounded-2xl bg-gradient-to-r from-ai-primary to-ai-secondary text-white shadow-xl overflow-hidden relative"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-5 h-5 text-ai-accent-gold" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">AI Executive Summary</span>
                        </div>
                        <h4 className="text-xl font-heading font-bold mb-2">{data.aiInsights.insight_summary}</h4>
                        <div className="flex items-center gap-2 text-sm opacity-90 italic">
                            <RefreshCcw className="w-3.5 h-3.5 animate-spin-slow" />
                            <span>Actionable Advice: {data.aiInsights.recommendation}</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default Analytics;
