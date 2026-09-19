"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Mic, Sparkles } from "lucide-react";
import { MarkdownMessage } from "@/components/chat/markdown-message";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  reasoning?: string;
};

const SUGGESTIONS = [
  "Tell me about Victory",
  "What are his core skills?",
  "What is his experience?",
];

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.concat(userMsg).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to send message");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let firstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        if (firstChunk) {
          setIsLoading(false);
          firstChunk = false;
          // Add empty placeholder message for the stream to populate
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: "",
              reasoning: "",
            },
          ]);
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // keep incomplete line

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            
            if (data.r) {
              setMessages((prev) => {
                const newPrev = [...prev];
                const last = newPrev[newPrev.length - 1];
                if (last.role === "assistant") {
                  last.reasoning = (last.reasoning || "") + data.r;
                }
                return newPrev;
              });
            }
            if (data.c) {
              setMessages((prev) => {
                const newPrev = [...prev];
                const last = newPrev[newPrev.length - 1];
                if (last.role === "assistant") {
                  last.content = (last.content || "") + data.c;
                }
                return newPrev;
              });
            }
          } catch {
            // ignore partial JSON parses
          }
        }
      }
    } catch (error) {
      console.warn("Chat error:", error);
      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, I'm having trouble connecting right now. Please try again later.",
        },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend(input);
    }
  };

  return (
    <>
      {/* Floating Action Button (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(true)}
              className="bg-[#ff5c00] hover:bg-[#ff5c00]/90 text-white p-4 rounded-full shadow-[0_0_20px_rgba(255,92,0,0.4)] transition-colors flex items-center justify-center"
            >
              <MessageCircle className="w-6 h-6" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[350px] max-w-[calc(100vw-3rem)] h-[550px] max-h-[calc(100vh-6rem)] bg-[#0a0604]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 pb-4 flex items-center justify-between border-b border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff5c00]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#ff5c00] to-amber-400 flex items-center justify-center p-0.5">
                  <div className="w-full h-full bg-[#0a0604] rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#ff5c00]" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-white/90">Victory&apos;s Assistant</h3>
                  <p className="text-xs text-white/50">Online & ready to help</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="relative z-10 p-2 text-white/50 hover:text-white/80 transition-colors bg-white/5 rounded-full hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6 mt-4">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight text-white/90">
                      Hi there!
                    </h2>
                    <p className="text-sm text-white/50">
                      How can I help you today?
                    </p>
                  </div>
                  
                  <div className="w-full space-y-2 pt-4">
                    <p className="text-xs font-medium text-white/30 uppercase tracking-wider text-left pl-1 mb-3">
                      Suggestions
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTIONS.map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(suggestion)}
                          className="bg-white/5 hover:bg-[#ff5c00]/20 border border-white/10 hover:border-[#ff5c00]/50 transition-all text-xs text-white/70 py-2 px-3 rounded-full text-left"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={msg.id}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div className={`flex flex-col gap-1.5 max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                        {msg.reasoning && msg.role === "assistant" && (
                          <details className="text-xs text-white/50 bg-white/5 border border-white/10 rounded-lg p-2 max-w-full cursor-pointer [&>summary]:list-none [&>summary::-webkit-details-marker]:hidden">
                            <summary className="flex items-center gap-2 hover:text-white/80 transition-colors">
                              <Sparkles className="w-3 h-3 text-[#ff5c00]" />
                              {msg.content ? "Thought Process" : "Thinking..."}
                            </summary>
                            <div className="mt-2 pl-4 border-l border-white/10 ml-1.5">
                              <MarkdownMessage content={msg.reasoning} />
                            </div>
                          </details>
                        )}
                        
                        {msg.content && (
                          <div
                            className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                              msg.role === "user"
                                ? "bg-[#ff5c00] text-white rounded-tr-sm"
                                : "bg-white/10 text-white/90 rounded-tl-sm"
                            }`}
                          >
                            {msg.role === "assistant" ? (
                              <MarkdownMessage content={msg.content} />
                            ) : (
                              <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                        <span className="text-xs text-white/50 italic mr-1">Thinking...</span>
                        <div className="flex gap-1.5">
                          <div className="w-1.5 h-1.5 bg-[#ff5c00]/80 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-1.5 h-1.5 bg-[#ff5c00]/80 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-1.5 h-1.5 bg-[#ff5c00]/80 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 pt-2 border-t border-white/5 bg-[#0a0604]/80 backdrop-blur-md">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="w-full bg-white/5 border border-white/10 rounded-full pl-5 pr-24 py-3 text-sm text-white/90 placeholder:text-white/30 focus:outline-none focus:border-[#ff5c00]/50 transition-colors"
                  disabled={isLoading}
                />
                
                <div className="absolute right-2 flex items-center gap-1">
                  <button 
                    className="p-2 text-white/30 hover:text-white/60 transition-colors"
                    title="Voice input not supported yet"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleSend(input)}
                    disabled={!input.trim() || isLoading}
                    className="w-8 h-8 flex items-center justify-center bg-[#ff5c00] hover:bg-[#ff5c00]/90 disabled:bg-white/10 disabled:text-white/30 text-white rounded-full transition-colors shadow-lg shadow-[#ff5c00]/20 disabled:shadow-none"
                  >
                    <Send className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
