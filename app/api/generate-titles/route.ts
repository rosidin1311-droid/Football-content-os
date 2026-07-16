import { NextRequest, NextResponse } from 'next/server';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export async function POST(req: NextRequest) {
  try {
    const { context } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY belum diset di environment variables.' },
        { status: 500 }
      );
    }

    const prompt = `Kamu adalah content strategist untuk channel YouTube sepakbola Indonesia.

Berikan 7 ide judul video untuk minggu ini. Pertimbangkan konteks berikut jika ada:
${context && context.trim() ? context.trim() : '(tidak ada konteks spesifik, gunakan topik sepakbola yang selalu relevan: taktik, transfer, highlight, dan fakta menarik)'}

Distribusi wajib:
- 3 video kategori TAKTIK (analisis formasi/strategi)
- 2 video kategori BERITA (transfer/rumor)
- 1 video kategori HIGHLIGHT (review pertandingan)
- 1 video kategori SHORTS (klip pendek viral)

Untuk SETIAP judul, tulis dalam format PERSIS berikut, dan pisahkan setiap item dengan baris "---":

[TIPE] taktik | berita | highlight | shorts
[JUDUL] (judul SEO-friendly, maksimal 60 karakter)
[HOOK] (1 kalimat pembuka yang menarik)
---

Jangan tambahkan penjelasan lain di luar format ini.`;

    const geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 1536,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      console.error('Gemini API error:', errBody);
      return NextResponse.json(
        { error: 'Gagal generate dari Gemini. Coba lagi sebentar lagi.' },
        { status: 502 }
      );
    }

    const data = await geminiRes.json();
    const rawText: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return NextResponse.json(
        { error: 'Gemini tidak mengembalikan hasil.' },
        { status: 502 }
      );
    }

    const items = rawText
      .split('---')
      .map((block) => block.trim())
      .filter(Boolean)
      .map((block) => {
        const typeMatch = block.match(/\[TIPE\]\s*(\w+)/i);
        const titleMatch = block.match(/\[JUDUL\]\s*([\s\S]*?)(?=\n\[|$)/i);
        const hookMatch = block.match(/\[HOOK\]\s*([\s\S]*?)(?=\n\[|$)/i);

        return {
          contentType: (typeMatch?.[1] || 'taktik').toLowerCase().trim(),
          title: titleMatch?.[1]?.trim() || '',
          hook: hookMatch?.[1]?.trim() || '',
        };
      })
      .filter((item) => item.title);

    return NextResponse.json({ result: items });
  } catch (err) {
    console.error('generate-titles error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan di server.' }, { status: 500 });
  }
}
