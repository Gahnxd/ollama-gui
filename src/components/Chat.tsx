'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Message, LLMStats, ModelChatHistory, Document } from '@/lib/types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { motion, useAnimation } from 'framer-motion';
import FileUploader, { UploadedFile } from './FileUploader';
import { Upload, X } from 'lucide-react';
import getFileIcon from './FileIcon';

interface ChatProps {
  model: string;
  onNewStats: (stats: LLMStats) => void;
  chatHistory: ModelChatHistory;
  setChatHistory: React.Dispatch<React.SetStateAction<ModelChatHistory>>;
}

export default function Chat({ model, onNewStats, chatHistory, setChatHistory }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [textAreaDocs, setTextAreaDocs] = useState<Document[]>([]);
  const [messageDocs, setMessageDocs] = useState<Document[][]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const textareaAnimation = useAnimation();
  const shineAnimation = useAnimation();
  const [init, setInit] = useState(true);

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (container) {
      const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 1;
      setUserHasScrolled(!isAtBottom);
    }
  };

  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      if (!userHasScrolled) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [messages, isTyping, userHasScrolled]);

  useEffect(() => {
    if (model && init) {
      const existingMessages = chatHistory[model] || [];
      setMessages(existingMessages);
      setIsTyping(false);
      setUserHasScrolled(false);
      setMessageDocs([]);
      setInit(false);
    }
  }, [model, chatHistory, init]);
  
  useEffect(() => {
    if (model && messages.length > 0) {
        setChatHistory(prev => ({
          ...prev,
          [model]: messages
        }));
    }
  }, [messages, model, setChatHistory]);

  const handleFileUpload = async (files: UploadedFile[]) => {
    const uploadedDocuments: Document[] = [];
    
    for (const file of files) {
      const formData = new FormData();
      
      // Create a file object from the uploaded file data
      const fileBlob = new Blob([file.content || ''], { type: file.type });
      formData.append('file', fileBlob, file.name);
      
      console.log(`Uploading ${file.name}`);
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            uploadedDocuments.push({
              id: data.file.id,
              name: data.file.name,
              size: data.file.size,
              type: data.file.type,
              path: data.file.path
            });
          }
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
    
    if (uploadedDocuments.length > 0) {
      // Update documents
      const updatedDocuments = [...documents, ...uploadedDocuments];
      setDocuments(updatedDocuments);
      setTextAreaDocs(updatedDocuments);
      
      // Hide uploader after successful upload
      setShowUploader(false);
    }
  };
  
  const handleRemoveDocument = (id: string) => {
    const updatedDocuments = documents.filter(doc => doc.id !== id);
    
    const timer = setTimeout(() => {
      setDocuments(updatedDocuments);
      setTextAreaDocs(updatedDocuments);
    }, 250);
    
    return () => clearTimeout(timer);
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
    
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const selection = window.getSelection();
      if ((e.metaKey || e.ctrlKey) && selection && selection.toString().length > 0) {
        e.stopPropagation();
        
        if (document.activeElement === textareaRef.current && 
            ['c', 'x', 'a'].includes(e.key.toLowerCase())) {
          return;
        }
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown, true);
    
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown, true);
    };
  }, []);

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

    onNewStats({
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      tokensPerSecond: 0,
      modelName: model
    });

    setUserHasScrolled(false);

    const userMessage: Message = { role: 'user', content: input, id: `user-${Date.now()}` };
    
    // Update messages with the user message
    setMessages(currentMessages => [...currentMessages, userMessage]);
    
    setChatHistory(prevHistory => ({
      ...prevHistory,
      [model]: [...(prevHistory[model] || []), userMessage]
    }));

    setMessageDocs((prev) => [...prev, documents]);

    // Clear documents after sending
    if (documents.length > 0) {
      setDocuments([]);
      setTextAreaDocs([]);
    }
    
    setInput('');
    setIsTyping(true);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages: [...messages, userMessage], documents }),
    });

    if (!response.body) {
      setIsTyping(false);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const assistantMessageId = `assistant-${Date.now()}`;
    
    // Add an empty assistant message that will be updated with content
    setMessages(currentMessages => [...currentMessages, { 
      role: 'assistant', 
      content: '', 
      id: assistantMessageId, 
      streaming: true 
    }]);
    
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
          const newContent = parsed.message.content;
          outputTokens++;
          
          // Update the assistant message with new content
          setMessages(currentMessages => {
            const lastIndex = currentMessages.length - 1;
            if (lastIndex >= 0) {
              const updatedMessages = [...currentMessages];
              updatedMessages[lastIndex] = {
                ...updatedMessages[lastIndex],
                content: updatedMessages[lastIndex].content + newContent
              };
              return updatedMessages;
            }
            return currentMessages;
          });
        }

        if (parsed.done) {
          updateAllStats(parsed);
          setIsTyping(false);
          
          // Mark message as no longer streaming when done
          setMessages(currentMessages => {
            const lastIndex = currentMessages.length - 1;
            if (lastIndex >= 0) {
              const updatedMessages = [...currentMessages];
              updatedMessages[lastIndex] = {
                ...updatedMessages[lastIndex],
                streaming: false
              };
              return updatedMessages;
            }
            return currentMessages;
          });
          
          // Update chat history with the final message in a separate effect
          setTimeout(() => {
            const assistantMessage = messages[messages.length - 1];
            if (assistantMessage) {
              setChatHistory(prev => ({
                ...prev,
                [model]: [...(prev[model] || []), assistantMessage]
              }));
            }
            setMessageDocs((prev) => [...prev, []]);
          }, 100);
          
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
            style={{ position: 'relative', borderRadius: '2rem', maxWidth: '100%', width: 'auto', height: 'fit-content', bottom: '60px'}}
          >
            <h1 className="text-3xl font-bold mb-2">You are using <span className="text-accent">{model}</span></h1>
            <h2 className="text-1xl mb-8 text-white/80">What&apos;s on your mind?</h2>
          </motion.div>
        </div>
      ) : (
        <div ref={chatContainerRef} onScroll={handleScroll} className="flex-1 p-4 space-y-4 overflow-y-auto" style={{ paddingBottom: '140px', paddingTop: '10px' }}>
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} isUser={msg.role === 'user'} documents={messageDocs[i]||[]} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      )}
      
      {/* File uploader modal */}
      {showUploader && (
        <div className="justify-center items-center" style={{width: 'fit-content', height: 'fit-content', position: 'absolute', bottom: '25%', left: '50%', transform: 'translateX(-50%)'}}>
          <div 
            className="messageBubbleGlass rounded-lg w-fit max-w-md"
            style={{ position: 'relative', borderRadius: '2rem', maxWidth: '100%', width: 'auto', height: 'fit-content'}}
          >
            <div className="flex flex-col justify-center items-center w-full" style={{ padding: '1rem' }}>
              <div className="flex items-center w-full mb-4" style={{ justifyContent: 'center' }}>
                <h3 className="text-lg font-medium text-white">
                  Upload Documents
                </h3>
                <motion.div 
                  onClick={() => {
                    setTimeout(() => {
                      setShowUploader(false);
                    }, 180);
                  }}
                  className="glassContainer model-button rounded-full cursor-pointer hover:bg-gray-800/80 transition-colors"
                  style={{ color: 'rgba(255, 255, 255, 0.90)', width: '30px', height: '30px', position: 'absolute', right: '10px', top: '10px' }}
                  whileTap={{scale: 0.2}}
                  transition={{
                    duration: 0.2,
                    ease: "easeInOut"
                  }}
                >
                  <X size={20} />
                </motion.div>
              </div>
              <FileUploader onFileUpload={handleFileUpload} />
            </div>
          </div>
        </div>
      )}
      
      <div className="justify-center items-center" style={{ height: 'fit-content', width: '600px', position: 'absolute', bottom: '-20px', left: '50%', transform: 'translateX(-50%)' }}>
        <div className="flex flex-col items-center w-full" style={{ maxWidth: '600px', height: 'fit-content' }}>
          <div className="flex justify-left w-full mb-4 scroll-smooth" style={{ gap: '7px', overflowX: 'scroll', whiteSpace: 'nowrap', paddingBottom: '10px' }}>
            {textAreaDocs.map((doc, index) => (
                <div
                  key={index}
                  className="messageBubbleGlass flex items-center justify-between"
                  style={{
                    justifyContent: 'center',
                    width: 'auto',
                    minWidth: 'fit-content',
                    paddingTop: '0.5rem',
                    paddingBottom: '0.5rem',
                    paddingLeft: '5px',
                    paddingRight: '10px',
                  }}
                >
                  <div className="text-accent" style={{ paddingLeft: '10px' }}>{getFileIcon(doc.type)}</div>
                  <span 
                    className="overflow-hidden overflow-ellipsis bg-transparent" 
                    style={{ 
                      color: 'rgba(255, 255, 255, 0.70)',
                      paddingRight: '30px', 
                      paddingLeft: '5px', 
                      fontSize: '12px' 
                    }}
                  >
                    {doc.name}
                  </span>
                  <motion.div 
                    onClick={() => handleRemoveDocument(doc.id)}
                    className="glassContainer model-button cursor-pointer rounded-full"
                    aria-label="Copy code"
                    style={{ 
                      color: 'rgba(255, 255, 255, 0.90)', 
                      width: '20px', 
                      height: '20px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      position: 'absolute', 
                      right: '7px' 
                    }}
                    whileTap={{scale: 0.4}}
                    transition={{
                      duration: 0.2,
                      ease: "easeInOut"
                    }}
                  >
                    <X size={15} />
                  </motion.div>
                </div>
              ))}
          </div>
          <motion.div
            animate={textareaAnimation}
            className="flex justify-center items-center p-2 w-full"
            style={{ marginBottom: '50px', marginTop: '0' }}
          >
            <div className="messageBubbleGlass" style={{ position: 'relative', overflow: 'hidden', width: '100%', maxHeight: '144px', height: 'auto', minHeight: '60px'}}>
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
                    scale: [0.99, 0.98, 1],
                    transition: { duration: 0.3, ease: 'easeInOut' }
                  });
                  shineAnimation.start({
                    x: '100%',
                    transition: { duration: 0.3, ease: 'easeInOut' }
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
                onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                  // Only handle Enter key for sending message
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
                  zIndex: 1,
                }}
                rows={1}
              />
            </div>
            
            <motion.div 
              onClick={() => {
                setTimeout(() => {
                  setShowUploader(prev => !prev)
                }, 180);
              }}
              className="messageBubbleGlass model-button ml-2 p-3 rounded-full cursor-pointer hover:bg-gray-800/80 transition-colors"
              aria-label="Attach files"
              style={{ color: 'white', padding: '0.15rem', width: '60px', height: '48px', left: '1em' }}
              whileTap={{scale: 0.2}}
              transition={{
                duration: 0.2,
                ease: "easeInOut"
              }}
            >
              <Upload size={18} />
            </motion.div>

        </motion.div>
      </div>
      <svg style={{ display: 'none' }}>
        <filter id="message-glass" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="0.01" result="blur" />
          <feDisplacementMap in="SourceGraphic" in2="blur" scale="10" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
    </div>
  </div>
  );
}