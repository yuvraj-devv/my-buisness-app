"use client";

import { useState, useRef } from "react";
import { Send } from "lucide-react";

type ChatInputProps = {
  onSend: (message: string) => void;
  disabled?: boolean;
};

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="flex items-end gap-2 border-t border-zinc-100 p-3 bg-white">
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything..."
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none bg-transparent text-[13px] text-zinc-900 placeholder:text-zinc-400 outline-none min-h-[36px] max-h-[80px] py-2"
      />
      <button
        onClick={handleSubmit}
        disabled={!value.trim() || disabled}
        className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-white transition-colors disabled:opacity-30 flex-shrink-0"
      >
        <Send className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
