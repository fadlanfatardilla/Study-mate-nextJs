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
  options: string[]; 
  answerIndex: number;
  explanation: string;
}

export interface SummaryData {
  title: string;
  keyPoints: string[];
  eli5Explanation: string;
}

export interface StudyMateResponse {
  summary: SummaryData;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  extractedText?: string;
  text?: string;
}