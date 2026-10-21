"use client";

import { useState } from "react";
import { Flashcard } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2 
} from "lucide-react";

interface FlashcardDeckProps {
  flashcards: Flashcard[];
}

export default function FlashcardDeck({ flashcards }: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="p-8 text-center glass-card rounded-3xl border border-white/80 text-slate-500 text-xs font-semibold">
        Belum ada flashcard yang dihasilkan.
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  // Penanganan aman untuk membaca properti front/question dan back/answer
  const questionText = 
    (currentCard as any)?.front || 
    (currentCard as any)?.question || 
    "Pertanyaan tidak tersedia";

  const answerText = 
    (currentCard as any)?.back || 
    (currentCard as any)?.answer || 
    "Jawaban tidak tersedia";

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }, 150);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Visual Progress Bar */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 px-2">
        <span>Kartu {currentIndex + 1} dari {flashcards.length}</span>
        <span>{Math.round(((currentIndex + 1) / flashcards.length) * 100)}% Selesai</span>
      </div>
      
      <div className="w-full bg-slate-200/60 dark:bg-slate-800/60 h-2 rounded-full overflow-hidden p-0.5 backdrop-blur-sm">
        <div 
          className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
        />
      </div>

      {/* 3D Flip Card Container */}
      <div 
        onClick={handleFlip}
        className="perspective-1000 w-full min-h-[320px] cursor-pointer group"
      >
        <div 
          className={`relative w-full h-full min-h-[320px] transition-transform duration-500 transform-style-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* SISI DEPAN: Pertanyaan */}
          <Card className="absolute inset-0 w-full h-full p-8 flex flex-col justify-between backface-hidden glass-card border-2 border-purple-200/60 dark:border-purple-900/50 rounded-3xl shadow-2xl group-hover:border-purple-400/80 transition-colors">
            <div className="flex items-center justify-between">
              <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-200 dark:border-purple-800 font-bold px-3 py-1 rounded-xl gap-1">
                <HelpCircle className="w-3.5 h-3.5" />
                Pertanyaan
              </Badge>
              <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <RotateCw className="w-3 h-3" /> Klik kartu untuk membalik
              </span>
            </div>

            <div className="my-auto py-4 text-center">
              <p className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 leading-snug">
                {questionText}
              </p>
            </div>

            <div className="text-center text-xs text-purple-600/70 dark:text-purple-400/70 font-semibold">
              Tap untuk melihat jawaban ✨
            </div>
          </Card>

          {/* SISI BELAKANG: Jawaban */}
          <Card className="absolute inset-0 w-full h-full p-8 flex flex-col justify-between backface-hidden rotate-y-180 glass-card border-2 border-pink-200/60 dark:border-pink-900/50 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-3xl shadow-2xl">
            <div className="flex items-center justify-between">
              <Badge className="bg-pink-500/10 text-pink-600 dark:text-pink-300 border-pink-200 dark:border-pink-800 font-bold px-3 py-1 rounded-xl gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Jawaban
              </Badge>
              <Sparkles className="w-4 h-4 text-pink-500" />
            </div>

            <div className="my-auto py-4 text-center">
              <p className="text-lg md:text-xl font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
                {answerText}
              </p>
            </div>

            <div className="text-center text-xs text-pink-600/70 dark:text-pink-400/70 font-semibold">
              Tap untuk kembali ke pertanyaan 🔄
            </div>
          </Card>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <Button
          variant="outline"
          onClick={handlePrev}
          className="flex-1 rounded-2xl glass-card py-6 font-bold text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all hover:scale-[1.02] gap-2"
        >
          <ChevronLeft className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          Sebelumnya
        </Button>

        <Button
          variant="outline"
          onClick={handleNext}
          className="flex-1 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none py-6 font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 hover:opacity-95 transition-all hover:scale-[1.02] gap-2"
        >
          Selanjutnya
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}