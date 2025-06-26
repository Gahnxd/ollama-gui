'use client';

import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { Message } from '@/lib/types';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isUser: boolean;
}

export default function MessageBubble({ message, isUser }: MessageBubbleProps) {
  const [thinkContent, setThinkContent] = useState<string | null>(null);
  const [displayContent, setDisplayContent] = useState<string>(message.content || '');
  const [isThinkingExpanded, setIsThinkingExpanded] = useState<boolean>(false);

  useEffect(() => {
    // Handle the display of content and think content
    if (!isUser && message.content) {
      // First, try to extract think content using regex for complete <think> tags
      const thinkRegex = /<think>([\s\S]*?)<\/think>/s;
      const match = message.content.match(thinkRegex);
      
      if (match && match[1]) {
        // Complete <think></think> tags found
        setThinkContent(match[1].trim());
        
        // Remove the <think> tags and content from the display content
        const cleanedContent = message.content.replace(thinkRegex, '').trim();
        setDisplayContent(cleanedContent);
      } else {
        // Check for unclosed <think> tags
        const openTagIndex = message.content.indexOf('<think>');
        const closeTagIndex = message.content.indexOf('</think>');
        
        if (openTagIndex !== -1) {
          // We have an opening tag
          if (closeTagIndex === -1 || closeTagIndex < openTagIndex) {
            // Only opening tag without proper closing tag
            const beforeTag = message.content.substring(0, openTagIndex).trim();
            const thinkContent = message.content.substring(openTagIndex + 7).trim();
            
            setThinkContent(thinkContent);
            setDisplayContent(beforeTag);
          } else {
            // Both opening and closing tags in correct order
            const beforeTag = message.content.substring(0, openTagIndex).trim();
            const thinkContent = message.content.substring(openTagIndex + 7, closeTagIndex).trim();
            const afterTag = message.content.substring(closeTagIndex + 8).trim();
            
            setThinkContent(thinkContent);
            setDisplayContent(beforeTag + ' ' + afterTag);
          }
        } else if (closeTagIndex !== -1) {
          // Only closing tag without opening tag
          const displayContent = message.content.replace('</think>', '').trim();
          setThinkContent(null);
          setDisplayContent(displayContent);
        } else {
          // No think tags at all
          setThinkContent(null);
          setDisplayContent(message.content);
        }
      }
    } else {
      // For user messages, just display the content
      setThinkContent(null);
      setDisplayContent(message.content || '');
    }
  }, [message.content, isUser]);

  return (
    <div className="flex flex-col">
      {/* Think content displayed as a dropdown above the message bubble */}
      {thinkContent && !isUser && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex justify-start mb-1"
          style={{ padding: '0.5rem 1rem' }}
        >
          <div 
            className="bg-gray-800 rounded-md overflow-hidden"
            style={{ maxWidth: '48%', width: 'fit-content' }}
          >
            {/* Dropdown header - styled like code block header */}
            <button 
              onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
              className="model-button w-full flex items-center justify-between px-3 py-2"
            >
              <div className="flex items-center text">
                <span>Thinking...</span>
              </div>
              {isThinkingExpanded ? 
                <ChevronUp className="text" size={16} /> : 
                <ChevronDown className="text" size={16} />
              }
            </button>
            
            {/* Dropdown content */}
            {isThinkingExpanded && (
              <div 
                className="font-mono bg-gray-900 text-gray-300 overflow-auto rounded-b-md"
                style={{ 
                  padding: '0.75rem 1rem', 
                  maxHeight: '400px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)' 
                }}
              >
                <pre className="whitespace-pre-wrap">
                  <code>{thinkContent}</code>
                </pre>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Regular message bubble */}
      {displayContent !== '' && (<motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex my-1 ${isUser ? 'justify-end' : 'justify-start'}`}
        style={{ padding: '0.5rem 1rem'}}
      >
        <div
          className={`bg-surface/40 border border-white/10`}
          style={{ borderRadius: '2rem', minWidth: '100px', maxWidth: '48%'}}
        >
          <div className="prose prose-invert prose-sm max-w-full" style={{ padding: '1rem 1rem'}}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayContent}</ReactMarkdown>
          </div>
        </div>
      </motion.div>)}
    </div>
  );
}
