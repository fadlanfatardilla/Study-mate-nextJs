"use client";

import { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { QuizQuestion } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Trophy, RotateCcw, ArrowRight, Sparkles, Bot } from "lucide-react";

interface QuizSimulatorProps {
  questions: QuizQuestion[];
  onAskTutor?: (queryText: string) => void; // Callback untuk integrasi Smart Quiz Review
}

// Algoritma Acak Array (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function QuizSimulator({ questions, onAskTutor }: QuizSimulatorProps) {
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [usedQuestionIds, setUsedQuestionIds] = useState<(string | number)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Fungsi memilih 5 soal baru yang belum pernah muncul
  const startNewQuizSession = useCallback(() => {
    if (!questions || questions.length === 0) return;

    // Filter soal yang belum pernah dipakai
    let availablePool = questions.filter(
      (q) => !usedQuestionIds.includes(q.id || q.question)
    );

    // Jika bank soal yang belum dipakai kurang dari 5, reset history
    if (availablePool.length < 5) {
      availablePool = [...questions];
      setUsedQuestionIds([]);
    }

    // Acak pool soal dan ambil 5 soal
    const randomized = shuffleArray(availablePool);
    const selectedFive = randomized.slice(0, 5);

    // Catat ID soal yang baru saja dipakai
    const newUsedIds = selectedFive.map((q) => q.id || q.question);
    setUsedQuestionIds((prev) => [...prev, ...newUsedIds]);

    setActiveQuestions(selectedFive);
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setIsAnswered(false);
    setIsFinished(false);
  }, [questions, usedQuestionIds]);

  // Inisialisasi awal saat materi diunggah
  useEffect(() => {
    if (questions && questions.length > 0 && activeQuestions.length === 0) {
      const randomized = shuffleArray(questions);
      const selectedFive = randomized.slice(0, 5);
      const initialIds = selectedFive.map((q) => q.id || q.question);

      setActiveQuestions(selectedFive);
      setUsedQuestionIds(initialIds);
    }
  }, [questions, activeQuestions.length]);

  if (!activeQuestions || activeQuestions.length === 0) {
    return <p className="text-center text-slate-500 py-8">Tidak ada kuis tersedia.</p>;
  }

  const currentQ = activeQuestions[currentIndex];
  const progressPercent = ((currentIndex + 1) / activeQuestions.length) * 100;

  const correctOptionIndex = Number(
    (currentQ as any)?.correctAnswer ?? (currentQ as any)?.answerIndex ?? 0
  );

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === correctOptionIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < activeQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleRestart = () => {
    startNewQuizSession();
  };

  const handleAskAI = () => {
    if (!onAskTutor || selectedOption === null) return;

    const userChoiceText = currentQ.options[selectedOption] || "Tidak memilih";
    const correctChoiceText = currentQ.options[correctOptionIndex] || "Jawaban tepat";

    const promptText = `Halo Matey, saya ingin bertanya tentang soal kuis berikut:

Pertanyaan: "${currentQ.question}"
Jawaban Saya: "${userChoiceText}"
Jawaban Benar: "${correctChoiceText}"

Pembahasan Singkat: ${currentQ.explanation || "Tidak ada pembahasan"}

Bisakah kamu menjelaskan lebih detail kenapa jawaban tersebut yang benar dan bagaimana konsep dasarnya?`;

    onAskTutor(promptText);
  };

  // Tampilan Setelah Kuis Selesai
  if (isFinished) {
    const finalScorePercent = Math.round((score / activeQuestions.length) * 100);

    return (
      <Card className="max-w-xl mx-auto p-8 rounded-3xl border-2 border-pink-100 dark:border-pink-900/50 bg-white dark:bg-slate-900 shadow-xl text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
          <Trophy className="w-10 h-10 animate-bounce" />
        </div>

        <div className="space-y-2">
          <Badge className="bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-300 border-none font-bold px-3 py-1 text-xs">
            Kuis Selesai! 🎉
          </Badge>
          <h3 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
            Skor Kamu: {finalScorePercent}%
          </h3>
          <p className="text-slate-500 text-sm font-medium">
            Kamu berhasil menjawab <span className="text-emerald-600 font-bold">{score}</span> dari {activeQuestions.length} soal dengan benar!
          </p>
        </div>

        <Button
          onClick={handleRestart}
          size="lg"
          className="rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold gap-2 shadow-md w-full sm:w-auto px-8"
        >
          <RotateCcw className="w-5 h-5" /> Coba Kuis Lagi
        </Button>
      </Card>
    );
  }

  // Tampilan Soal Kuis
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Bar Header */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
          <span>Soal {currentIndex + 1} dari {activeQuestions.length}</span>
          <span className="text-pink-600 dark:text-pink-400 font-bold">Skor: {score}</span>
        </div>
        <Progress value={progressPercent} className="h-2.5 rounded-full bg-pink-100 dark:bg-pink-950" />
      </div>

      {/* Main Question Card */}
      <Card className="p-6 md:p-8 rounded-3xl border-2 border-pink-100 dark:border-pink-900/50 bg-white/90 dark:bg-slate-900/90 shadow-xl space-y-6">
        <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 leading-snug">
          {currentQ.question}
        </h3>

        {/* Options List */}
        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
            let buttonStyle = "border-slate-200 dark:border-slate-800 hover:border-pink-300 hover:bg-pink-50/50 dark:hover:bg-slate-800";

            if (isAnswered) {
              if (idx === correctOptionIndex) {
                buttonStyle = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold";
              } else if (idx === selectedOption) {
                buttonStyle = "border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(idx)}
                disabled={isAnswered}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 flex items-center justify-between gap-3 text-sm font-medium ${buttonStyle}`}
              >
                <span>{option}</span>
                {isAnswered && idx === correctOptionIndex && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                )}
                {isAnswered && idx === selectedOption && idx !== correctOptionIndex && (
                  <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation Card & AI Tutor Action after Answered */}
        {isAnswered && (
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-3 animate-in fade-in duration-200">
            <div className="space-y-1">
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Pembahasan:
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                {currentQ.explanation}
              </p>
            </div>

            {/* Tombol Smart Quiz Review */}
            {onAskTutor && (
              <div className="pt-2 border-t border-indigo-100 dark:border-indigo-900/30 flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAskAI}
                  className="rounded-xl border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 text-sky-700 dark:text-sky-300 font-semibold text-xs gap-1.5"
                >
                  <Bot className="w-3.5 h-3.5 text-sky-600" /> Tanya Matey
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Next Question Button */}
        {isAnswered && (
          <div className="text-right pt-2 animate-in slide-in-from-bottom-2 duration-200">
            <Button
              onClick={handleNext}
              size="lg"
              className="rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-bold gap-2 shadow-md w-full sm:w-auto"
            >
              {currentIndex + 1 < activeQuestions.length ? "Soal Berikutnya" : "Lihat Hasil Akhir"}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}