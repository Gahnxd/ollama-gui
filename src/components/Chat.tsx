'use client';

import { useState, useRef, useEffect } from 'react';
import { Message, LLMStats } from '@/lib/types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { motion } from 'framer-motion';

interface ChatProps {
  model: string;
  onNewStats: (stats: LLMStats) => void;
}

export default function Chat({ model, onNewStats }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || !model) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages: [...messages, userMessage], stream: true }),
    });

    if (!response.body) {
      setIsTyping(false);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let assistantMessage = '';
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        setIsTyping(false);
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        const parsed = JSON.parse(line);
        if (parsed.done) {
          const tokensPerSecond = parsed.eval_count / (parsed.eval_duration / 1e9);
          const totalTokens = parsed.eval_count;
          onNewStats({ tokensPerSecond, totalTokens });
        } else {
          assistantMessage += parsed.message.content;
          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { role: 'assistant', content: assistantMessage };
            return newMessages;
          });
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background text-primary">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md"
          >
            <h1 className="text-3xl font-bold mb-2">You are using <span className="text-accent">{model}</span></h1>
            <h2 className="text-1xl mb-8 text-white/80">What&apos;s on your mind?</h2>
          </motion.div>
        </div>
      ) : (
        <div ref={chatContainerRef} className="flex-1 p-4 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      )}
      
      <div className="p-6 flex justify-center items-center">
        <div style={{ width: '700px', marginBottom: '50px', marginTop: '50px'}}>
          <div className="w-full bg-black/30 border border-white/10 overflow-hidden" style={{ borderRadius: '2rem', maxHeight: '144px'}}>
            <textarea
              ref={(el) => {
                if (el) {
                  // Initial height adjustment
                  setTimeout(() => {
                    const lineHeight = 24; // Approximate line height
                    const maxHeight = lineHeight * 6; // 6 lines max
                    
                    // Reset height to content
                    el.style.height = 'auto';
                    
                    // Set new height, capped at maxHeight
                    if (el.scrollHeight <= maxHeight) {
                      el.style.height = el.scrollHeight + 'px';
                      el.style.overflowY = 'hidden';
                    } else {
                      el.style.height = maxHeight + 'px';
                      el.style.overflowY = 'auto';
                    }
                  }, 0);
                }
              }}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                
                const lineHeight = 24; // Approximate line height
                const maxHeight = lineHeight * 6; // 6 lines max
                
                // Reset height to content
                e.target.style.height = 'auto';
                
                // Set new height, capped at maxHeight
                if (e.target.scrollHeight <= maxHeight) {
                  e.target.style.height = e.target.scrollHeight + 'px';
                  e.target.style.overflowY = 'hidden';
                } else {
                  e.target.style.height = maxHeight + 'px';
                  e.target.style.overflowY = 'auto';
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="bg-transparent text-white w-full resize-none focus:outline-none"
              placeholder="Ask me anything"
              style={{ 
                color: 'white', 
                padding: '1em 1em',
                minHeight: '24px',     /* Start with single line height */
                maxHeight: '144px',    /* Max height (6 lines at 24px) */
                boxSizing: 'border-box',
                display: 'block',
                width: '95%',
                height: '90%',
                margin: '0 auto',
                border: 'none',
                lineHeight: '24px',    /* Consistent line height */
                transition: 'height 0.1s ease'
              }}
              rows={1}
            />
          </div>
        </div>
      </div>
    </div>
  );
}