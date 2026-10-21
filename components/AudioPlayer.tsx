"use client";

import { useState, useEffect } from "react";
import { Volume2, VolumeX, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioPlayerProps {
  textToSpeak: string;
}

export default function AudioPlayer({ textToSpeak }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      setIsSupported(false);
    }

    // Stop audio jika komponen di-unmount
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePlayPause = () => {
    if (!isSupported) return;

    const synth = window.speechSynthesis;

    // Jika sedang dipause, lanjutkan (resume)
    if (isPaused) {
      synth.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    // Jika sedang main, lakukan pause
    if (isPlaying) {
      synth.pause();
      setIsPaused(true);
      setIsPlaying(false);
      return;
    }

    // Mulai pembacaan baru
    synth.cancel(); // Bersihkan antrean lama

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = "id-ID"; // Bahasa Indonesia
    utterance.rate = 0.95; // Kecepatan bicara (0.1 - 10)
    utterance.pitch = 1; // Nada suara

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    synth.speak(utterance);
    setIsPlaying(true);
  };

  const handleStop = () => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  if (!isSupported) {
    return null; // Sembunyikan jika browser lama tidak mendukung TTS
  }

  return (
    <div className="flex items-center gap-1.5 bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 p-1.5 rounded-2xl">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={handlePlayPause}
        className="h-8 px-2.5 rounded-xl text-sky-700 dark:text-sky-300 hover:bg-sky-100 font-semibold text-xs flex items-center gap-1.5"
      >
        {isPlaying ? (
          <>
            <Pause className="w-3.5 h-3.5 fill-current" /> Pause
          </>
        ) : isPaused ? (
          <>
            <Play className="w-3.5 h-3.5 fill-current" /> Lanjutkan
          </>
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5" /> Dengarkan Audio
          </>
        )}
      </Button>

      {(isPlaying || isPaused) && (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={handleStop}
          title="Hentikan Audio"
          className="h-8 w-8 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50"
        >
          <VolumeX className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}