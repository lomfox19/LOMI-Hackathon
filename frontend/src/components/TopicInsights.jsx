import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, ArrowRight, Tag } from 'lucide-react';
import apiClient from '../api/client';
const TopicInsights = ({ topics: externalTopics }) => {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (externalTopics) {
            // Calculate percentages if we have counts
            const total = externalTopics.reduce((acc, t) => acc + t.count, 0) || 1;
            const normalized = externalTopics.map(t => ({
                name: t.name,
                percentage: ((t.count / total) * 100).toFixed(1)
            }));
            setTopics(normalized);
            setLoading(false);
        } else {
            fetchTopics();
        }
    }, [externalTopics]);

    const fetchTopics = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/api/feedback/insights');
            setTopics(response.data.topicDistribution || []);
        } catch (error) {
            console.error('Failed to fetch topic insights:', error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="bg-white/60 backdrop-blur-xl rounded-xl-card border border-ai-primary/8 shadow-ai-card p-6 flex flex-col h-full"
        >
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-heading font-bold text-ai-primary flex items-center gap-2">
                        <Layers className="w-5 h-5 text-ai-secondary" />
                        Top AI Detected Topics
                    </h3>
                    <p className="text-xs text-ai-primary/50 mt-1 font-medium italic">
                        Clustered themes from customer narratives
                    </p>
                </div>
                <button
                    onClick={fetchTopics}
                    className="p-1.5 rounded-lg hover:bg-ai-secondary/5 text-ai-primary/30 hover:text-ai-secondary transition-colors"
                >
                    <Tag className="w-4 h-4" />
                </button>
            </div>
            <div className="flex-1 space-y-5">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-48 space-y-4">
                        <div className="w-full h-2 bg-ai-primary/5 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-ai-secondary"
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            />
                        </div>
                        <p className="text-[10px] font-bold text-ai-primary/30 uppercase tracking-widest">Scanning Entities...</p>
                    </div>
                ) : topics.length > 0 ? (
                    topics.map((topic, index) => (
                        <motion.div
                            key={topic.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="group cursor-default"
                        >
                            <div className="flex items-center justify-between mb-1.5 px-1">
                                <span className="text-xs font-bold text-ai-primary/80 group-hover:text-ai-secondary transition-colors">
                                    {topic.name}
                                </span>
                                <span className="text-[10px] font-bold text-ai-primary/40">
                                    {topic.percentage}%
                                </span>
                            </div>

                            <div className="relative h-2 w-full bg-ai-primary/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${topic.percentage}%` }}
                                    transition={{ duration: 1, delay: 0.5 + index * 0.1, ease: "easeOut" }}
                                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-ai-secondary/60 to-ai-secondary rounded-full shadow-[0_0_8px_rgba(46,125,91,0.3)]"
                                />
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-ai-primary/5 rounded-xl">
                        <p className="text-xs text-ai-primary/30">No topics analyzed yet</p>
                    </div>
                )}
            </div>
            <div className="mt-6 pt-4 border-t border-ai-primary/5">
                <button className="w-full group flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-ai-primary/5 border border-ai-primary/5 hover:bg-ai-primary/10 transition-all duration-300">
                    <span className="text-[10px] font-bold text-ai-primary/60 uppercase tracking-widest">Explore All Clusters</span>
                    <ArrowRight className="w-3.5 h-3.5 text-ai-primary/40 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </motion.div>
    );
};
export default TopicInsights;