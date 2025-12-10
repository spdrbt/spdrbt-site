'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Radio } from 'lucide-react';

interface NewsData {
  articles: Array<{
    title: string;
    link: string;
    date: string;
  }>;
  vibe: {
    text: string;
    className: string;
  };
}

export function NewsWidget() {
  const [news, setNews] = useState<NewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch('/api/news');
        if (!res.ok) throw new Error('Failed to fetch news');
        const data = await res.json();
        setNews(data);
      } catch (err) {
        setError('News data unavailable');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
    const interval = setInterval(fetchNews, 600000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="spdr-panel p-5 flex flex-col min-h-[400px]">
        <h2 className="text-white uppercase tracking-wider border-b-2 border-[#7a0000] pb-2 mb-4 text-lg">
          News
        </h2>
        <div className="space-y-3 flex-grow">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-14 w-full rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="spdr-panel p-5 flex flex-col min-h-[400px]">
        <h2 className="text-white uppercase tracking-wider border-b-2 border-[#7a0000] pb-2 mb-4 text-lg">
          News
        </h2>
        <div className="text-[#cc0000] text-center py-8">
          Comms Jammed (Source Offline)
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="spdr-panel p-5 flex flex-col"
    >
      <h2 className="text-white uppercase tracking-wider border-b-2 border-[#7a0000] pb-2 mb-4 text-lg">
        News
      </h2>

      {/* News List */}
      <ul className="max-h-[400px] overflow-y-auto pr-2 flex-grow space-y-3">
        <AnimatePresence>
          {news.articles.slice(0, 10).map((article, index) => (
            <motion.li
              key={article.link}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group"
            >
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:bg-red-900/20 rounded p-2 transition-colors"
              >
                <span className="text-[#ff7b7b] font-bold group-hover:text-white transition-colors flex items-start gap-2">
                  <ExternalLink className="w-4 h-4 mt-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="flex-1">{article.title}</span>
                </span>
                <span className="text-xs text-[#b33939] block mt-1 ml-6">
                  {article.date}
                </span>
              </a>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {/* Source Footer */}
      <div className="text-xs text-[#ff8a8a] mt-4 pt-2 border-t border-[#4d0000]">
        Source: The Daily Bugle
      </div>

      {/* Radio Uplink */}
      <div className="mt-4 pt-4 border-t-2 border-[#7a0000]">
        <span className="text-xs text-white font-bold tracking-wider uppercase flex items-center gap-2 mb-2">
          <Radio className="w-4 h-4 text-[#ff5c5c]" />
          Public Data Uplink (WNYC 93.9)
        </span>
        <audio controls preload="none" className="w-full">
          <source src="https://fm939.wnyc.org/wnycfm" type="audio/mpeg" />
          Your browser does not support the radio uplink.
        </audio>
      </div>

      {/* City Vibe */}
      <div className="mt-4 pt-4 border-t border-[#4d0000] text-center">
        <div className="text-sm text-[#ff8a8a] uppercase tracking-wider">
          NYC is Feeling
        </div>
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className={`text-2xl font-bold mt-1 ${news.vibe.className}`}
        >
          {news.vibe.text}
        </motion.div>
      </div>
    </motion.div>
  );
}
