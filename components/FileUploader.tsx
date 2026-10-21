"use client";

import { useState, ChangeEvent, DragEvent } from "react";
import { UploadCloud, Sparkles, FileText, BrainCircuit, Zap, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

export default function FileUploader({ onFileUpload, isLoading }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]?.type === "application/pdf") {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]?.type === "application/pdf") {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-8">
      {/* Hero Badge & Title */}
      <div className="text-center space-y-4">
        <Badge className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-extrabold text-xs shadow-lg shadow-orange-500/20 gap-1.5 border-none">
          <Sparkles className="w-4 h-4 fill-white animate-spin" />
          BELAJAR JADI 10X LEBIH SERU
        </Badge>
        
        <h1 className="text-4xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
          Smart StudyMate
        </h1>
        
        <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto font-medium">
          Ubah PDF buku atau catatan kuliahmu jadi kuis interaktif, flashcards 3D, dan rangkuman santai secara otomatis! 🪄
        </p>
      </div>

      {/* Main Glassmorphism Upload Card */}
      <Card className="glass-card p-6 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden border-2 border-indigo-100/50">
        {/* Glow Blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-400/20 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-3 border-dashed rounded-[2rem] p-8 text-center transition-all duration-300 cursor-pointer flex flex-col items-center justify-center min-h-[280px] ${
            dragActive
              ? "border-indigo-500 bg-indigo-500/10 scale-[1.01]"
              : selectedFile
              ? "border-emerald-400 bg-emerald-500/10"
              : "border-indigo-200 dark:border-indigo-800/80 hover:border-purple-400 hover:bg-indigo-50/40"
          }`}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleChange}
            disabled={isLoading}
            className="hidden"
            id="pdf-upload-input"
          />

          <label htmlFor="pdf-upload-input" className="cursor-pointer w-full flex flex-col items-center">
            {selectedFile ? (
              <div className="space-y-3">
                <div className="w-20 h-20 rounded-3xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30 animate-bounce">
                  <FileText className="w-10 h-10" />
                </div>
                <p className="font-extrabold text-slate-800 dark:text-slate-100 text-lg">
                  {selectedFile.name}
                </p>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 font-bold">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Siap diolah!
                </Badge>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/30 hover-bounce">
                  <UploadCloud className="w-10 h-10" />
                </div>
                <div>
                  <p className="text-xl font-black text-slate-800 dark:text-slate-100">
                    Tarik PDF Materi di Sini
                  </p>
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    atau <span className="text-indigo-600 font-bold underline">klik untuk pilih file</span> dari HP / PC
                  </p>
                </div>
              </div>
            )}
          </label>
        </div>

        {/* Action Button */}
        {selectedFile && (
          <div className="mt-8 text-center">
            <Button
              onClick={() => onFileUpload(selectedFile)}
              disabled={isLoading}
              size="lg"
              className="w-full sm:w-auto px-10 py-7 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-black text-lg shadow-xl shadow-purple-500/30 hover:opacity-95 hover:scale-[1.02] transition-all gap-3"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Membaca PDF...
                </>
              ) : (
                <>
                  <Zap className="w-6 h-6 fill-amber-300 text-amber-300 animate-pulse" />
                  Sulap Jadi Materi Belajar!
                </>
              )}
            </Button>
          </div>
        )}
      </Card>

      {/* Modern Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "Mode ELI5", desc: "Penjelasan ala anak 5 tahun", icon: BookOpen, color: "from-amber-400 to-orange-500" },
          { title: "Flashcard 3D", desc: "Hafalan cepat tinggal putar", icon: BrainCircuit, color: "from-purple-500 to-indigo-600" },
          { title: "Kuis Fun", desc: "Ada skor & selebrasi", icon: Zap, color: "from-pink-500 to-rose-500" }
        ].map((item, idx) => (
          <div key={idx} className="p-4 rounded-3xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center gap-4 hover-bounce shadow-sm">
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-md`}>
              <item.icon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">{item.title}</h4>
              <p className="text-xs text-slate-500 font-medium">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}