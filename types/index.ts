export interface Flashcard {
  id: string;
  front: string;
  back: string;
  question?: string;
  answer?: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[]; // Contoh: ["A. ...", "B. ...", "C. ...", "D. ..."]
  answerIndex: number; // Index jawaban benar (0, 1, 2, atau 3)
  explanation: string;
}

export interface SummaryData {
  title: string;
  keyPoints: string[];
  eli5Explanation: string; // Explain Like I'm 5
}

export interface StudyMateResponse {
  summary: SummaryData;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  extractedText?: string;
  text?: string;
}