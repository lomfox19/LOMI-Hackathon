import React, { useState } from 'react';
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
  Cpu
} from 'lucide-react';

const ApiAccess = () => {
    const [apiKey, setApiKey] = useState(null);
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(false);

    const generateKey = () => {
        setLoading(true);
        setTimeout(() => {
            const secret = 'sk_live_' + Math.random().toString(36).substr(2, 10) + Math.random().toString(36).substr(2, 10);
            setApiKey(secret);
            setLoading(false);
        }, 800);
    };

    const copyToClipboard = () => {
        if (!apiKey) return;
        navigator.clipboard.writeText(apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const revokeKey = () => {
        if (window.confirm("Are you sure you want to revoke this API key? This action is irreversible.")) {
            setApiKey(null);
        }
    };

    const pythonExample = `import requests

url = "https://api.lomi.ai/v1/analyze"
headers = {
    "Authorization": "Bearer ${apiKey || 'YOUR_API_KEY'}",
    "Content-Type": "application/json"
}
data = {
    "text": "Excellent customer support and easy UI."
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`;

    const jsExample = `const response = await fetch("https://api.lomi.ai/v1/analyze", {
  method: "POST",
  headers: {
    "Authorization": "Bearer ${apiKey || 'YOUR_API_KEY'}",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    text: "Excellent customer support and easy UI."
  })
});

const result = await response.json();
console.log(result);`;

    return (
        <div className="space-y-8 max-w-5xl mx-auto px-2">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-heading font-bold text-ai-primary flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-ai-secondary/10 text-ai-secondary">
                        <Terminal className="w-6 h-6" />
                    </div>
                    Intelligence Web Services
                </h2>
                <p className="text-sm text-ai-primary/50 mt-1 font-medium italic">
                    Integrate our enterprise AI models directly into your custom applications with high-performance API access.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* API Key Management */}
                <div className="lg:col-span-1 space-y-6">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white/60 backdrop-blur-xl rounded-xl-card border border-ai-primary/8 shadow-ai-card p-6"
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <Key className="w-4 h-4 text-ai-secondary" />
                            <h3 className="text-xs font-bold text-ai-primary/60 uppercase tracking-widest">Master API Credentials</h3>
                        </div>

                        {!apiKey ? (
                            <div className="py-6 flex flex-col items-center gap-4 text-center">
                                <div className="p-4 rounded-full bg-ai-primary/5 border border-ai-primary/5 animate-pulse">
                                    <Lock className="w-8 h-8 text-ai-primary/20" />
                                </div>
                                <p className="text-[10px] font-bold text-ai-primary/40 leading-relaxed uppercase tracking-widest">No active keys found</p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={generateKey}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-ai-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:shadow-lg transition-all"
                                >
                                    {loading ? (
                                        <RefreshCcw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Zap className="w-4 h-4" />
                                            Generate Production Key
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="p-4 bg-ai-bg/60 border border-ai-primary/10 rounded-xl break-all">
                                    <p className="text-[11px] font-mono font-bold text-ai-primary leading-relaxed opacity-70">
                                        {apiKey}
                                    </p>
                                </div>
                                
                                <div className="flex gap-2">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={copyToClipboard}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
                                            copied ? 'bg-ai-secondary text-white shadow-lg' : 'bg-ai-primary/5 text-ai-primary hover:bg-ai-primary/10'
                                        }`}
                                    >
                                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                        {copied ? 'Copied' : 'Copy Key'}
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={revokeKey}
                                        className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </motion.button>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Stats Card */}
                    <div className="p-5 rounded-xl border border-ai-primary/5 bg-ai-primary/[0.02] space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-ai-primary/40 uppercase">Latency Average</span>
                            <span className="text-xs font-bold text-ai-secondary">140ms</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-ai-primary/40 uppercase">Monthly Quota</span>
                            <span className="text-xs font-bold text-ai-primary/70">8.2k / 10k</span>
                        </div>
                        <div className="h-1.5 w-full bg-ai-primary/5 rounded-full overflow-hidden">
                            <div className="h-full bg-ai-secondary w-[82%]" />
                        </div>
                    </div>
                </div>

                {/* API Documentation / Examples */}
                <div className="lg:col-span-2 space-y-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-ai-primary rounded-xl-card border border-white/5 shadow-ai-card p-6 overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Code2 className="w-5 h-5 text-ai-secondary" />
                                <h3 className="text-sm font-heading font-bold text-white">Integration Sandbox</h3>
                            </div>
                            <div className="flex gap-2">
                                <div className="px-2 py-0.5 rounded bg-white/5 text-white/40 text-[9px] font-mono border border-white/10 uppercase">v1.2 Stable</div>
                                <div className="px-2 py-0.5 rounded bg-ai-secondary text-white text-[9px] font-bold border border-ai-secondary/20 uppercase">Production SSL</div>
                            </div>
                        </div>

                        {/* Language Selector (Mock) */}
                        <div className="flex gap-4 mb-4">
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest border border-white/10">
                                <FileCode className="w-3.5 h-3.5 text-ai-secondary" /> Python (Requests)
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/40 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">
                                <Globe className="w-3.5 h-3.5" /> Node.js (Fetch)
                            </button>
                        </div>

                        {/* Code Block */}
                        <div className="p-4 bg-black/40 rounded-xl border border-white/5 relative group">
                            <pre className="text-xs font-mono text-white/80 overflow-x-auto leading-relaxed scrollbar-hide py-2">
                                {pythonExample}
                            </pre>
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1.5 rounded bg-white/5 text-white/40 hover:text-white transition-colors">
                                    <Copy className="w-3 h-3" />
                                </button>
                            </div>
                        </div>

                        {/* Parameters Table */}
                        <div className="mt-8 space-y-4">
                            <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] px-1">Global Parameters</h4>
                            <div className="space-y-2">
                                {[
                                    { name: "text", type: "String", req: "Yes", desc: "The feedback content to analyze." },
                                    { name: "features", type: "Array", req: "No", desc: "List of enabled AI modules (fraud, spam, sentiment)." }
                                ].map((param, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                                        <div>
                                            <span className="text-xs font-mono font-bold text-white/90">{param.name}</span>
                                            <span className="text-[9px] text-ai-secondary ml-2 font-bold px-1.5 py-0.5 bg-ai-secondary/10 rounded uppercase">{param.type}</span>
                                        </div>
                                        <div className="text-[10px] font-medium text-white/40 italic">{param.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: Zap, label: "Real-time", val: "<100ms" },
                            { icon: Lock, label: "Security", val: "AES-256" },
                            { icon: Cpu, label: "Model", val: "Neural V4" },
                            { icon: Globe, label: "Scalability", val: "Auto" }
                        ].map((item, i) => (
                            <div key={i} className="p-4 rounded-xl border border-ai-primary/5 bg-white/40 text-center">
                                <item.icon className="w-4 h-4 text-ai-secondary mx-auto mb-2" />
                                <div className="text-[9px] font-bold text-ai-primary/30 uppercase mb-0.5">{item.label}</div>
                                <div className="text-xs font-bold text-ai-primary/70 uppercase tracking-tighter">{item.val}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApiAccess;
