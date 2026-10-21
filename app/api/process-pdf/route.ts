import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type, Schema } from "@google/genai";
import pdfParse from "pdf-parse-fork";
import Groq from "groq-sdk";

const ai = new GoogleGenAI();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Batas maksimum karakter teks PDF untuk mencegah token overflow
const MAX_TEXT_LENGTH = 15000;

// Schema output AI untuk StudyMate
const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: "Judul utama dari materi PDF",
        },
        eli5Explanation: {
          type: Type.STRING,
          description:
            "Penjelasan ringkas, sederhana, dan mudah dipahami oleh pemula/anak-anak (ELI5)",
        },
        keyPoints: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Daftar poin-poin penting materi",
        },
      },
      required: ["title", "eli5Explanation", "keyPoints"],
    },
    flashcards: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          front: {
            type: Type.STRING,
            description: "Pertanyaan atau istilah",
          },
          back: {
            type: Type.STRING,
            description: "Jawaban atau penjelasan singkat",
          },
        },
        required: ["id", "front", "back"],
      },
      description: "Daftar kartu belajar (flashcard) interaktif",
    },
    quiz: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          question: {
            type: Type.STRING,
            description: "Pertanyaan kuis",
          },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Array berisi tepat 4 pilihan jawaban",
          },
          correctAnswer: {
            type: Type.NUMBER,
            description: "Index pilihan jawaban yang benar (0 - 3)",
          },
          explanation: {
            type: Type.STRING,
            description: "Penjelasan mengapa jawaban tersebut benar",
          },
        },
        required: ["id", "question", "options", "correctAnswer", "explanation"],
      },
      description: "Daftar pertanyaan kuis pilihan ganda",
    },
  },
  required: ["summary", "flashcards", "quiz"],
};

/**
 * Membersihkan output string AI dari pembungkus Markdown seperti ```json ... ```
 */
function cleanJsonOutput(rawText: string): string {
  let cleaned = rawText.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
  cleaned = cleaned.replace(/\s*```$/, "");
  return cleaned.trim();
}

/**
 * Memotong teks jika melebihi batas maksimum karakter
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "\n...[Teks dipotong karena terlalu panjang]";
}

async function generateContentWithFallback(prompt: string) {
  // Model utama Google Gemini
  const models = ["gemini-2.5-flash"];

  for (const modelName of models) {
    let retries = 0;
    const maxRetries = 3;

    while (retries < maxRetries) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
            temperature: 0.2,
          },
        });

        if (response.text) {
          return response.text;
        }
      } catch (err: any) {
        retries++;
        const isBusy =
          err.status === 503 ||
          err.status === 429 ||
          err.message?.includes("high demand") ||
          err.message?.includes("UNAVAILABLE");

        console.warn(
          `[Model: ${modelName}] Percobaan ke-${retries} gagal (Status: ${
            err.status || "Error"
          } - ${err.message || err})`
        );

        if (isBusy && retries < maxRetries) {
          await new Promise((res) => setTimeout(res, retries * 2000));
        } else {
          break;
        }
      }
    }
  }

  // Fallback ke Groq apabila Gemini mengalami error/limit
  if (process.env.GROQ_API_KEY) {
    const groqModels = [
      "openai/gpt-oss-120b",
      "openai/gpt-oss-20b",
      "qwen/qwen3.8-27b",
    ];

    const groqPrompt = `${prompt}

SANGAT PENTING: Kembalikan respon HANYA berupa JSON valid sesuai struktur berikut:
{
  "summary": {
    "title": "string",
    "eli5Explanation": "string",
    "keyPoints": ["string"]
  },
  "flashcards": [
    {
      "id": "1",
      "front": "string",
      "back": "string"
    }
  ],
  "quiz": [
    {
      "id": "1",
      "question": "string",
      "options": ["opsi 0", "opsi 1", "opsi 2", "opsi 3"],
      "correctAnswer": 0,
      "explanation": "string"
    }
  ]
}`;

    for (const groqModel of groqModels) {
      try {
        console.warn(`[Groq Fallback] Mencoba model: ${groqModel}...`);

        const completion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content:
                "Anda adalah asisten AI StudyMate yang ahli membuat rangkuman materi belajar, flashcard, dan kuis. Output HARUS selalu dalam format JSON valid.",
            },
            { role: "user", content: groqPrompt },
          ],
          model: groqModel,
          response_format: { type: "json_object" },
        });

        const groqText = completion.choices[0]?.message?.content;
        if (groqText) {
          console.log(`[Groq Fallback] Berhasil menggunakan ${groqModel}`);
          return groqText;
        }
      } catch (groqErr: any) {
        console.warn(
          `[Groq Fallback] Model ${groqModel} gagal:`,
          groqErr.message || groqErr
        );
      }
    }
  }

  throw new Error(
    "Layanan AI sedang mengalami lonjakan beban. Silakan coba beberapa saat lagi."
  );
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "File PDF materi wajib diunggah." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const parseFn =
      typeof pdfParse === "function"
        ? pdfParse
        : (pdfParse as any).default || pdfParse;
    const pdfData = await parseFn(buffer);
    const rawPdfText = pdfData.text;

    if (!rawPdfText || !rawPdfText.trim()) {
      return NextResponse.json(
        {
          error:
            "Gagal membaca teks dari PDF. Pastikan file tidak diproteksi atau hasil scan berupa gambar semata.",
        },
        { status: 400 }
      );
    }

    // Pemotongan teks jika melebihi batas token aman
    const extractedText = truncateText(rawPdfText, MAX_TEXT_LENGTH);

    const prompt = `
Anda adalah asisten belajar cerdas "StudyMate".
Analisis teks materi berikut dan susunlah:
1. Rangkuman ELI5 (Explain Like I'm 5) & poin-poin kunci.
2. Minimal 5 Flashcard interaktif (pertanyaan/istilah di "front", jawaban/penjelasan di "back").
3. Buatkan BANK SOAL KUIS PILIHAN GANDA BERJUMBLAH TEPAT 15 SOAL BERBEDA yang mencakup seluruh isi materi. 
   PENTING: 
   - Buat TEPAT 15 pertanyaan yang bervariasi dan tidak boleh ada yang mirip.
   - "correctAnswer" HARUS berupa ANGKA INDEX (0 untuk opsi ke-1, 1 untuk opsi ke-2, 2 untuk opsi ke-3, 3 untuk opsi ke-4). JANGAN menuliskan teks jawaban atau huruf A/B/C/D pada "correctAnswer".

--- TEKS MATERI BELAJAR ---
${extractedText}
    `;

    // 1. Dapatkan respons mentah dari AI (Gemini / Fallback Groq)
    const rawJsonText = await generateContentWithFallback(prompt);

    // 2. Sanitasi teks JSON sebelum parsing
    const cleanedJsonText = cleanJsonOutput(rawJsonText);

    let studyMateResult;
    try {
      studyMateResult = JSON.parse(cleanedJsonText);
    } catch (parseErr) {
      console.error("Gagal melakukan JSON parse pada output AI:", rawJsonText);
      throw new Error("Format respon AI tidak valid. Silakan coba lagi.");
    }

    // --- SANITASI & NORMALISASI DATA KUIS DAN FLASHCARD ---
    if (studyMateResult?.quiz && Array.isArray(studyMateResult.quiz)) {
      studyMateResult.quiz = studyMateResult.quiz.map((q: any, index: number) => {
        let correctIdx = 0;
        const options = Array.isArray(q.options) ? q.options : [];

        if (typeof q.correctAnswer === "number") {
          correctIdx = Math.floor(q.correctAnswer);
        } else if (typeof q.correctAnswer === "string") {
          const trimmed = q.correctAnswer.trim();
          // Jika AI mengembalikan huruf "A", "B", "C", atau "D"
          const letterMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3, a: 0, b: 1, c: 2, d: 3 };
          if (trimmed in letterMap) {
            correctIdx = letterMap[trimmed];
          } else if (!isNaN(Number(trimmed))) {
            correctIdx = Number(trimmed);
          } else {
            // Jika AI mengembalikan string teks jawaban, cocokkan dengan array options
            const foundIdx = options.findIndex(
              (opt: string) => String(opt).trim().toLowerCase() === trimmed.toLowerCase()
            );
            correctIdx = foundIdx !== -1 ? foundIdx : 0;
          }
        }

        // Batasi rentang index agar selalu antara 0 s.d. options.length - 1
        if (options.length > 0) {
          correctIdx = Math.max(0, Math.min(correctIdx, options.length - 1));
        } else {
          correctIdx = 0;
        }

        return {
          id: q.id || `quiz-${index + 1}`,
          question: q.question || "Pertanyaan tidak tersedia",
          options: options,
          correctAnswer: correctIdx, // Dipastikan selalu berupa number (index 0, 1, 2, atau 3)
          explanation: q.explanation || "",
        };
      });
    }

    if (studyMateResult?.flashcards && Array.isArray(studyMateResult.flashcards)) {
      studyMateResult.flashcards = studyMateResult.flashcards.map((fc: any, index: number) => ({
        id: fc.id || `fc-${index + 1}`,
        front: fc.front || fc.question || "Pertanyaan tidak tersedia",
        back: fc.back || fc.answer || "Jawaban tidak tersedia",
      }));
    }

    return NextResponse.json({ success: true, data: studyMateResult });
  } catch (error: any) {
    console.error("Smart-StudyMate API Error:", error);
    return NextResponse.json(
      {
        error:
          error.message ||
          "Terjadi kesalahan pada server saat memproses dokumen.",
      },
      { status: 500 }
    );
  }
}