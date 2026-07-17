import { NextRequest, NextResponse } from 'next/server';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent';

export async function POST(req: NextRequest) {
  try {
    const { topic, contentType } = await req.json();

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return NextResponse.json({ error: 'Topik wajib diisi.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY belum diset di environment variables.' },
        { status: 500 }
      );
    }

    const prompt = buildPrompt(topic, contentType);

    const geminiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.85,
          maxOutputTokens: 2048,
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
        { error: 'Gemini tidak mengembalikan hasil. Coba topik lain.' },
        { status: 502 }
      );
    }

    const parsed = parseScriptResponse(rawText);

    return NextResponse.json({ result: parsed });
  } catch (err) {
    console.error('generate-script error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan di server.' }, { status: 500 });
  }
}

function buildPrompt(topic: string, contentType?: string): string {
  const typeContext: Record<string, string> = {
    taktik: 'Fokus pada analisis formasi, filosofi pelatih, atau strategi permainan.',
    berita: 'Fokus pada berita transfer, rumor, atau update terkini pemain/klub.',
    highlight: 'Fokus pada review pertandingan yang sudah selesai, momen kunci, dan evaluasi performa.',
    shorts: 'Buat versi SANGAT PENDEK (150-200 kata total) untuk video di bawah 60 detik, satu poin kejut/menarik saja.',
  };

  const context = contentType && typeContext[contentType] ? typeContext[contentType] : '';

  return `Kamu adalah komentator sepakbola Indonesia yang energik dan berpengetahuan, menulis untuk channel YouTube niche sepakbola.

Buat script video YouTube tentang topik berikut:
TOPIK: ${topic}
${context}

Tulis dengan format PERSIS seperti ini (gunakan header dalam kurung siku, jangan diubah):

[JUDUL]
(judul SEO-friendly, maksimal 60 karakter)

[HOOK]
(1-2 kalimat pembuka yang bikin penonton penasaran dalam 5 detik pertama)

[SCRIPT]
(naskah lengkap 700-900 kata untuk video biasa, atau 150-200 kata jika Shorts. Struktur: intro singkat, 3-4 poin konten utama, kesimpulan + ajakan subscribe/comment. Gaya bahasa santai tapi informatif, pakai istilah sepakbola yang tepat, sesekali bahasa gaul yang natural, JANGAN kaku seperti robot.)

[DESKRIPSI]
(deskripsi YouTube 100-150 kata dengan hook di awal, poin-poin konten, dan call-to-action)

[TAGS]
(10-15 tag/hashtag relevan, pisahkan dengan koma)

[THUMBNAIL_TEXT]
(maksimal 5 kata untuk teks di thumbnail, huruf kapital, harus punya daya tarik visual)

Jangan tambahkan komentar, catatan, atau penjelasan di luar format di atas.`;
}

interface ParsedScript {
  title: string;
  hook: string;
  script: string;
  description: string;
  tags: string[];
  thumbnailText: string;
}

function parseScriptResponse(raw: string): ParsedScript {
  const extract = (label: string): string => {
    const regex = new RegExp(`\\[${label}\\]\\s*([\\s\\S]*?)(?=\\n\\[|$)`, 'i');
    const match = raw.match(regex);
    return match ? match[1].trim() : '';
  };

  const tagsRaw = extract('TAGS');
  const tags = tagsRaw
    .split(',')
    .map((t) => t.trim().replace(/^#/, ''))
    .filter(Boolean);

  return {
    title: extract('JUDUL'),
    hook: extract('HOOK'),
    script: extract('SCRIPT'),
    description: extract('DESKRIPSI'),
    tags,
    thumbnailText: extract('THUMBNAIL_TEXT'),
  };
}
