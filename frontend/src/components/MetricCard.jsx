import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
const MetricCard = ({ title, value, icon: Icon, trend, trendValue, index }) => {
    const isPositiveTrend = trend === 'up';
    const isNeutralTrend = trend === 'neutral';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1, duration: 0.45 }}
            whileHover={{
                y: -5,
                boxShadow: '0 25px 50px -12px rgba(15, 61, 46, 0.25)',
                borderColor: 'rgba(46, 125, 91, 0.3)'
            }}
            className="relative overflow-hidden rounded-xl-card p-6
                 bg-white/70 backdrop-blur-xl border border-ai-primary/10
                 shadow-ai-card transition-all duration-300 cursor-default group"
        >
            {/* Decorative Background Element */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-ai-secondary/5 rounded-full blur-2xl group-hover:bg-ai-secondary/10 transition-colors duration-500" />

            <div className="flex flex-col h-full justify-between relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-ai-bg/80 border border-ai-primary/5 shadow-inner group-hover:scale-110 transition-transform duration-300">
                        <Icon className="w-5 h-5 text-ai-secondary" />
                    </div>

                    {trendValue && (
                        <motion.div
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold
                ${isPositiveTrend ? 'bg-ai-secondary/10 text-ai-secondary' :
                                    isNeutralTrend ? 'bg-ai-primary/5 text-ai-primary/60' : 'bg-red-50 text-red-500'}`}
                        >
                            {!isNeutralTrend && (isPositiveTrend ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)}
                            {trendValue}
                        </motion.div>
                    )}
                </div>
                <div>
                    <h3 className="text-xs font-semibold text-ai-primary/50 uppercase tracking-widest mb-1">
                        {title}
                    </h3>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-heading font-bold text-ai-primary tracking-tight">
                            {value}
                        </p>
                    </div>
                </div>
            </div>

            {/* AI Pulse Bottom Line */}
            <motion.div
                className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-ai-secondary/40 to-transparent w-full"
                animate={{
                    opacity: [0.3, 0.6, 0.3],
                    x: [-100, 100],
                }}
                transition={{
                    duration: 3 + index,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />
        </motion.div>
    );
};
export default MetricCard;