"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X } from "lucide-react";
import { ChatMessage, TypingIndicator } from "./chat-message";
import { ChatInput } from "./chat-input";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ChatWidgetProps = {
  businessName: string;
  businessType: string;
  businessSlug: string;
  role?: "customer" | "admin";
};

const getSuggestions = (role: "customer" | "admin", industry: string) => {
  if (role === "admin") {
    return [
      "What are my dashboard stats?",
      "Show recent bookings",
      "How do I edit my services?",
    ];
  }
  
  const ind = (industry || "").toLowerCase();
  if (ind.includes("health") || ind.includes("clinic") || ind.includes("doctor")) {
    return [
      "What medical services do you offer?",
      "How do I book an appointment?",
      "What are your checkup prices?",
    ];
  }
  if (ind.includes("restaurant") || ind.includes("cafe") || ind.includes("food") || ind.includes("dine")) {
    return [
      "How do I book a table?",
      "What categories of food do you serve?",
      "Where are you located?",
    ];
  }
  return [
    "What services are available?",
    "How do I book an appointment?",
    "What are your prices?",
  ];
};

export function ChatWidget({ 
  businessName, 
  businessType, 
  businessSlug, 
  role = "customer" 
}: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load welcome message dynamically based on role
  useEffect(() => {
    const welcome = role === "admin"
      ? `Hi! I'm Bizi, your Admin Co-Pilot. I can answer questions about your bookings, dashboard metrics, or help you navigate your settings. What would you like to know?`
      : `Hi! I'm Bizi, the AI Assistant for ${businessName}. How can I help you today? I can answer questions about our services, hours, or help you with your booking.`;
    setMessages([{ role: "assistant", content: welcome }]);
  }, [role, businessName]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const suggestions = getSuggestions(role, businessType);

  async function handleSend(content: string) {
    const newMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setLoading(true);
    setShowSuggestions(false); // Hide suggestions once user chats

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: newMessages, 
          businessName, 
          businessType, 
          businessSlug,
          role 
        }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "I'm sorry, I'm having trouble responding right now. Please try again shortly." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-zinc-900 dark:bg-zinc-800 text-white flex items-center justify-center shadow-lg shadow-zinc-900/20 z-50 border border-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors cursor-pointer print:hidden"
            aria-label="Chat with Bizi"
          >
            <Bot className="w-6 h-6 animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 w-[380px] h-[520px] rounded-2xl overflow-hidden z-50 flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl print:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-150/40 dark:border-zinc-800 bg-zinc-900 dark:bg-zinc-950 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-zinc-800 dark:bg-zinc-900 flex items-center justify-center border border-zinc-750 dark:border-zinc-800">
                  <Bot className="w-4.5 h-4.5 text-zinc-100" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">
                    {role === "admin" ? "Bizi Admin Co-Pilot" : "Bizi AI Assistant"}
                  </h3>
                  <p className="text-[10px] text-zinc-400">
                    {role === "admin" ? "Operations Intelligence" : businessName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-zinc-50/50 dark:bg-zinc-900/10"
            >
              {messages.map((msg, i) => (
                <ChatMessage key={i} role={msg.role} content={msg.content} />
              ))}
              {loading && <TypingIndicator />}
            </div>

            {/* Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="px-4 py-2 flex flex-wrap gap-1.5 bg-zinc-50/50 dark:bg-zinc-950/20 border-t border-zinc-200/40 dark:border-zinc-800/40">
                {suggestions.map((sug) => (
                  <button
                    key={sug}
                    onClick={() => handleSend(sug)}
                    className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full px-2.5 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-850 hover:border-zinc-300 transition-all text-left cursor-pointer shadow-2xs"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <ChatInput onSend={handleSend} disabled={loading} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
