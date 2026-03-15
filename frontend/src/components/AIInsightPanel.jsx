import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    Lightbulb,
    ChevronRight,
    CheckCircle2,
    MessageSquareQuote,
    Zap
} from 'lucide-react';
import apiClient from '../api/client';

// Safely coerce to string for render (API may return objects e.g. { recommendation: "..." })
const toDisplayString = (value) => {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (typeof value === 'object') {
        if (value.recommendation != null) return toDisplayString(value.recommendation);
        if (Array.isArray(value)) return value.map(toDisplayString).filter(Boolean).join('. ');
        return Object.values(value).map(toDisplayString).filter(Boolean).join('. ');
    }
    return '';
};

const AIInsightPanel = () => {
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
            console.error('Failed to fetch AI insights:', error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="bg-gradient-to-br from-ai-primary to-ai-secondary rounded-xl-card p-6 text-white shadow-ai-card overflow-hidden relative group"
        >
            {/* Dynamic Glow Background */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-ai-secondary/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-white/10 backdrop-blur-md">
                            <Zap className="w-4 h-4 text-accent-gold" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">AI Executive Summary</span>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={fetchInsights}
                        className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        Refresh
                    </motion.button>
                </div>
                {loading ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-3">
                        <motion.div
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            <Sparkles className="w-8 h-8 text-accent-gold/60" />
                        </motion.div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Synthesizing Narratives...</p>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={insights?.globalSummary}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {/* Insight Summary */}
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <MessageSquareQuote className="w-5 h-5 text-white/40 shrink-0 mt-1" />
                                    <p className="text-base font-heading font-medium leading-relaxed text-white/90">
                                        {toDisplayString(insights?.globalSummary) || "Analyzing customer sentiment and clustering themes..."}
                                    </p>
                                </div>
                            </div>
                            {/* Recommended Actions */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Lightbulb className="w-4 h-4 text-accent-gold" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Strategic Recommendations</span>
                                </div>

                                <div className="space-y-2">
                                    {(Array.isArray(insights?.recommendations) ? insights.recommendations : []).map((rec, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 + index * 0.1 }}
                                            className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group/item"
                                        >
                                            <CheckCircle2 className="w-4 h-4 text-ai-secondary mt-0.5 shrink-0 group-hover/item:scale-110 transition-transform" />
                                            <p className="text-xs text-white/80 font-medium leading-normal">
                                                {toDisplayString(rec)}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                            {/* Footer CTA */}
                            <button className="w-full mt-2 group flex items-center justify-between py-3 px-4 rounded-xl bg-white text-ai-primary font-bold text-[10px] uppercase tracking-widest transition-all hover:bg-accent-gold">
                                <span>Generate Full Report</span>
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
        </motion.div>
    );
};
export default AIInsightPanel;
