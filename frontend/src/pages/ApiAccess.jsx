import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Key, 
  Terminal, 
  Copy, 
  Check, 
  RefreshCcw, 
  Trash2, 
  Code2,
  FileCode,
  Globe,
  Lock,
  Zap,
  Cpu,
  Layers
} from 'lucide-react';
import apiClient from '../api/client';

const ApiAccess = () => {
    const [apiKey, setApiKey] = useState(null);
    const [projectName, setProjectName] = useState('');
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);

    useEffect(() => {
        fetchKey();
    }, []);

    const fetchKey = async () => {
        try {
            setFetchLoading(true);
            const response = await apiClient.get('/api/api-key');
            setApiKey(response.data.key);
        } catch (error) {
            // 404 means no key, which is fine
        } finally {
            setFetchLoading(false);
        }
    };

    const generateKey = async () => {
        if (!projectName.trim()) return;
        setLoading(true);
        try {
            const response = await apiClient.post('/api/api-key/generate', { projectName });
            setApiKey(response.data.key);
        } catch (error) {
            console.error('Failed to generate key:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!apiKey) return;
        navigator.clipboard.writeText(apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const revokeKey = async () => {
        if (window.confirm("Are you sure you want to revoke this API key? This action is irreversible.")) {
            try {
                await apiClient.delete('/api/api-key/revoke');
                setApiKey(null);
            } catch (error) {
                console.error('Revoke failed:', error);
            }
        }
    };

    const apiUsageExample = `curl -X POST https://api.lomi.ai/v1/analyze-feedback \\
  -H "x-api-key: ${apiKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Excellent customer support and easy UI."
  }'`;

    return (
        <div className="space-y-8 max-w-5xl mx-auto px-2">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-heading font-bold text-ai-primary flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-ai-secondary/10 text-ai-secondary">
                        <Terminal className="w-8 h-8" />
                    </div>
                    Business API Access
                </h2>
                <p className="text-sm text-ai-primary/50 mt-1 font-medium italic">
                    Seamlessly integrate LOMI's neural analysis models into your business workflow.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Management Column */}
                <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Key Generation Section */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/60 backdrop-blur-xl rounded-xl-card border border-ai-primary/8 shadow-ai-card p-8 flex flex-col justify-between"
                    >
                        <div className="space-y-6">
                            <div className="flex items-center gap-2">
                                <Key className="w-4 h-4 text-ai-secondary" />
                                <h3 className="text-xs font-bold text-ai-primary/60 uppercase tracking-widest">Master Production Key</h3>
                            </div>

                            {!apiKey ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-ai-primary/40 uppercase tracking-widest ml-1">Project Identifier</label>
                                        <input 
                                            type="text"
                                            value={projectName}
                                            onChange={(e) => setProjectName(e.target.value)}
                                            placeholder="e.g. Marketing Dashboard"
                                            className="w-full px-4 py-3 rounded-xl bg-ai-bg/40 border border-ai-primary/10 focus:border-ai-secondary/30 outline-none text-sm"
                                        />
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={generateKey}
                                        disabled={loading || !projectName.trim()}
                                        className="w-full py-4 bg-ai-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                    >
                                        {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                        Generate API Key
                                    </motion.button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="relative group">
                                        <div className="p-4 bg-ai-bg/70 border border-ai-primary/10 rounded-xl font-mono text-xs text-ai-primary font-bold break-all pr-12">
                                            {apiKey}
                                        </div>
                                        <button 
                                            onClick={copyToClipboard}
                                            className="absolute top-1/2 right-3 -translate-y-1/2 p-2 rounded-lg bg-ai-primary text-white hover:bg-ai-secondary transition-colors"
                                        >
                                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={revokeKey} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 text-red-600 text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-all">
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Revoke Master Key
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Example Usage / Documentation */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-ai-primary rounded-xl-card border border-white/5 shadow-ai-card p-8 text-white relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                            <Code2 className="w-32 h-32" />
                        </div>
                        
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-ai-secondary" />
                                <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Global Endpoint Implementation</h3>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="px-3 py-1 bg-ai-secondary text-white rounded-lg text-[10px] font-bold uppercase">POST</div>
                                    <span className="font-mono text-xs text-white/60">/api/v1/analyze-feedback</span>
                                </div>
                                <div className="p-4 bg-black/40 border border-white/5 rounded-xl">
                                    <pre className="text-[11px] font-mono text-white/80 overflow-x-auto leading-relaxed scrollbar-hide">
                                        {apiUsageExample}
                                    </pre>
                                </div>
                                <div className="flex items-center gap-6 pt-2">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-white/20 uppercase">Header Auth</span>
                                        <span className="text-[11px] font-mono text-ai-secondary">x-api-key</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-white/20 uppercase">Content-Type</span>
                                        <span className="text-[11px] font-mono text-ai-secondary">application/json</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Features / Benefits Grid */}
                <div className="lg:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { icon: Cpu, title: "Neural V4 Core", desc: "Latest transformer models for 2026." },
                        { icon: Lock, title: "AES Encryption", desc: "Encrypted at rest and in transit." },
                        { icon: Globe, title: "Global Nodes", desc: "Low latency worldwide endpoints." },
                        { icon: Layers, title: "Versioning", desc: "Long-term support for stable APIs." }
                    ].map((item, i) => (
                        <div key={i} className="p-5 rounded-xl border border-ai-primary/5 bg-white/40 flex flex-col items-center text-center group hover:bg-ai-primary/5 transition-all">
                            <item.icon className="w-6 h-6 text-ai-secondary mb-3 group-hover:scale-110 transition-transform" />
                            <h4 className="text-xs font-bold text-ai-primary mb-1 uppercase tracking-tight">{item.title}</h4>
                            <p className="text-[10px] text-ai-primary/40 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ApiAccess;
