'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, X, Trash2, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import AuthGate from '@/components/AuthGate';
import BottomNav from '@/components/BottomNav';
import { ContentTypeBadge, StatusBadge } from '@/components/Badges';
import {
  Video,
  ContentType,
  VideoStatus,
  STATUS_LABELS,
  STATUS_ORDER,
  CONTENT_TYPE_LABELS,
} from '@/lib/types';

function PlannerContent() {
  const supabase = createClient();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<Video | null>(null);
  const [filterStatus, setFilterStatus] = useState<VideoStatus | 'all'>('all');

  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<ContentType>('taktik');
  const [saving, setSaving] = useState(false);

  const loadVideos = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setVideos(data as Video[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  async function addVideo() {
    if (!newTitle.trim()) return;
    setSaving(true);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;

    const { error } = await supabase.from('videos').insert({
      user_id: userData.user.id,
      title: newTitle.trim(),
      content_type: newType,
      status: 'idea',
    });

    setSaving(false);
    if (!error) {
      setNewTitle('');
      setShowAdd(false);
      loadVideos();
    }
  }

  async function updateStatus(id: string, status: VideoStatus) {
    await supabase.from('videos').update({ status }).eq('id', id);
    setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)));
    setSelected((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
  }

  async function deleteVideo(id: string) {
    await supabase.from('videos').delete().eq('id', id);
    setVideos((prev) => prev.filter((v) => v.id !== id));
    setSelected(null);
  }

  const filtered =
    filterStatus === 'all' ? videos : videos.filter((v) => v.status === filterStatus);

  const counts = STATUS_ORDER.reduce(
    (acc, s) => {
      acc[s] = videos.filter((v) => v.status === s).length;
      return acc;
    },
    {} as Record<VideoStatus, number>
  );

  return (
    <div className="min-h-screen pb-24">
      {/* HEADER */}
      <div className="px-5 pt-6 pb-4 border-b border-lime/10">
        <div className="flex items-center justify-between mb-1">
          <div>
            <div className="font-mono text-[10px] text-lime tracking-[3px] uppercase mb-1">
              Content Planner
            </div>
            <h1 className="font-display font-black text-2xl uppercase tracking-tight">
              {videos.length} Video
            </h1>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="w-11 h-11 rounded-full bg-lime text-dark flex items-center justify-center active:scale-95 transition"
          >
            <Plus size={22} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* STATUS FILTER PILLS */}
      <div className="flex gap-2 px-5 py-4 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setFilterStatus('all')}
          className={`shrink-0 font-mono text-[11px] tracking-wide uppercase px-3 py-1.5 rounded-full border ${
            filterStatus === 'all'
              ? 'bg-lime text-dark border-lime'
              : 'border-lime/20 text-gray-400'
          }`}
        >
          Semua ({videos.length})
        </button>
        {STATUS_ORDER.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`shrink-0 font-mono text-[11px] tracking-wide uppercase px-3 py-1.5 rounded-full border ${
              filterStatus === s
                ? 'bg-lime text-dark border-lime'
                : 'border-lime/20 text-gray-400'
            }`}
          >
            {STATUS_LABELS[s]} ({counts[s]})
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="px-5 flex flex-col gap-3">
        {loading && (
          <div className="text-center py-16 text-gray-500 font-mono text-xs">Memuat...</div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">⚽</div>
            <div className="text-gray-500 text-sm">
              {videos.length === 0
                ? 'Belum ada video. Tambah ide pertama kamu.'
                : 'Tidak ada video di status ini.'}
            </div>
          </div>
        )}

        {filtered.map((video) => (
          <button
            key={video.id}
            onClick={() => setSelected(video)}
            className="text-left bg-panel border border-lime/10 rounded-lg p-4 active:border-lime/40 transition"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="font-display font-semibold text-[15px] leading-snug flex-1">
                {video.title}
              </div>
              <ChevronRight size={16} className="text-gray-600 shrink-0 mt-0.5" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <ContentTypeBadge type={video.content_type} />
              <StatusBadge status={video.status} />
            </div>
          </button>
        ))}
      </div>

      {/* ADD MODAL */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-end">
          <div className="bg-panel border-t border-lime/20 rounded-t-2xl w-full p-6 pb-8">
            <div className="flex items-center justify-between mb-5">
              <div className="font-display font-bold text-lg uppercase tracking-wide">
                Ide Video Baru
              </div>
              <button onClick={() => setShowAdd(false)} className="text-gray-500">
                <X size={22} />
              </button>
            </div>

            <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">
              Judul / Topik
            </label>
            <input
              autoFocus
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="cth: 5 Formasi Terbaik UCL Musim Ini"
              className="w-full bg-dark border border-lime/20 rounded-md px-4 py-3 text-sm text-white focus:outline-none focus:border-lime mb-4"
            />

            <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">
              Tipe Konten
            </label>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {(Object.keys(CONTENT_TYPE_LABELS) as ContentType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setNewType(t)}
                  className={`py-2.5 rounded-md text-xs font-semibold uppercase tracking-wide border ${
                    newType === t
                      ? 'bg-lime/15 border-lime text-lime'
                      : 'border-lime/15 text-gray-400'
                  }`}
                >
                  {CONTENT_TYPE_LABELS[t]}
                </button>
              ))}
            </div>

            <button
              onClick={addVideo}
              disabled={!newTitle.trim() || saving}
              className="w-full bg-lime text-dark font-display font-bold uppercase tracking-wide py-3.5 rounded-md text-sm disabled:opacity-40"
            >
              {saving ? 'Menyimpan...' : 'Tambah ke Planner'}
            </button>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-end">
          <div className="bg-panel border-t border-lime/20 rounded-t-2xl w-full max-h-[85vh] overflow-y-auto p-6 pb-8">
            <div className="flex items-start justify-between mb-4 gap-3">
              <div className="font-display font-bold text-lg leading-snug">{selected.title}</div>
              <button onClick={() => setSelected(null)} className="text-gray-500 shrink-0">
                <X size={22} />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <ContentTypeBadge type={selected.content_type} />
              <StatusBadge status={selected.status} />
            </div>

            {selected.hook && (
              <div className="mb-4">
                <div className="text-[10px] text-lime tracking-widest uppercase mb-1 font-mono">
                  Hook
                </div>
                <div className="text-sm text-gray-300 leading-relaxed">{selected.hook}</div>
              </div>
            )}

            {selected.script && (
              <div className="mb-4">
                <div className="text-[10px] text-lime tracking-widest uppercase mb-1 font-mono">
                  Script
                </div>
                <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap bg-dark rounded-md p-3 border border-lime/10 max-h-48 overflow-y-auto">
                  {selected.script}
                </div>
              </div>
            )}

            {selected.description && (
              <div className="mb-4">
                <div className="text-[10px] text-lime tracking-widest uppercase mb-1 font-mono">
                  Deskripsi
                </div>
                <div className="text-sm text-gray-300 leading-relaxed">{selected.description}</div>
              </div>
            )}

            {selected.tags && selected.tags.length > 0 && (
              <div className="mb-6">
                <div className="text-[10px] text-lime tracking-widest uppercase mb-2 font-mono">
                  Tags
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selected.tags.map((tag, i) => (
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

            {!selected.script && (
              <div className="mb-6 bg-gold/10 border border-gold/30 rounded-md p-3 text-xs text-gold">
                Belum ada script. Buka tab Generator untuk generate naskah untuk video ini.
              </div>
            )}

            {/* STATUS PROGRESSION */}
            <div className="mb-6">
              <div className="text-[10px] text-lime tracking-widest uppercase mb-2 font-mono">
                Update Status
              </div>
              <div className="grid grid-cols-3 gap-2">
                {STATUS_ORDER.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(selected.id, s)}
                    className={`py-2 rounded-md text-[11px] font-semibold uppercase tracking-wide border ${
                      selected.status === s
                        ? 'bg-lime/15 border-lime text-lime'
                        : 'border-lime/15 text-gray-400'
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => deleteVideo(selected.id)}
              className="w-full flex items-center justify-center gap-2 border border-red-card/40 text-red-card font-semibold uppercase tracking-wide py-3 rounded-md text-xs"
            >
              <Trash2 size={14} /> Hapus Video
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

export default function PlannerPage() {
  return (
    <AuthGate>
      <PlannerContent />
    </AuthGate>
  );
}
