import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Smile, 
  Frown, 
  Meh, 
  AlertCircle, 
  Zap, 
  TrendingUp, 
  Target,
  FileText,
  Lightbulb,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import apiClient from '../api/client';

const Feedback = () => {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInsights();
    }, []);

    const fetchInsights = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/api/feedback/insights');
            setInsights(response.data);
        } catch (error) {
            console.error('Failed to fetch feedback intelligence:', error);
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    <RefreshCw className="w-12 h-12 text-ai-secondary opacity-40" />
                </motion.div>
                <p className="text-sm font-bold text-ai-primary/40 uppercase tracking-widest">Synthesizing Feedback Intelligence...</p>
            </div>
        );
    }

    if (!insights || insights.message === 'No data available') {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
                <div className="w-20 h-20 bg-ai-primary/5 rounded-3xl flex items-center justify-center mb-6">
                    <FileText className="w-10 h-10 text-ai-primary/20" />
                </div>
                <h2 className="text-2xl font-heading font-bold text-ai-primary mb-2">No Intelligence Available</h2>
                <p className="text-sm text-ai-primary/50 max-w-sm">Please upload a feedback dataset in the dashboard to generate AI-powered business insights.</p>
            </div>
        );
    }

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-10 max-w-7xl mx-auto px-2 pb-12"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-ai-primary/5 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-ai-secondary/10 text-ai-secondary">
                            <Zap className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-bold text-ai-secondary uppercase tracking-[0.2em]">Neural Intelligence</span>
                    </div>
                    <h1 className="text-4xl font-heading font-bold text-ai-primary tracking-tight">Feedback Intelligence</h1>
                    <p className="text-sm text-ai-primary/50 mt-2 max-w-xl italic">
                        Real-time distillation of customer sentiment and strategic business markers.
                    </p>
                </div>
                <button 
                    onClick={fetchInsights}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-ai-primary text-white font-bold text-xs uppercase tracking-widest hover:shadow-lg transition-all"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh Analysis
                </button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { title: "Total Feedback", value: insights.totalFeedback, icon: MessageSquare, color: "text-ai-primary", bg: "bg-ai-primary/5" },
                    { title: "Positive Sentiment", value: insights.sentimentDistribution.positive, icon: Smile, color: "text-ai-secondary", bg: "bg-ai-secondary/5" },
                    { title: "Neutral Sentiment", value: insights.sentimentDistribution.neutral, icon: Meh, color: "text-orange-500", bg: "bg-orange-50" },
                    { title: "Negative Sentiment", value: insights.sentimentDistribution.negative, icon: Frown, color: "text-red-500", bg: "bg-red-50" }
                ].map((stat, i) => (
                    <motion.div 
                        key={i}
                        variants={itemVariants}
                        className="bg-white/60 backdrop-blur-xl p-6 rounded-xl-card border border-ai-primary/8 shadow-ai-card flex items-center gap-5"
                    >
                        <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                            <stat.icon className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-ai-primary/40 uppercase tracking-widest mb-1">{stat.title}</p>
                            <p className={`text-2xl font-heading font-bold ${stat.color}`}>{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Top Customer Issues */}
                <motion.div 
                    variants={itemVariants}
                    className="lg:col-span-8 space-y-6"
                >
                    <div className="flex items-center gap-3">
                        <Target className="w-5 h-5 text-ai-secondary" />
                        <h3 className="text-lg font-heading font-bold text-ai-primary">Critical Feedback Vectors</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {insights.topicDistribution?.map((topic, i) => (
                            <div key={i} className="bg-white/40 border border-ai-primary/5 p-5 rounded-xl flex items-center justify-between group hover:bg-white transition-all cursor-default relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-ai-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-ai-bg/50 flex items-center justify-center text-ai-primary/50 group-hover:text-ai-secondary transition-colors">
                                        <AlertCircle className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-ai-primary text-sm">{topic.name}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-ai-secondary">{topic.percentage}%</span>
                                    <div className="w-12 h-1 bg-ai-primary/5 rounded-full mt-1 overflow-hidden">
                                        <div className="h-full bg-ai-secondary" style={{ width: `${topic.percentage}%` }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Keyword Tag Cloud */}
                <motion.div 
                    variants={itemVariants}
                    className="lg:col-span-4 bg-ai-primary rounded-xl-card p-8 shadow-ai-card text-white relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                        <TrendingUp className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 mb-8">Dominant Lexicons</h3>
                        <div className="flex flex-wrap gap-3">
                            {insights.keywords?.map((word, i) => (
                                <motion.span 
                                    key={i}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.5 + (i * 0.05) }}
                                    className={`
                                        px-4 py-1.5 rounded-full font-bold uppercase tracking-tighter border
                                        ${i % 3 === 0 ? 'text-ai-secondary bg-ai-secondary/10 border-ai-secondary/20 text-xs' : 
                                          i % 2 === 0 ? 'text-white/90 bg-white/5 border-white/10 text-[10px]' : 
                                          'text-white/60 bg-white/5 border-white/5 text-[9px]'}
                                    `}
                                >
                                    {word}
                                </motion.span>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Business Improvement Suggestions */}
            <motion.div 
                variants={itemVariants}
                className="bg-white/60 backdrop-blur-xl rounded-xl-card border border-ai-primary/8 shadow-ai-card p-10 relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-ai-secondary via-ai-primary to-ai-secondary opacity-20" />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-4 space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-ai-secondary/10 flex items-center justify-center text-ai-secondary">
                            <Lightbulb className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-heading font-bold text-ai-primary">Strategic Directives</h3>
                        <p className="text-sm text-ai-primary/50 leading-relaxed font-medium">
                            AI-generated business improvements based on multi-dimensional analysis of entire dataset.
                        </p>
                    </div>
                    <div className="lg:col-span-8 space-y-4">
                        {insights.recommendations?.map((rec, i) => (
                            <motion.div 
                                key={i}
                                whileHover={{ x: 10 }}
                                className="flex items-center gap-6 p-5 rounded-2xl bg-ai-bg/30 border border-ai-primary/5 group transition-all"
                            >
                                <div className="text-2xl font-heading font-bold text-ai-secondary opacity-20">0{i+1}</div>
                                <p className="flex-1 text-sm font-bold text-ai-primary/80 group-hover:text-ai-primary transition-colors">
                                    {rec}
                                </p>
                                <ArrowRight className="w-5 h-5 text-ai-secondary opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Feedback;
