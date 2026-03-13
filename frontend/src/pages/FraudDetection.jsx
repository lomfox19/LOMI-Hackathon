import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Fingerprint, 
  Zap,
  Loader2
} from 'lucide-react';

const FraudDetection = () => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleAnalyze = () => {
        if (!text.trim()) return;
        setLoading(true);
        // Simulate AI Analysis
        setTimeout(() => {
            const isFake = Math.random() > 0.5;
            const probability = Math.floor(Math.random() * 40) + (isFake ? 60 : 10);
            setResult({
                isFake,
                probability,
                timestamp: new Date().toLocaleTimeString(),
                id: Math.random().toString(36).substr(2, 9).toUpperCase()
            });
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-heading font-bold text-ai-primary flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-ai-secondary/10 text-ai-secondary">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        Feedback Authenticity Analysis
                    </h2>
                    <p className="text-sm text-ai-primary/50 mt-1 font-medium">
                        AI-powered fraud detection to identify manipulated or incentivized customer narratives.
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-ai-primary/5 border border-ai-primary/10">
                    <Fingerprint className="w-4 h-4 text-ai-primary/40" />
                    <span className="text-[10px] font-bold text-ai-primary/60 uppercase tracking-widest">Neural Engine V2.4</span>
                </div>
            </div>

            {/* Input Card */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/60 backdrop-blur-xl rounded-xl-card border border-ai-primary/8 shadow-ai-card p-6"
            >
                <div className="space-y-4">
                    <label className="block text-xs font-bold text-ai-primary/60 uppercase tracking-widest ml-1">
                        Input Review Text for Verification
                    </label>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Paste the feedback content here to analyze its authenticity profile..."
                        className="w-full h-40 p-4 rounded-xl bg-ai-bg/30 border border-ai-primary/10 focus:border-ai-secondary/40 focus:ring-2 focus:ring-ai-secondary/10 outline-none transition-all text-sm leading-relaxed"
                    />
                    <div className="flex items-center justify-end">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleAnalyze}
                            disabled={loading || !text.trim()}
                            className={`
                                flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all duration-300
                                ${loading || !text.trim() 
                                    ? 'bg-ai-primary/30 cursor-not-allowed text-white/50' 
                                    : 'bg-ai-primary text-white hover:shadow-lg hover:shadow-ai-primary/20'}
                            `}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Synthesizing Entropy...
                                </>
                            ) : (
                                <>
                                    <Search className="w-4 h-4" />
                                    Deconstruct Authenticity
                                </>
                            )}
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* Results Section */}
            <AnimatePresence mode='wait'>
                {result && (
                    <motion.div
                        key={result.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {/* Probability Card */}
                        <div className="md:col-span-2 bg-white/60 backdrop-blur-xl rounded-xl-card border border-ai-primary/8 shadow-ai-card p-6 flex flex-col justify-between relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-xs font-bold text-ai-primary/40 uppercase tracking-widest mb-6">Risk Assessment</h3>
                                <div className="flex items-center gap-6">
                                    <div className="relative w-24 h-24">
                                        <svg className="w-full h-full" viewBox="0 0 36 36">
                                            <path
                                                className="text-ai-primary/5"
                                                strokeDasharray="100, 100"
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                fill="none"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                            <motion.path
                                                initial={{ strokeDasharray: "0, 100" }}
                                                animate={{ strokeDasharray: `${result.probability}, 100` }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                className={result.isFake ? "text-red-500" : "text-ai-secondary"}
                                                stroke="currentColor"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                fill="none"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-xl font-heading font-bold text-ai-primary">{result.probability}%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className={`text-lg font-heading font-bold mb-1 ${result.isFake ? 'text-red-600' : 'text-ai-secondary'}`}>
                                            {result.isFake ? 'High Fraud Probability' : 'Authentic Interaction'}
                                        </div>
                                        <p className="text-xs text-ai-primary/60 max-w-xs">
                                            {result.isFake 
                                                ? 'Patterns detected suggest this review may be generated by AI or an incentivized actor.'
                                                : 'Language complexity and context align with verified human interaction profiles.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/* Decorative signal lines */}
                            <div className="absolute top-0 right-0 w-32 h-full opacity-[0.03] pointer-events-none">
                                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0 20h100M0 40h100M0 60h100" stroke="#0F3D2E" strokeWidth="1" fill="none"/>
                                </svg>
                            </div>
                        </div>

                        {/* Status Card */}
                        <div className={`rounded-xl-card p-6 border shadow-ai-card flex flex-col items-center justify-center text-center gap-4 ${
                            result.isFake 
                                ? 'bg-red-50/50 border-red-200 text-red-600' 
                                : 'bg-ai-secondary/5 border-ai-secondary/20 text-ai-secondary'
                        }`}>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                result.isFake ? 'bg-red-500/10' : 'bg-ai-secondary/10'
                            }`}>
                                {result.isFake ? <ShieldAlert className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                            </div>
                            <div>
                                <h4 className="font-bold text-sm uppercase tracking-widest mb-1">Status</h4>
                                <div className="text-xl font-heading font-bold">
                                    {result.isFake ? 'REJECTED' : 'VERIFIED'}
                                </div>
                            </div>
                            <div className="text-[10px] opacity-60 font-medium">
                                Analysis ID: {result.id}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Information Grid */}
            {!result && !loading && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                    {[
                        { icon: Zap, title: "Linguistic Entropy", desc: "Analyzing word patterns for unnatural sequences." },
                        { icon: AlertTriangle, title: "Sentiment Inconsistency", desc: "Detecting emotional shifts common in fake reviews." },
                        { icon: CheckCircle2, title: "Context Verification", desc: "Cross-referencing claims against known domain facts." }
                    ].map((item, i) => (
                        <div key={i} className="p-5 rounded-xl border border-ai-primary/5 bg-white/30 backdrop-blur-sm">
                            <item.icon className="w-5 h-5 text-ai-secondary mb-3" />
                            <h4 className="text-xs font-bold text-ai-primary mb-1 uppercase tracking-tight">{item.title}</h4>
                            <p className="text-[10px] text-ai-primary/50 leading-relaxed font-medium">{item.desc}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FraudDetection;
