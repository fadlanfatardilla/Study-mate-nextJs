import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("GROQ_API_KEY belum dikonfigurasi di .env.local");
      return NextResponse.json(
        { error: "Konfigurasi server bermasalah (API Key missing)." },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey });
    const body = await req.json();

    const message = body.message?.trim();
    const contextText = body.contextText?.trim() || "Tidak ada materi PDF yang disediakan.";
    const chatHistory = body.chatHistory;

    // Validasi: Hanya pesan dari user yang wajib ada
    if (!message) {
      return NextResponse.json(
        { error: "Pesan tidak boleh kosong." },
        { status: 400 }
      );
    }

    // Membatasi panjang teks PDF agar tidak melebihi token limit Groq
    const MAX_CHAR_LIMIT = 20000;
    const trimmedContext =
      contextText.length > MAX_CHAR_LIMIT
        ? contextText.substring(0, MAX_CHAR_LIMIT) + "\n...[materi dipotong]"
        : contextText;

    const systemInstruction = `
Anda adalah "StudyMate Tutor", seorang tutor belajar AI yang ramah, jelas, dan sangat membantu.
Tugas Anda adalah menjawab pertanyaan siswa berdasarkan materi belajar berikut.

--- MATERI BELAJAR ---
${trimmedContext}
--- AKHIR MATERI BELAJAR ---

Aturan:
1. Jawablah dengan bahasa Indonesia yang ramah, suportif, dan mudah dipahami.
2. Jika pertanyaan pengguna tidak relevan dengan materi belajar di atas, ingatkan dengan sopan bahwa Anda hanya bisa menjawab hal yang berkaitan dengan materi tersebut.
3. Jika informasi yang ditanyakan TIDAK ADA di dalam materi belajar, tetap jawablah menggunakan pengetahuan umum Anda, namun beri tahu siswa di awal bahwa informasi tersebut ditambahkan berdasarkan pengetahuan umum di luar materi PDF

Aturan Ketat:
1. Prioritaskan materi belajar di atas untuk menjawab.
2. Jika menjawab di luar materi, beritahu siswa secara singkat.
3. JANGAN mengarang jawaban yang bertentangan dengan materi belajar.
    `;

    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemInstruction },
    ];

    if (Array.isArray(chatHistory)) {
      chatHistory.forEach((chat: { role: string; content?: string }) => {
        if ((chat.role === "user" || chat.role === "assistant") && chat.content) {
          messages.push({
            role: chat.role as "user" | "assistant",
            content: chat.content,
          });
        }
      });
    }

    messages.push({ role: "user", content: message });

    const completion = await groq.chat.completions.create({
      messages,
      model: "openai/gpt-oss-120b", // Model Groq yang sangat stabil dan cepat
      temperature: 0.1,
    });

    const responseText =
      completion.choices[0]?.message?.content ||
      "Maaf, tidak ada respon yang dihasilkan.";

    return NextResponse.json({ reply: responseText });
  } catch (error: any) {
    console.error(
      "Chat Tutor Error (Groq Detail):",
      error?.response?.data || error?.message || error
    );

    return NextResponse.json(
      { error: error?.message || "Gagal mendapatkan respon dari AI Tutor." },
      { status: 500 }
    );
  }
}