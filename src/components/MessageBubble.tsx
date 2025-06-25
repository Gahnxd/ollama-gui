'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { Message } from '@/lib/types';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex my-4 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`p-4 max-w-1/2 bg-surface/40 border border-white/10`}
        style={{ borderRadius: '2rem'}}
      >
        {isUser ? (
          <div className="prose prose-invert prose-sm max-w-full" style={{ padding: '1rem 1rem'}}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
        ) : (
          <div className="prose prose-invert prose-sm max-w-full" style={{ padding: '1rem 1rem'}}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}
