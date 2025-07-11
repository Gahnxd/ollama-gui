'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Message, LLMStats } from '@/lib/types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { motion, useAnimation } from 'framer-motion';


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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const textareaAnimation = useAnimation();
  const shineAnimation = useAnimation();



  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (container) {
      const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 1; // +1 for tolerance
      setUserHasScrolled(!isAtBottom);
    }
  };

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      // Scroll to bottom only if user hasn't scrolled up
      if (!userHasScrolled) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [messages, isTyping, userHasScrolled]);

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;

      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }
      
      if (event.key.length === 1 || event.key === 'Backspace') {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

    const handleSend = async () => {
    if (!input.trim() || !model) return;

    // Reset stats when a new message is sent
    onNewStats({
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      tokensPerSecond: 0,
    });

    // Re-enable auto-scrolling when a new message is sent
    setUserHasScrolled(false);

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages: [...messages, userMessage] }),
    });

    if (!response.body) {
      setIsTyping(false);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let assistantMessage = '';
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);
    
    const startTime = performance.now();
    let inputTokens = 0;
    let outputTokens = 0;
    let totalEvalDuration = 0;
    
    const updateAllStats = (parsed: {
      eval_count?: number;
      eval_duration?: number;
      prompt_eval_count?: number;
      prompt_eval_duration?: number;
    }) => {
      let tokensPerSecond = 0;
      if (parsed.prompt_eval_count && parsed.prompt_eval_duration) {
        inputTokens = parsed.prompt_eval_count;
      }
      if (parsed.eval_count && parsed.eval_duration) {
        outputTokens = parsed.eval_count;
        totalEvalDuration = parsed.eval_duration;
        if (totalEvalDuration > 0) {
          tokensPerSecond = outputTokens / (totalEvalDuration / 1e9);
        }
      } else if (outputTokens > 0) {
        const elapsedSeconds = (performance.now() - startTime) / 1000;
        if (elapsedSeconds > 0) {
          tokensPerSecond = outputTokens / elapsedSeconds;
        }
      }
      
      tokensPerSecond = isNaN(tokensPerSecond) ? 0 : Math.round(tokensPerSecond * 100) / 100;
      const totalTokens = outputTokens + inputTokens;
      
      onNewStats({
        tokensPerSecond,
        totalTokens,
        inputTokens,
        outputTokens,
        modelName: model
      });
    };

    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        setIsTyping(false);
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim() === '') continue;
        const parsed = JSON.parse(line);
        
        if (parsed.message && parsed.message.content) {
          assistantMessage += parsed.message.content;
          outputTokens++; 
          setMessages((prev) =>
            prev.map((msg, i) =>
              i === prev.length - 1
                ? { ...msg, content: assistantMessage }
                : msg
            )
          );
        }

        if (parsed.done) {
          updateAllStats(parsed);
          setIsTyping(false);
          return;
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
            className="max-w-lg"
          >
            <h1 className="text-3xl font-bold mb-2">You are using <span className="text-accent">{model}</span></h1>
            <h2 className="text-1xl mb-8 text-white/80">What&apos;s on your mind?</h2>
          </motion.div>
        </div>
      ) : (
        <div ref={chatContainerRef} onScroll={handleScroll} className="flex-1 p-4 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} isUser={msg.role === 'user'} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      )}
      
      <div className="p-6 flex justify-center items-center">
        <motion.div
          animate={textareaAnimation}
          className="flex justify-center items-center p-2"
          style={{width: '700px', marginBottom: '50px', marginTop: '50px'}}
        >
          <div className="w-full glassContainer" style={{ position: 'relative', overflow: 'hidden', maxHeight: '144px', height: 'auto', minHeight: '60px' }}>
            <motion.div
              animate={shineAnimation}
              onAnimationComplete={() => shineAnimation.set({ x: '-100%' })}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                background: 'linear-gradient(to right, transparent 20%, rgba(255, 255, 255, 0.05) 30%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.05) 70%, transparent 80%)',
                x: '-100%',
                zIndex: 0,
              }}
            />
            <textarea
              onFocus={() => {
                textareaAnimation.start({
                  scale: [1, 1.03, 1],
                  transition: { duration: 0.3, ease: 'easeOut' }
                });
                shineAnimation.start({
                  x: '100%',
                  transition: { duration: 0.6, ease: 'easeInOut' }
                });
              }}
              ref={(el) => {
                textareaRef.current = el;
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
                color: 'rgba(255, 255, 255, 0.90)',
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
                transition: 'height 0.1s ease',
                position: 'relative',
                zIndex: 1
              }}
              rows={1}
            />
          </div>
        </motion.div>
      </div>
      <svg style={{ display: 'none' }}>
      <filter id="container-glass" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="92" result="noise" />
        <feGaussianBlur in="noise" stdDeviation="0.05" result="blur" />
        <feDisplacementMap in="SourceGraphic" in2="blur" scale="50" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
    </div>
  );
}