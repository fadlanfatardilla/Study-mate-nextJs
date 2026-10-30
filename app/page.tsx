"use client";

import { useState } from "react";
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  BookOpen,
  Brain,
  Pencil,
  HelpCircle,
  Bot, // Icon Robot untuk Floating Button
  X,   // Icon Tutup Chat
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import FileUploader from "@/components/FileUploader";
import FlashcardDeck from "@/components/FlashcardDeck";
import QuizSimulator from "@/components/QuizSimulator";
import AiTutorChat from "@/components/AiTutorChat";
import AudioPlayer from "@/components/AudioPlayer";
import { StudyMateResponse } from "@/types";

export default function Home() {
  const [data, setData] = useState<StudyMateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false); // State untuk mengontrol popover Chat AI
  const [initialChatQuery, setInitialChatQuery] = useState<string | null>(null); // State untuk menyimpan query dari Smart Quiz Review

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/process-pdf", {
        method: "POST",
        body: formData,
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || "Gagal memproses file PDF ini.");
      }

      setData(resData.data);
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMessage(
        err.message || "Terjadi kesalahan saat memproses dokumen.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setData(null);
    setErrorMessage(null);
    setIsChatOpen(false);
    setInitialChatQuery(null);
  };

  const handleAskTutorFromQuiz = (queryText: string) => {
    setInitialChatQuery(queryText);
    setIsChatOpen(true);
  };

  return (
    <main className="relative min-h-screen w-full bg-[#cbe8f6] text-slate-800 font-sans antialiased selection:bg-sky-200 selection:text-sky-900 overflow-x-hidden flex flex-col justify-between">
      {/* 1. Latar Belakang Gambar Pensil & Awan */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 bg-bottom bg-no-repeat bg-contain md:bg-cover opacity-90"
        style={{
          backgroundImage: `url('/kidaha-pencils-2782840.jpg')`,
        }}
      />

      {/* 2. Header Simetris */}
      <header className="w-full border-b border-white/50 bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-500 text-white flex items-center justify-center shadow-xs">
              <Pencil className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-800 text-base tracking-tight">
              StudyMate{" "}
              <span className="text-sky-600 font-semibold text-xs ml-0.5">
                AI
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-sky-800 bg-sky-100/80 border border-sky-200/60 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Siap Belajar
            </span>
          </div>
        </div>
      </header>

      {/* 3. Area Konten Utama */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 md:py-12 z-10 mb-20">
        {!data ? (
          /* TAMPILAN 1: HERO & FILE UPLOAD */
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="text-center space-y-2 max-w-lg mx-auto">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-sky-700 bg-sky-100/90 px-3 py-1 rounded-full border border-sky-200/60">
                <Sparkles className="w-3.5 h-3.5 text-sky-500" /> Asisten Belajar Cerdas
              </span>
              <h1 className="text-2xl md:text-4xl font-extrabold text-slate-800 tracking-tight leading-snug">
                Pahami Materi Kuliah & PDF <br className="hidden sm:inline" />
                dengan Ringkas & Fun
              </h1>
              <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                Unggah dokumen Anda untuk mendapatkan rangkuman poin penting,
                flashcard otomatis, dan kuis latihan.
              </p>
            </div>

            <div className="p-4 sm:p-6 rounded-3xl bg-white/80 backdrop-blur-md border border-white shadow-xl shadow-sky-900/5 transition-all">
              <FileUploader
                onFileUpload={handleFileUpload}
                isLoading={isLoading}
              />

              {errorMessage && (
                <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-center text-xs font-semibold">
                  ⚠️ {errorMessage}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-white/75 backdrop-blur-md border border-white/80 shadow-xs flex flex-col justify-between">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold mb-2">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Mode ELI5</p>
                  <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                    Penjelasan super simpel tanpa istilah rumit.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/75 backdrop-blur-md border border-white/80 shadow-xs flex flex-col justify-between">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold mb-2">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Flashcard</p>
                  <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                    Kartu memori terstruktur untuk latihan hafalan.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/75 backdrop-blur-md border border-white/80 shadow-xs flex flex-col justify-between">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold mb-2">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Kuis Evaluasi</p>
                  <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                    Uji pemahaman dengan pertanyaan pilihan ganda.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* TAMPILAN 2: RESULT DASHBOARD */
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-white shadow-sm">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleReset}
                  className="h-8 w-8 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <h2 className="font-bold text-xs sm:text-sm text-slate-800 line-clamp-1">
                    {data.summary?.title}
                  </h2>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium">
                    Analisis Berhasil Selesai
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleReset}
                className="h-8 px-3 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold gap-1.5 shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                Ganti Berkas
              </Button>
            </div>

            {/* Tab Navigation (3 Tab Utama) */}
            <Tabs defaultValue="summary" className="w-full space-y-4">
              <TabsList className="bg-white/80 backdrop-blur-md border border-white p-1 rounded-2xl w-full grid grid-cols-3 shadow-xs">
                <TabsTrigger
                  value="summary"
                  className="rounded-xl text-xs font-bold text-slate-500 data-[state=active]:bg-sky-500 data-[state=active]:text-white transition-all py-1.5"
                >
                  Rangkuman
                </TabsTrigger>

                <TabsTrigger
                  value="flashcards"
                  className="rounded-xl text-xs font-bold text-slate-500 data-[state=active]:bg-sky-500 data-[state=active]:text-white transition-all py-1.5"
                >
                  Flashcard ({data.flashcards.length})
                </TabsTrigger>

                <TabsTrigger
                  value="quiz"
                  className="rounded-xl text-xs font-bold text-slate-500 data-[state=active]:bg-sky-500 data-[state=active]:text-white transition-all py-1.5"
                >
                  Kuis ({Math.min(data.quiz.length, 5)} Soal)
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: Rangkuman */}
              <TabsContent value="summary" className="space-y-4">
                <div className="p-5 sm:p-6 rounded-3xl bg-white/85 backdrop-blur-md border border-white shadow-sm space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-200/60 inline-block">
                      Penjelasan Ringkas (ELI5)
                    </span>
                    {/* Tombol Pemutar Audio Suara Tutor */}
                    <AudioPlayer textToSpeak={data.summary.eli5Explanation} />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-1">
                    {data.summary.eli5Explanation}
                  </p>
                </div>

                <div className="p-5 sm:p-6 rounded-3xl bg-white/85 backdrop-blur-md border border-white shadow-sm space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Poin-Poin Kunci
                  </h3>

                  <ul className="space-y-2.5">
                    {data.summary.keyPoints.map((point, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 leading-relaxed"
                      >
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-sky-100 text-sky-700 font-extrabold text-[11px] flex items-center justify-center mt-0.5">
                          {index + 1}
                        </span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              {/* TAB 2: Flashcards */}
              <TabsContent value="flashcards">
                <FlashcardDeck flashcards={data.flashcards} />
              </TabsContent>

              {/* TAB 3: Kuis */}
              <TabsContent value="quiz">
                <QuizSimulator 
                  questions={data.quiz} 
                  onAskTutor={handleAskTutorFromQuiz}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* 4. FLOATING AI TUTOR CHAT (Mengapung di Pojok Kanan Bawah) */}
      {data && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
          {/* Jendela Popover Chat AI */}
          <div
            className={`mb-3 w-[90vw] sm:w-[380px] h-[480px] rounded-3xl shadow-2xl border border-white/80 overflow-hidden bg-white/95 backdrop-blur-lg transition-all duration-200 ${
              isChatOpen ? "block animate-in slide-in-from-bottom-5" : "hidden"
            }`}
          >
            <AiTutorChat
              contextText={`
RANGKUMAN:
${JSON.stringify(data?.summary || {})}

TEKS LENGKAP PDF:
${data?.extractedText || data?.text || ""}
              `}
              initialQuery={initialChatQuery}
              onClose={() => setIsChatOpen(false)}
              onReset={() => setInitialChatQuery(null)}
            />
          </div>

          {/* Tombol Floating Berbentuk Robot (Tanpa Teks) */}
          <Button
            onClick={() => setIsChatOpen(!isChatOpen)}
            size="icon"
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white shadow-xl shadow-sky-500/30 transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center"
          >
            {isChatOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Bot className="w-7 h-7" />
            )}
          </Button>
        </div>
      )}

      {/* Spacer bawah */}
      <div className="h-12 w-full pointer-events-none" />
    </main>
  );
}