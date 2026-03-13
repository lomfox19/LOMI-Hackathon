import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldBan, 
  Search, 
  Trash2, 
  CheckCircle2, 
  MailWarning, 
  Globe,
  Loader2,
  AlertOctagon
} from 'lucide-react';

const SpamDetection = () => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleAnalyze = () => {
        if (!text.trim()) return;
        setLoading(true);
        // Simulate AI Analysis
        setTimeout(() => {
            const isSpam = Math.random() > 0.5;
            setResult({
                isSpam,
                id: Math.random().toString(36).substr(2, 6).toUpperCase(),
                timestamp: new Date().toLocaleTimeString(),
                classification: isSpam ? "Spam Content Detected" : "Legitimate Content Identified"
            });
            setLoading(false);
        }, 1200);
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                <div>
                    <h2 className="text-2xl font-heading font-bold text-ai-primary flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-ai-secondary/10 text-ai-secondary">
                            <ShieldBan className="w-6 h-6" />
                        </div>
                        Spam & Signal Extraction
                    </h2>
                    <p className="text-sm text-ai-primary/50 mt-1 font-medium">
                        Advanced content filtering to remove promotional noise and repetitive spam from feedback streams.
                    </p>
                </div>
                <div className="px-4 py-1.5 rounded-full border border-ai-secondary/20 bg-ai-secondary/10 flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-ai-secondary" />
                    <span className="text-[10px] font-bold text-ai-secondary uppercase tracking-widest">Global Filter Active</span>
                </div>
            </div>

            {/* Content Input */}
            <div className="bg-white/60 backdrop-blur-xl rounded-xl-card border border-ai-primary/8 shadow-ai-card p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-ai-secondary/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-bold text-ai-primary/60 uppercase tracking-widest">
                            Dataset Row for Classification
                        </label>
                        <span className="text-[10px] text-ai-primary/30 font-medium">Analyzing characters: {text.length}</span>
                    </div>

                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Enter feedback or review content to detect spam signatures..."
                        className="w-full h-32 p-4 rounded-xl-card bg-ai-bg/30 border border-ai-primary/10 focus:border-ai-secondary/40 focus:ring-2 focus:ring-ai-secondary/10 outline-none transition-all text-sm leading-relaxed"
                    />

                    <div className="flex justify-end">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleAnalyze}
                            disabled={loading || !text.trim()}
                            className={`
                                flex items-center gap-2 px-10 py-3.5 rounded-xl font-bold text-sm transition-all duration-300
                                ${loading || !text.trim()
                                    ? 'bg-ai-primary/30 cursor-not-allowed text-white/50'
                                    : 'bg-ai-primary text-white hover:shadow-lg hover:shadow-ai-primary/20 hover:scale-105 active:scale-95'}
                            `}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Scanning Metadata...
                                </>
                            ) : (
                                <>
                                    <ShieldBan className="w-4 h-4" />
                                    Execute Classification
                                </>
                            )}
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Classification Result */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-xl-card p-8 border shadow-ai-card flex flex-col md:flex-row items-center gap-8 ${
                            result.isSpam 
                                ? 'bg-red-50/70 border-red-200 text-red-600'
                                : 'bg-ai-secondary/5 border-ai-secondary/20 text-ai-secondary'
                        }`}
                    >
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 ${
                            result.isSpam ? 'bg-red-500/10' : 'bg-ai-secondary/10'
                        }`}>
                            {result.isSpam ? <AlertOctagon className="w-10 h-10" /> : <CheckCircle2 className="w-10 h-10" />}
                        </div>
                        
                        <div className="flex-1 text-center md:text-left space-y-2">
                            <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">Result ID: {result.id}</div>
                            <h3 className="text-2xl font-heading font-bold">{result.classification}</h3>
                            <p className="text-sm font-medium opacity-70">
                                {result.isSpam 
                                    ? "This record contains promotional material or repetitive patterns often associated with spam interaction."
                                    : "This content aligns with standard customer communication models and is categorized as legitimate feedback."}
                            </p>
                            <div className="flex items-center gap-3 pt-2 text-[10px] font-bold opacity-50 uppercase justify-center md:justify-start">
                                <span>Time: {result.timestamp}</span>
                                <span>Confidence: 99.4%</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {result.isSpam && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-3 rounded-xl bg-red-600 text-white shadow-lg shadow-red-200"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </motion.button>
                            )}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setResult(null)}
                                className="p-3 rounded-xl bg-white/80 border border-current text-current font-bold text-xs uppercase tracking-widest px-6"
                            >
                                Clear Analysis
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer Logic Indicators */}
            {!result && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { icon: MailWarning, label: "Pattern Detection", value: "Active" },
                        { icon: Globe, label: "IP Filtering", value: "Verified" },
                        { icon: ShieldBan, label: "Link Scanning", value: "Enabled" },
                        { icon: Search, label: "Domain Lookup", value: "Secured" }
                    ].map((item, i) => (
                        <div key={i} className="p-4 rounded-xl bg-white/40 border border-ai-primary/5 flex items-center gap-3">
                            <item.icon className="w-4 h-4 text-ai-primary/30" />
                            <div className="text-[10px] font-bold uppercase tracking-widest">
                                <span className="text-ai-primary/40 block leading-none mb-1">{item.label}</span>
                                <span className="text-ai-secondary leading-none">{item.value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SpamDetection;
