'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Send, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function TerminalChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '[SPDR-BT] Terminal online. How can I help you navigate the web today, citizen?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '[SPDR-BT] Signal disrupted. The web is tangled. Try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="spdr-panel p-4 mb-6"
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-[#7a0000] pb-2 mb-3">
        <Terminal className="w-5 h-5 text-[#DB231E]" />
        <h2 className="text-white uppercase tracking-wider text-sm font-bold font-mono">
          SPDR-BT Terminal
        </h2>
        <div className="ml-auto flex gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-green-500 font-mono">ONLINE</span>
        </div>
      </div>

      {/* Messages */}
      <div className="h-32 overflow-y-auto mb-3 font-mono text-sm space-y-2 pr-2">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`${msg.role === 'user' ? 'text-[#ff8a8a]' : 'text-[#a3e9a4]'}`}
            >
              <span className="text-[#666]">{msg.role === 'user' ? '> ' : ''}</span>
              {msg.content}
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[#ff8a8a] flex items-center gap-2"
          >
            <Loader2 className="w-3 h-3 animate-spin" />
            <span className="animate-pulse">Processing...</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#DB231E] font-mono">&gt;</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask SPDR-BT anything about NYC..."
            className="w-full bg-black/50 border border-[#7a0000] rounded px-8 py-2 text-white font-mono text-sm focus:outline-none focus:border-[#DB231E] placeholder:text-[#666]"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-[#DB231E] text-white rounded font-mono text-sm uppercase tracking-wider hover:bg-[#ff3333] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </motion.div>
  );
}
