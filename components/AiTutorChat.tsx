"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, User, Send, Loader2, Sparkles, RotateCcw, X } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AiTutorChatProps {
  contextText: string; // Teks PDF / materi yang diekstrak
  initialQuery?: string | null; // Query otomatis dari kuis/ulasan
  onClose?: () => void; // Callback untuk menutup window chat
  onReset?: () => void;
}

export default function AiTutorChat({
  contextText,
  initialQuery,
  onClose,
  onReset,
}: AiTutorChatProps) {
  const initialMessages: Message[] = [
    {
      role: "assistant",
      content:
        "Halo! Aku Matey. Ada bagian dari materi ini yang ingin kamu tanyakan atau minta jelaskan lebih detail?",
    },
  ];

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastProcessedQueryRef = useRef<string | null>(null);

  // Auto-scroll ke pesan terbaru
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handler untuk mereset riwayat percakapan
  const handleResetChat = () => {
    setMessages(initialMessages);
    setInput("");
    setIsLoading(false);
    // Tandai initialQuery saat ini agar useEffect tidak memicu ulang pesan otomatis
    lastProcessedQueryRef.current = initialQuery || null;

    if (onReset) {
      onReset();
    }
  };

  const executeSend = useCallback(async (userMessageText: string) => {
    if (!userMessageText.trim() || isLoading) return;

    const userMessage = userMessageText.trim();
    setInput("");

    // Ambil riwayat percakapan sebelum pesan pengguna terbaru ditambahkan
    const chatHistory = messages.filter((_, index) => index > 0).slice(-8);

    // Update UI dengan pesan pengguna baru
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          contextText: contextText,
          chatHistory: chatHistory,
        }),
      });

      const data = await res.json();

      if (res.ok && data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `⚠️ ${data.error || "Terjadi kesalahan saat menghubungi AI Tutor."}`,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Gagal terhubung ke server. Periksa koneksi internet Anda.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [contextText, isLoading, messages]);

  // Fungsi wrapper untuk tombol kirim manual
  const handleSend = () => {
    executeSend(input);
  };

  // Efek untuk memicu pertanyaan otomatis jika 'initialQuery' dikirim dari QuizSimulator
  useEffect(() => {
    if (initialQuery && initialQuery !== lastProcessedQueryRef.current && !isLoading) {
      lastProcessedQueryRef.current = initialQuery;
      executeSend(initialQuery);
    }
  }, [initialQuery, isLoading, executeSend]);

  return (
    <Card className="max-w-2xl mx-auto rounded-3xl border-2 border-sky-100 dark:border-sky-900/50 bg-white/90 dark:bg-slate-900/90 shadow-xl overflow-hidden flex flex-col h-full">
      {/* Header Chat */}
      <div className="p-4 border-b border-sky-100 dark:border-sky-900/50 bg-sky-50/50 dark:bg-sky-950/30 flex items-center justify-between">
        {/* Sisi Kiri: Icon Bot, Judul & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-md shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              Matey <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </h4>
            <p className="text-[11px] text-slate-500 font-medium">
              Siap membantu menjawab pertanyaan seputar materi ini
            </p>
          </div>
        </div>

        {/* Sisi Kanan: Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleResetChat}
            title="Reset Chat / Sesi Baru"
            aria-label="Reset Chat"
            className="h-8 w-8 text-slate-400 hover:text-sky-600 hover:bg-sky-100/50 dark:hover:bg-sky-900/50 rounded-xl"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>

        </div>
      </div>

      {/* Bubble Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs md:text-sm">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                msg.role === "user"
                  ? "bg-pink-500 text-white"
                  : "bg-sky-500 text-white"
              }`}
            >
              {msg.role === "user" ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>

            <div
              className={`max-w-[80%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-pink-600 text-white rounded-tr-none font-medium"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/50 dark:border-slate-700/50"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-sky-500 text-white flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 p-3.5 rounded-2xl rounded-tl-none flex items-center gap-2 text-slate-500 text-xs font-medium">
              <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
              Matey sedang mengetik jawaban...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-sky-100 dark:border-sky-900/50 bg-white dark:bg-slate-900 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Tanyakan hal yang belum kamu pahami..."
          disabled={isLoading}
          className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs md:text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all disabled:opacity-50"
        />
        <Button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          size="icon"
          className="rounded-2xl bg-sky-500 hover:bg-sky-600 text-white shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}