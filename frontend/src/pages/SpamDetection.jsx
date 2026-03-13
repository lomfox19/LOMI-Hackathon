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
  AlertOctagon,
  FilePlus,
  RefreshCw,
  Tag,
  SignalHigh
} from 'lucide-react';
import apiClient from '../api/client';

const SpamDetection = () => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [file, setFile] = useState(null);

    const handleAnalyze = async () => {
        if (!text.trim() && !file) return;
        setLoading(true);
        try {
            const response = await apiClient.post('/api/ai/spam-detection', { text });
            setResult(response.data);
        } catch (error) {
            console.error('Spam analysis failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.name.endsWith('.csv')) {
            setFile(selectedFile);
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto px-2">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-heading font-bold text-ai-primary flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-ai-secondary/10 text-ai-secondary">
                            <ShieldBan className="w-8 h-8" />
                        </div>
                        Spam Feedback Detection
                    </h2>
                    <p className="text-sm text-ai-primary/50 mt-1 font-medium italic">
                        Enterprise-grade filtering to separate high-value feedback from promotional noise.
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-ai-primary/5 border border-ai-primary/10">
                    <SignalHigh className="w-3.5 h-3.5 text-ai-secondary animate-pulse" />
                    <span className="text-[10px] font-bold text-ai-primary/60 uppercase tracking-widest">Global Filter: Enabled</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Inputs */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Manual Text Input */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/60 backdrop-blur-xl rounded-xl-card border border-ai-primary/8 shadow-ai-card p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-[10px] font-bold text-ai-primary/60 uppercase tracking-widest">Content Classification Engine</label>
                            <span className="text-[10px] text-ai-primary/30 font-bold uppercase tracking-widest">{text.length} chars</span>
                        </div>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Analyze feedback content for spam signatures..."
                            className="w-full h-48 p-4 rounded-xl bg-ai-bg/20 border border-ai-primary/10 focus:border-ai-secondary/30 outline-none text-sm leading-relaxed mb-4"
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={handleAnalyze}
                                disabled={loading || !text.trim()}
                                className="px-10 py-3 bg-ai-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                Analyze Feedback
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: File & Stats */}
                <div className="lg:col-span-4 space-y-8">
                    {/* CSV Section */}
                    <div className="bg-ai-primary rounded-xl-card p-6 text-white shadow-ai-card flex flex-col items-center text-center gap-4 border border-white/5">
                        <div className="p-3 rounded-full bg-white/10">
                            <FilePlus className="w-6 h-6 text-ai-secondary" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-white/60">Batch Processing</h4>
                            <p className="text-lg font-heading font-medium mt-1">CSV Stream Upload</p>
                        </div>
                        <label className="w-full cursor-pointer py-3 rounded-xl bg-white text-ai-primary font-bold text-[10px] uppercase tracking-widest hover:bg-ai-secondary hover:text-white transition-all">
                            {file ? file.name : 'Select Dataset'}
                            <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
                        </label>
                        {file && (
                            <button onClick={() => setFile(null)} className="text-[9px] font-bold text-white/40 uppercase hover:text-white transition-colors">Cancel Upload</button>
                        )}
                    </div>

                    {/* Meta Indicators */}
                    <div className="p-6 rounded-xl border border-ai-primary/5 bg-white/40 space-y-4">
                        {[
                            { icon: MailWarning, label: "Pattern Registry", val: "1.2M Signatures" },
                            { icon: Globe, label: "Global Blacklist", val: "Syncing..." }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <item.icon className="w-4 h-4 text-ai-primary/30" />
                                <div>
                                    <p className="text-[9px] font-bold text-ai-primary/30 uppercase">{item.label}</p>
                                    <p className="text-xs font-bold text-ai-primary/70">{item.val}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Results UI */}
                <AnimatePresence>
                    {result && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="lg:col-span-12"
                        >
                            <div className={`rounded-xl-card p-8 border shadow-ai-card flex flex-col md:flex-row items-center gap-10 overflow-hidden relative ${
                                result.isSpam ? 'bg-red-50/80 border-red-200' : 'bg-ai-secondary/5 border-ai-secondary/20'
                            }`}>
                                <div className={`w-24 h-24 rounded-2xl flex items-center justify-center shrink-0 ${
                                    result.isSpam ? 'bg-red-500/10 text-red-600' : 'bg-ai-secondary/10 text-ai-secondary'
                                }`}>
                                    {result.isSpam ? <AlertOctagon className="w-12 h-12" /> : <CheckCircle2 className="w-12 h-12" />}
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                            result.isSpam ? 'bg-red-600 text-white' : 'bg-ai-secondary text-white'
                                        }`}>
                                            {result.isSpam ? 'Spam Detected' : 'No Spam Detected'}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <RefreshCw className="w-3.5 h-3.5 text-ai-primary/30" />
                                            <span className="text-[10px] font-bold text-ai-primary/40 uppercase tracking-widest">Confidence Score: <span className="text-ai-primary">{result.confidence}%</span></span>
                                        </div>
                                    </div>
                                    <h3 className={`text-3xl font-heading font-bold ${result.isSpam ? 'text-red-600' : 'text-ai-primary'}`}>
                                        {result.classification}
                                    </h3>
                                    
                                    {/* Suspicious Keywords */}
                                    {result.keywords?.length > 0 && (
                                        <div className="pt-4 space-y-3 border-t border-ai-primary/5">
                                            <p className="text-[10px] font-bold text-ai-primary/40 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <Tag className="w-3 h-3" /> Suspicious Markers Detected
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {result.keywords.map(kw => (
                                                    <span key={kw} className="px-3 py-1 bg-red-500/10 text-red-600 border border-red-500/20 rounded-lg text-xs font-bold uppercase tracking-tighter">
                                                        {kw}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-3">
                                    {result.isSpam && (
                                        <button className="p-4 rounded-xl bg-red-600 text-white shadow-lg hover:shadow-red-200 transition-all active:scale-95">
                                            <Trash2 className="w-6 h-6" />
                                        </button>
                                    )}
                                    <button onClick={() => setResult(null)} className="p-4 rounded-xl bg-white/50 border border-ai-primary/10 text-ai-primary hover:bg-white transition-all active:scale-95">
                                        <RefreshCw className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SpamDetection;
