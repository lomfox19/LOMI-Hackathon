import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudUpload, 
  FileText, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Table,
  Sparkles
} from 'lucide-react';
import apiClient from '../api/client';
const UploadFeedback = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [previewData, setPreviewData] = useState([]);
  const fileInputRef = useRef(null);
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv'))) {
      processFile(droppedFile);
    } else {
      setUploadStatus('error');
    }
  };
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };
  const processFile = (file) => {
    setFile(file);
    setUploadStatus('idle');
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split('\n')
        .filter(row => row.trim() !== '')
        .slice(0, 6)
        .map(row => row.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')));
      setPreviewData(rows);
    };
    reader.readAsText(file);
  };
  const removeFile = () => {
    setFile(null);
    setPreviewData([]);
    setUploadStatus('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const handleUpload = async () => {
    if (!file) return;
    setUploadStatus('uploading');
    const formData = new FormData();
    formData.append('file', file);
    try {
      await apiClient.post('/api/feedback/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadStatus('success');
      // Reset after 3 seconds on success
      setTimeout(() => {
        removeFile();
      }, 3000);
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadStatus('error');
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="bg-white/60 backdrop-blur-xl rounded-xl-card border border-ai-primary/8 shadow-ai-card overflow-hidden"
    >
      <div className="p-6 border-b border-ai-primary/6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-heading font-bold text-ai-primary flex items-center gap-2">
              <CloudUpload className="w-5 h-5 text-ai-secondary" />
              Upload Feedback Data
            </h3>
            <p className="text-sm text-ai-primary/50 mt-1">
              Select or drag your CSV feedback dataset for AI analysis.
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-ai-secondary/10 border border-ai-secondary/20 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-ai-secondary" />
            <span className="text-[10px] font-bold text-ai-secondary uppercase tracking-wider">AI Ready</span>
          </div>
        </div>
      </div>
      <div className="p-6">
        {!file ? (
          <motion.div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            whileHover={{ scale: 1.005 }}
            className={`
              relative cursor-pointer transition-all duration-300
              border-2 border-dashed rounded-xl-card p-12
              flex flex-col items-center justify-center gap-4
              ${isDragging ? 'border-ai-secondary bg-ai-secondary/5' : 'border-ai-primary/10 hover:border-ai-secondary/40 hover:bg-ai-bg/50'}
            `}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".csv"
              className="hidden"
            />
            
            <div className="w-16 h-16 rounded-full bg-ai-secondary/10 flex items-center justify-center text-ai-secondary group">
              <CloudUpload className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
            </div>
            
            <div className="text-center">
              <p className="text-base font-semibold text-ai-primary">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-ai-primary/40 mt-1">
                Supported formats: CSV (up to 20MB)
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* File Info Card */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-ai-bg/40 border border-ai-primary/6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-ai-primary/5 flex items-center justify-center text-ai-primary">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ai-primary truncate max-w-[240px]">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-ai-primary/40 font-medium">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              
              <button
                onClick={removeFile}
                className="p-2 rounded-lg hover:bg-red-50 text-ai-primary/40 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Preview Section */}
            {previewData.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <Table className="w-4 h-4 text-ai-secondary" />
                  <span className="text-xs font-bold text-ai-primary/60 uppercase tracking-widest">Dataset Preview</span>
                </div>
                
                <div className="overflow-x-auto rounded-xl border border-ai-primary/6">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-ai-primary/5">
                        {previewData[0].map((header, i) => (
                          <th key={i} className="px-4 py-3 font-semibold text-ai-primary/70 border-b border-ai-primary/6">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ai-primary/5">
                      {previewData.slice(1).map((row, i) => (
                        <tr key={i} className="hover:bg-ai-bg/30 transition-colors">
                          {row.map((cell, j) => (
                            <td key={j} className="px-4 py-2.5 text-ai-primary/60">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {/* Actions */}
            <div className="flex items-center gap-4 pt-2">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleUpload}
                disabled={uploadStatus === 'uploading'}
                className={`flex-1 relative flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300
                  ${uploadStatus === 'uploading' 
                    ? 'bg-ai-primary/50 cursor-not-allowed' 
                    : uploadStatus === 'success'
                    ? 'bg-ai-secondary text-white'
                    : 'bg-ai-primary text-white hover:shadow-lg hover:shadow-ai-primary/20'}
                `}
              >
                {uploadStatus === 'uploading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing Dataset...
                  </>
                ) : uploadStatus === 'success' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Upload Successful
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-4 h-4" />
                    Analyze with AI
                  </>
                )}
              </motion.button>
              
              <AnimatePresence>
                {uploadStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-2 text-red-500 text-xs font-semibold"
                  >
                    <AlertCircle className="w-4 h-4" />
                    Upload failed. Try again?
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer Info */}
      <div className="bg-ai-bg/30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-5 h-5 rounded-full border border-white bg-ai-primary/10" />
            ))}
          </div>
          <span className="text-[10px] text-ai-primary/40 font-medium">
            Join 2,400+ users analyzing feedback datasets
          </span>
        </div>
        <p className="text-[10px] text-ai-primary/30 italic">
          Files are processed securely.
        </p>
      </div>
    </motion.div>
  );
};
export default UploadFeedback;