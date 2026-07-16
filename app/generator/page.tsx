'use client';

import { useState } from 'react';
import { Sparkles, Copy, Check, Save, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import AuthGate from '@/components/AuthGate';
import BottomNav from '@/components/BottomNav';
import { ContentType, CONTENT_TYPE_LABELS } from '@/lib/types';

interface ScriptResult {
  title: string;
  hook: string;
  script: string;
  description: string;
  tags: string[];
  thumbnailText: string;
}

interface TitleIdea {
  contentType: string;
  title: string;
  hook: string;
}

function GeneratorContent() {
  const supabase = createClient();
  const [mode, setMode] = useState<'script' | 'batch'>('script');

  // Script generator state
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState<ContentType>('taktik');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScriptResult | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Batch title generator state
  const [batchContext, setBatchContext] = useState('');
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchResult, setBatchResult] = useState<TitleIdea[]>([]);
  const [batchError, setBatchError] = useState('');
  const [addedIdx, setAddedIdx] = useState<Set<number>>(new Set());

  const [copiedField, setCopiedField] = useState<string | null>(null);

  async function generateScript() {
    if (!topic.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    setSaved(false);

    try {
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, contentType }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Gagal generate script.');
      } else {
        setResult(data.result);
      }
    } catch {
      setError('Gagal terhubung ke server. Periksa koneksi internet.');
    } finally {
      setLoading(false);
    }
  }

  async function saveToPlanner() {
    if (!result) return;
    setSaving(true);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setSaving(false);
      return;
    }

    const { error } = await supabase.from('videos').insert({
      user_id: userData.user.id,
      title: result.title || topic,
      content_type: contentType,
      hook: result.hook,
      script: result.script,
      description: result.description,
      tags: result.tags,
      thumbnail_text: result.thumbnailText,
      status: 'script_ready',
    });

    setSaving(false);
    if (!error) setSaved(true);
  }

  async function generateBatch() {
    setBatchLoading(true);
    setBatchError('');
    setBatchResult([]);
    setAddedIdx(new Set());

    try {
      const res = await fetch('/api/generate-titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: batchContext }),
      });
      const data = await res.json();

      if (!res.ok) {
        setBatchError(data.error || 'Gagal generate judul.');
      } else {
        setBatchResult(data.result);
      }
    } catch {
      setBatchError('Gagal terhubung ke server. Periksa koneksi internet.');
    } finally {
      setBatchLoading(false);
    }
  }

  async function addBatchItemToPlanner(item: TitleIdea, idx: number) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const validType: ContentType = (
      ['taktik', 'berita', 'highlight', 'shorts'].includes(item.contentType)
        ? item.contentType
        : 'taktik'
    ) as ContentType;

    const { error } = await supabase.from('videos').insert({
      user_id: userData.user.id,
      title: item.title,
      content_type: validType,
      hook: item.hook,
      status: 'idea',
    });

    if (!error) {
      setAddedIdx((prev) => new Set(prev).add(idx));
    }
  }

  function copyField(field: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  }

  return (
    <div className="min-h-screen pb-24">
      {/* HEADER */}
      <div className="px-5 pt-6 pb-4 border-b border-lime/10">
        <div className="font-mono text-[10px] text-lime tracking-[3px] uppercase mb-1">
          AI Generator
        </div>
        <h1 className="font-display font-black text-2xl uppercase tracking-tight">
          Bikin Konten
        </h1>
      </div>

      {/* MODE TOGGLE */}
      <div className="flex gap-2 px-5 py-4">
        <button
          onClick={() => setMode('script')}
          className={`flex-1 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wide border ${
            mode === 'script'
              ? 'bg-lime/15 border-lime text-lime'
              : 'border-lime/15 text-gray-400'
          }`}
        >
          Script Video
        </button>
        <button
          onClick={() => setMode('batch')}
          className={`flex-1 py-2.5 rounded-md text-xs font-semibold uppercase tracking-wide border ${
            mode === 'batch'
              ? 'bg-lime/15 border-lime text-lime'
              : 'border-lime/15 text-gray-400'
          }`}
        >
          Batch 7 Judul
        </button>
      </div>

      {mode === 'script' ? (
        <div className="px-5">
          <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">
            Topik Video
          </label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="cth: Rumor transfer pemain muda ke klub besar"
            className="w-full bg-panel border border-lime/20 rounded-md px-4 py-3 text-sm text-white focus:outline-none focus:border-lime mb-4"
          />

          <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">
            Tipe Konten
          </label>
          <div className="grid grid-cols-2 gap-2 mb-5">
            {(Object.keys(CONTENT_TYPE_LABELS) as ContentType[]).map((t) => (
              <button
                key={t}
                onClick={() => setContentType(t)}
                className={`py-2.5 rounded-md text-xs font-semibold uppercase tracking-wide border ${
                  contentType === t
                    ? 'bg-lime/15 border-lime text-lime'
                    : 'border-lime/15 text-gray-400'
                }`}
              >
                {CONTENT_TYPE_LABELS[t]}
              </button>
            ))}
          </div>

          <button
            onClick={generateScript}
            disabled={!topic.trim() || loading}
            className="w-full flex items-center justify-center gap-2 bg-lime text-dark font-display font-bold uppercase tracking-wide py-3.5 rounded-md text-sm disabled:opacity-40 mb-6"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Generate...
              </>
            ) : (
              <>
                <Sparkles size={16} /> Generate Script
              </>
            )}
          </button>

          {error && (
            <div className="text-red-card text-xs bg-red-card/10 border border-red-card/30 rounded px-3 py-2.5 mb-4">
              {error}
            </div>
          )}

          {result && (
            <div className="flex flex-col gap-4 mb-8">
              <ResultBlock
                label="Judul"
                text={result.title}
                copied={copiedField === 'title'}
                onCopy={() => copyField('title', result.title)}
              />
              <ResultBlock
                label="Hook"
                text={result.hook}
                copied={copiedField === 'hook'}
                onCopy={() => copyField('hook', result.hook)}
              />
              <ResultBlock
                label="Script"
                text={result.script}
                copied={copiedField === 'script'}
                onCopy={() => copyField('script', result.script)}
                scrollable
              />
              <ResultBlock
                label="Deskripsi"
                text={result.description}
                copied={copiedField === 'description'}
                onCopy={() => copyField('description', result.description)}
              />
              <ResultBlock
                label="Thumbnail Text"
                text={result.thumbnailText}
                copied={copiedField === 'thumb'}
                onCopy={() => copyField('thumb', result.thumbnailText)}
              />

              {result.tags.length > 0 && (
                <div>
                  <div className="text-[10px] text-lime tracking-widest uppercase mb-2 font-mono">
                    Tags
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="font-mono text-[11px] bg-lime/10 text-lime px-2 py-0.5 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={saveToPlanner}
                disabled={saving || saved}
                className="w-full flex items-center justify-center gap-2 bg-panel border border-lime text-lime font-display font-bold uppercase tracking-wide py-3.5 rounded-md text-sm disabled:opacity-60"
              >
                {saved ? (
                  <>
                    <Check size={16} /> Tersimpan di Planner
                  </>
                ) : saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Menyimpan...
                  </>
                ) : (
                  <>
                    <Save size={16} /> Simpan ke Planner
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="px-5">
          <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">
            Konteks Minggu Ini (opsional)
          </label>
          <textarea
            value={batchContext}
            onChange={(e) => setBatchContext(e.target.value)}
            placeholder="cth: Ada El Clasico hari Minggu, bursa transfer musim dingin dibuka"
            rows={3}
            className="w-full bg-panel border border-lime/20 rounded-md px-4 py-3 text-sm text-white focus:outline-none focus:border-lime mb-4 resize-none"
          />

          <button
            onClick={generateBatch}
            disabled={batchLoading}
            className="w-full flex items-center justify-center gap-2 bg-lime text-dark font-display font-bold uppercase tracking-wide py-3.5 rounded-md text-sm disabled:opacity-40 mb-6"
          >
            {batchLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Generate...
              </>
            ) : (
              <>
                <Sparkles size={16} /> Generate 7 Judul
              </>
            )}
          </button>

          {batchError && (
            <div className="text-red-card text-xs bg-red-card/10 border border-red-card/30 rounded px-3 py-2.5 mb-4">
              {batchError}
            </div>
          )}

          <div className="flex flex-col gap-3 mb-8">
            {batchResult.map((item, idx) => (
              <div
                key={idx}
                className="bg-panel border border-lime/10 rounded-lg p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="font-display font-semibold text-[15px] leading-snug flex-1">
                    {item.title}
                  </div>
                </div>
                <div className="font-mono text-[10px] text-gold uppercase tracking-wide mb-2">
                  {item.contentType}
                </div>
                {item.hook && (
                  <div className="text-xs text-gray-400 leading-relaxed mb-3">{item.hook}</div>
                )}
                <button
                  onClick={() => addBatchItemToPlanner(item, idx)}
                  disabled={addedIdx.has(idx)}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wide py-2 rounded border border-lime/30 text-lime disabled:opacity-50"
                >
                  {addedIdx.has(idx) ? (
                    <>
                      <Check size={13} /> Ditambahkan
                    </>
                  ) : (
                    <>
                      <Save size={13} /> Tambah ke Planner
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

function ResultBlock({
  label,
  text,
  copied,
  onCopy,
  scrollable,
}: {
  label: string;
  text: string;
  copied: boolean;
  onCopy: () => void;
  scrollable?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-[10px] text-lime tracking-widest uppercase font-mono">{label}</div>
        <button onClick={onCopy} className="text-gray-500 flex items-center gap-1 text-[10px]">
          {copied ? (
            <>
              <Check size={12} className="text-lime" /> <span className="text-lime">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} /> Copy
            </>
          )}
        </button>
      </div>
      <div
        className={`text-sm text-gray-300 leading-relaxed whitespace-pre-wrap bg-panel rounded-md p-3 border border-lime/10 ${
          scrollable ? 'max-h-56 overflow-y-auto' : ''
        }`}
      >
        {text}
      </div>
    </div>
  );
}

export default function GeneratorPage() {
  return (
    <AuthGate>
      <GeneratorContent />
    </AuthGate>
  );
}
