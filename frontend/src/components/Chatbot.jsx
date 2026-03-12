import React, { useState } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import apiClient from '../api/client';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setError('');

    try {
      setLoading(true);
      const { data } = await apiClient.post('/api/chat', {
        message: userMessage.text,
      });

      const botText =
        data.message ||
        data.response ||
        'The AI service is not fully configured yet. Please ask Shailesh to add an API key.';

      setMessages((prev) => [...prev, { sender: 'ai', text: botText }]);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Unable to get a response from the AI assistant.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">
              AI Medical Chatbot
            </h2>
            <p className="text-xs text-purple-200">
              Ask health-related questions in a secure environment.
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-[250px] max-h-[420px] overflow-y-auto rounded-xl bg-black/30 border border-white/10 p-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-xs text-purple-200">
            This assistant can help you discuss symptoms, ask general medical
            questions, and understand your reports. Avoid sharing personally
            identifiable information.
          </p>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                msg.sender === 'user'
                  ? 'bg-purple-600 text-white rounded-br-sm'
                  : 'bg-white/10 text-purple-50 rounded-bl-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-300 bg-red-500/10 border border-red-500/40 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <form onSubmit={handleSend} className="mt-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your medical question..."
          className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="inline-flex items-center justify-center px-3 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4 mr-1" />
          {loading ? 'Sending' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default Chatbot;

