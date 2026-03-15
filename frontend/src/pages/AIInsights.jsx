import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BrainCircuit,
    FileText,
    Download,
    Sparkles,
    AlertTriangle,
    Lightbulb,
    ArrowRight,
    Loader2,
    CheckCircle2,
    RefreshCw
} from 'lucide-react';
import apiClient from '../api/client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Safely coerce API values to string for rendering (API may return objects e.g. { brandPerception, majorWins, criticalFrictionPoints })
const toDisplayString = (value) => {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (typeof value === 'object') {
        if (Array.isArray(value)) return value.map(toDisplayString).join('. ');
        return Object.values(value).map(toDisplayString).filter(Boolean).join('. ');
    }
    return '';
};

const AIInsights = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const generateReport = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.post('/api/ai/generate-insight-report');
            setReport(response.data);
        } catch (err) {
            console.error('Failed to generate AI report:', err);
            setError(err.response?.data?.error || 'Intelligence engine timeout. Please ensure datasets are uploaded.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        generateReport();
    }, []);

    const downloadPDF = () => {
        if (!report) return;

        const doc = new jsPDF();
        const timestamp = new Date().toLocaleString();

        // Header
        doc.setFillColor(0, 48, 73); // Primary Color
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text('VeriFeedback Intelligence Report', 20, 20);
        doc.setFontSize(10);
        doc.text(`Generated on: ${timestamp}`, 20, 30);

        let yPos = 55;

        // Executive Summary
        doc.setTextColor(0, 48, 73);
        doc.setFontSize(16);
        doc.text('1. Executive Summary', 20, yPos);
        yPos += 10;
        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);
        const summaryText = toDisplayString(report.executiveSummary);
        const splitSummary = doc.splitTextToSize(summaryText || 'No summary available.', 170);
        doc.text(splitSummary, 20, yPos);
        yPos += (splitSummary.length * 6) + 10;

        // Data Summary Table
        doc.setTextColor(0, 48, 73);
        doc.setFontSize(16);
        doc.text('2. Dataset Overview', 20, yPos);
        yPos += 5;

        const ds = report.dataSummary || {};
        const counts = ds.sentimentCounts || {};
        autoTable(doc, {
            startY: yPos,
            head: [['Metric', 'Value']],
            body: [
                ['Total Feedback Entries', ds.totalFeedback ?? 0],
                ['Positive Sentiment', counts.positive ?? 0],
                ['Neutral Sentiment', counts.neutral ?? 0],
                ['Negative Sentiment', counts.negative ?? 0],
            ],
            theme: 'striped',
            headStyles: { fillColor: [0, 48, 73] }
        });
        yPos = doc.lastAutoTable.finalY + 15;

        // Key Business Problems
        doc.setTextColor(214, 40, 40); // Alert Red
        doc.setFontSize(16);
        doc.text('3. Key Business Problems', 20, yPos);
        yPos += 10;
        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);
        (Array.isArray(report.keyBusinessProblems) ? report.keyBusinessProblems : []).forEach(problem => {
            doc.text(`• ${toDisplayString(problem)}`, 25, yPos);
            yPos += 7;
        });
        yPos += 8;

        // Business Recommendations
        doc.setTextColor(46, 125, 91); // Secondary Green
        doc.setFontSize(16);
        doc.text('4. Actionable Recommendations', 20, yPos);
        yPos += 10;
        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);
        (Array.isArray(report.businessRecommendations) ? report.businessRecommendations : []).forEach(rec => {
            doc.text(`• ${toDisplayString(rec)}`, 25, yPos);
            yPos += 7;
        });

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text('VeriFeedback AI - Powered by Gemini Flash', 105, 285, { align: 'center' });

        doc.save(`VeriFeedback_Intelligence_Report_${Date.now()}.pdf`);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.98, y: 10 },
        visible: { opacity: 1, scale: 1, y: 0 }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-ai-secondary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                    <Loader2 className="w-16 h-16 text-ai-primary animate-spin relative z-10" />
                </div>
                <h3 className="text-2xl font-heading font-bold text-ai-primary mt-8">Synthesizing Intelligence...</h3>
                <p className="text-ai-primary/60 mt-2 max-w-sm">Gemini is processing your feedback datasets to generate a comprehensive business report.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="p-8 rounded-3xl bg-red-50 border border-red-100 flex flex-col items-center max-w-lg">
                    <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
                    <h3 className="text-xl font-heading font-bold text-ai-primary">Analysis Interrupted</h3>
                    <p className="text-sm text-ai-primary/60 mt-2 mb-6">{error}</p>
                    <button
                        onClick={generateReport}
                        className="flex items-center gap-2 px-6 py-3 bg-ai-primary text-white rounded-xl shadow-lg hover:bg-ai-primary/90 transition-all font-medium"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Retry Sync
                    </button>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-5xl mx-auto space-y-8 pb-20"
        >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/40 backdrop-blur-xl p-8 rounded-3xl border border-ai-primary/5 shadow-ai-card">
                <div className="flex items-start gap-5">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-ai-primary to-ai-secondary text-white shadow-lg">
                        <BrainCircuit className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-heading font-bold text-ai-primary leading-tight">AI Business Intelligence Report</h2>
                        <div className="flex items-center gap-2 mt-1 font-medium">
                            {report?.isFallback ? (
                                <div className="flex items-center gap-2 text-red-500 bg-red-50 px-3 py-1 rounded-full text-xs">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    <span>Intelligence Filter Applied</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-ai-secondary">
                                    <Sparkles className="w-4 h-4" />
                                    <span>Generated by Gemini Flash 1.5</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={downloadPDF}
                        disabled={!report}
                        className="flex items-center gap-2 px-6 py-3 bg-ai-primary text-white rounded-xl shadow-lg hover:bg-ai-primary/90 transition-all font-bold disabled:opacity-50"
                    >
                        <Download className="w-4 h-4" />
                        Download PDF Report
                    </button>
                </div>
            </div>

            {report && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* 1. Executive Summary */}
                    <motion.div variants={itemVariants} className="md:col-span-2 bg-white/70 backdrop-blur-xl rounded-3xl border border-ai-primary/8 shadow-ai-card p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-ai-secondary/5 rounded-full -mr-20 -mt-20 blur-3xl" />
                        <div className="relative z-10">
                            <h3 className="text-xl font-heading font-bold text-ai-primary mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-ai-secondary" />
                                AI Executive Summary
                            </h3>
                            <p className="text-lg text-ai-primary/80 leading-relaxed font-medium italic">
                                "{toDisplayString(report.executiveSummary)}"
                            </p>
                        </div>
                    </motion.div>

                    {/* 2. Key Business Problems */}
                    <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-xl rounded-3xl border border-red-100 shadow-ai-card p-8">
                        <h3 className="text-xl font-heading font-bold text-ai-primary mb-6 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            Key Business Problems
                        </h3>
                        <ul className="space-y-4">
                            {(Array.isArray(report.keyBusinessProblems) ? report.keyBusinessProblems : []).map((problem, i) => (
                                <li key={i} className="flex items-start gap-4 group">
                                    <div className="mt-1 w-5 h-5 rounded-full bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                    </div>
                                    <span className="text-ai-primary/80 leading-tight">{toDisplayString(problem)}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* 3. Business Recommendations */}
                    <motion.div variants={itemVariants} className="bg-white/70 backdrop-blur-xl rounded-3xl border border-ai-secondary/20 shadow-ai-card p-8">
                        <h3 className="text-xl font-heading font-bold text-ai-primary mb-6 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-ai-secondary" />
                            Improvement Suggestions
                        </h3>
                        <ul className="space-y-4">
                            {(Array.isArray(report.businessRecommendations) ? report.businessRecommendations : []).map((rec, i) => (
                                <li key={i} className="flex items-start gap-4">
                                    <div className="mt-1 p-1 rounded-lg bg-ai-secondary/10 text-ai-secondary shrink-0">
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-ai-primary/80 leading-tight font-medium">{toDisplayString(rec)}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* 4. Future Strategy Suggestions */}
                    <motion.div variants={itemVariants} className="md:col-span-2 bg-gradient-to-br from-ai-primary to-ai-primary/90 text-white rounded-3xl border border-white/10 shadow-xl p-8 overflow-hidden relative">
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-ai-secondary/10 rounded-full -mb-32 -mr-32 blur-3xl" />
                        <div className="relative z-10">
                            <h3 className="text-2xl font-heading font-bold mb-8 flex items-center gap-3">
                                <Lightbulb className="w-7 h-7 text-ai-accent-gold" />
                                Growth & Future Strategy
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {(Array.isArray(report.futureStrategy) ? report.futureStrategy : []).map((strategy, i) => (
                                    <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors cursor-default">
                                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-4 text-ai-accent-gold font-bold">
                                            {i + 1}
                                        </div>
                                        <p className="text-sm opacity-90 leading-relaxed">{toDisplayString(strategy)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                </div>
            )}
        </motion.div>
    );
};

export default AIInsights;
