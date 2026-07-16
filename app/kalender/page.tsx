'use client';

import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight as ChevronRightIcon, X, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import AuthGate from '@/components/AuthGate';
import BottomNav from '@/components/BottomNav';
import { ContentTypeBadge } from '@/components/Badges';
import { Video, CONTENT_TYPE_COLORS } from '@/lib/types';

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function KalenderContent() {
  const supabase = createClient();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [pickDate, setPickDate] = useState('');
  const [pickTime, setPickTime] = useState('18:00');

  const loadVideos = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('videos').select('*');
    if (!error && data) setVideos(data as Video[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function dateKey(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function videosForDay(day: number) {
    const key = dateKey(day);
    return videos.filter((v) => v.scheduled_date === key);
  }

  const unscheduled = videos.filter((v) => !v.scheduled_date && v.status !== 'uploaded');

  async function scheduleVideo(video: Video, date: string, time: string) {
    await supabase
      .from('videos')
      .update({ scheduled_date: date, scheduled_time: time, status: 'scheduled' })
      .eq('id', video.id);
    setEditingVideo(null);
    loadVideos();
  }

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const selectedDayVideos = selectedDay
    ? videos.filter((v) => v.scheduled_date === selectedDay)
    : [];

  return (
    <div className="min-h-screen pb-24">
      {/* HEADER */}
      <div className="px-5 pt-6 pb-4 border-b border-lime/10">
        <div className="font-mono text-[10px] text-lime tracking-[3px] uppercase mb-1">
          Jadwal Upload
        </div>
        <div className="flex items-center justify-between">
          <h1 className="font-display font-black text-2xl uppercase tracking-tight">
            {MONTH_NAMES[month]} {year}
          </h1>
          <div className="flex gap-1">
            <button
              onClick={() => setCursor(new Date(year, month - 1, 1))}
              className="w-9 h-9 rounded-full bg-panel border border-lime/20 flex items-center justify-center"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCursor(new Date(year, month + 1, 1))}
              className="w-9 h-9 rounded-full bg-panel border border-lime/20 flex items-center justify-center"
            >
              <ChevronRightIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* CALENDAR GRID */}
      <div className="px-3 pt-4">
        <div className="grid grid-cols-7 mb-1">
          {DAY_NAMES.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] text-gray-500 uppercase tracking-wide font-mono py-2"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) return <div key={i} className="aspect-square" />;
            const dayVideos = videosForDay(day);
            return (
              <button
                key={i}
                onClick={() => dayVideos.length > 0 && setSelectedDay(dateKey(day))}
                className={`aspect-square rounded-md border p-1 flex flex-col items-start ${
                  isToday(day)
                    ? 'border-lime bg-lime/5'
                    : dayVideos.length > 0
                      ? 'border-lime/20 bg-panel'
                      : 'border-transparent'
                }`}
              >
                <span
                  className={`text-[11px] font-mono ${
                    isToday(day) ? 'text-lime font-bold' : 'text-gray-400'
                  }`}
                >
                  {day}
                </span>
                <div className="flex flex-wrap gap-0.5 mt-auto">
                  {dayVideos.slice(0, 3).map((v) => (
                    <span
                      key={v.id}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: CONTENT_TYPE_COLORS[v.content_type] }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* LEGEND */}
      <div className="flex gap-3 px-5 py-4 flex-wrap">
        {Object.entries(CONTENT_TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[10px] text-gray-500 uppercase tracking-wide">{type}</span>
          </div>
        ))}
      </div>

      {/* UNSCHEDULED LIST */}
      <div className="px-5 mt-2">
        <div className="font-display font-bold text-sm uppercase tracking-wide text-gray-400 mb-3">
          Belum Dijadwalkan ({unscheduled.length})
        </div>
        {loading && <div className="text-gray-500 text-xs font-mono">Memuat...</div>}
        {!loading && unscheduled.length === 0 && (
          <div className="text-gray-600 text-xs">Semua video sudah punya jadwal 🎉</div>
        )}
        <div className="flex flex-col gap-2">
          {unscheduled.map((video) => (
            <button
              key={video.id}
              onClick={() => {
                setEditingVideo(video);
                setPickDate(dateKey(today.getDate()));
              }}
              className="text-left bg-panel border border-lime/10 rounded-lg p-3.5 flex items-center justify-between gap-3"
            >
              <div className="flex-1">
                <div className="font-display font-semibold text-sm leading-snug mb-1.5">
                  {video.title}
                </div>
                <ContentTypeBadge type={video.content_type} />
              </div>
              <Clock size={16} className="text-gray-600 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* DAY DETAIL MODAL */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-end">
          <div className="bg-panel border-t border-lime/20 rounded-t-2xl w-full max-h-[70vh] overflow-y-auto p-6 pb-8">
            <div className="flex items-center justify-between mb-5">
              <div className="font-display font-bold text-lg uppercase tracking-wide">
                {selectedDay}
              </div>
              <button onClick={() => setSelectedDay(null)} className="text-gray-500">
                <X size={22} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {selectedDayVideos.map((v) => (
                <div key={v.id} className="bg-dark border border-lime/10 rounded-lg p-3.5">
                  <div className="font-display font-semibold text-sm mb-2">{v.title}</div>
                  <div className="flex items-center gap-2">
                    <ContentTypeBadge type={v.content_type} />
                    {v.scheduled_time && (
                      <span className="font-mono text-[11px] text-gold">cat > app/kalender/page.tsx << 'EOF'
'use client';

import { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight as ChevronRightIcon, X, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase-client';
import AuthGate from '@/components/AuthGate';
import BottomNav from '@/components/BottomNav';
import { ContentTypeBadge } from '@/components/Badges';
import { Video, CONTENT_TYPE_COLORS } from '@/lib/types';

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function KalenderContent() {
  const supabase = createClient();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [pickDate, setPickDate] = useState('');
  const [pickTime, setPickTime] = useState('18:00');

  const loadVideos = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('videos').select('*');
    if (!error && data) setVideos(data as Video[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function dateKey(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function videosForDay(day: number) {
    const key = dateKey(day);
    return videos.filter((v) => v.scheduled_date === key);
  }

  const unscheduled = videos.filter((v) => !v.scheduled_date && v.status !== 'uploaded');

  async function scheduleVideo(video: Video, date: string, time: string) {
    await supabase
      .from('videos')
      .update({ scheduled_date: date, scheduled_time: time, status: 'scheduled' })
      .eq('id', video.id);
    setEditingVideo(null);
    loadVideos();
  }

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const selectedDayVideos = selectedDay
    ? videos.filter((v) => v.scheduled_date === selectedDay)
    : [];

  return (
    <div className="min-h-screen pb-24">
      {/* HEADER */}
      <div className="px-5 pt-6 pb-4 border-b border-lime/10">
        <div className="font-mono text-[10px] text-lime tracking-[3px] uppercase mb-1">
          Jadwal Upload
        </div>
        <div className="flex items-center justify-between">
          <h1 className="font-display font-black text-2xl uppercase tracking-tight">
            {MONTH_NAMES[month]} {year}
          </h1>
          <div className="flex gap-1">
            <button
              onClick={() => setCursor(new Date(year, month - 1, 1))}
              className="w-9 h-9 rounded-full bg-panel border border-lime/20 flex items-center justify-center"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCursor(new Date(year, month + 1, 1))}
              className="w-9 h-9 rounded-full bg-panel border border-lime/20 flex items-center justify-center"
            >
              <ChevronRightIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* CALENDAR GRID */}
      <div className="px-3 pt-4">
        <div className="grid grid-cols-7 mb-1">
          {DAY_NAMES.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] text-gray-500 uppercase tracking-wide font-mono py-2"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((day, i) => {
            if (day === null) return <div key={i} className="aspect-square" />;
            const dayVideos = videosForDay(day);
            return (
              <button
                key={i}
                onClick={() => dayVideos.length > 0 && setSelectedDay(dateKey(day))}
                className={`aspect-square rounded-md border p-1 flex flex-col items-start ${
                  isToday(day)
                    ? 'border-lime bg-lime/5'
                    : dayVideos.length > 0
                      ? 'border-lime/20 bg-panel'
                      : 'border-transparent'
                }`}
              >
                <span
                  className={`text-[11px] font-mono ${
                    isToday(day) ? 'text-lime font-bold' : 'text-gray-400'
                  }`}
                >
                  {day}
                </span>
                <div className="flex flex-wrap gap-0.5 mt-auto">
                  {dayVideos.slice(0, 3).map((v) => (
                    <span
                      key={v.id}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: CONTENT_TYPE_COLORS[v.content_type] }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* LEGEND */}
      <div className="flex gap-3 px-5 py-4 flex-wrap">
        {Object.entries(CONTENT_TYPE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[10px] text-gray-500 uppercase tracking-wide">{type}</span>
          </div>
        ))}
      </div>

      {/* UNSCHEDULED LIST */}
      <div className="px-5 mt-2">
        <div className="font-display font-bold text-sm uppercase tracking-wide text-gray-400 mb-3">
          Belum Dijadwalkan ({unscheduled.length})
        </div>
        {loading && <div className="text-gray-500 text-xs font-mono">Memuat...</div>}
        {!loading && unscheduled.length === 0 && (
          <div className="text-gray-600 text-xs">Semua video sudah punya jadwal 🎉</div>
        )}
        <div className="flex flex-col gap-2">
          {unscheduled.map((video) => (
            <button
              key={video.id}
              onClick={() => {
                setEditingVideo(video);
                setPickDate(dateKey(today.getDate()));
              }}
              className="text-left bg-panel border border-lime/10 rounded-lg p-3.5 flex items-center justify-between gap-3"
            >
              <div className="flex-1">
                <div className="font-display font-semibold text-sm leading-snug mb-1.5">
                  {video.title}
                </div>
                <ContentTypeBadge type={video.content_type} />
              </div>
              <Clock size={16} className="text-gray-600 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* DAY DETAIL MODAL */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-end">
          <div className="bg-panel border-t border-lime/20 rounded-t-2xl w-full max-h-[70vh] overflow-y-auto p-6 pb-8">
            <div className="flex items-center justify-between mb-5">
              <div className="font-display font-bold text-lg uppercase tracking-wide">
                {selectedDay}
              </div>
              <button onClick={() => setSelectedDay(null)} className="text-gray-500">
                <X size={22} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {selectedDayVideos.map((v) => (
                <div key={v.id} className="bg-dark border border-lime/10 rounded-lg p-3.5">
                  <div className="font-display font-semibold text-sm mb-2">{v.title}</div>
                  <div className="flex items-center gap-2">
                    <ContentTypeBadge type={v.content_type} />
                    {v.scheduled_time && (
                      <span className="font-mono text-[11px] text-gold">
                        {v.scheduled_time.slice(0, 5)} WIB
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE PICKER MODAL */}
      {editingVideo && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-end">
          <div className="bg-panel border-t border-lime/20 rounded-t-2xl w-full p-6 pb-8">
            <div className="flex items-center justify-between mb-5">
              <div className="font-display font-bold text-lg uppercase tracking-wide leading-snug pr-4">
                Jadwalkan Upload
              </div>
              <button onClick={() => setEditingVideo(null)} className="text-gray-500 shrink-0">
                <X size={22} />
              </button>
            </div>

            <div className="text-sm text-gray-300 mb-5">{editingVideo.title}</div>

            <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">
              Tanggal
            </label>
            <input
              type="date"
              value={pickDate}
              onChange={(e) => setPickDate(e.target.value)}
              className="w-full bg-dark border border-lime/20 rounded-md px-4 py-3 text-sm text-white focus:outline-none focus:border-lime mb-4"
            />

            <label className="text-xs text-gray-400 uppercase tracking-wide mb-1.5 block">
              Jam (rekomendasi 18:00–20:00 WIB)
            </label>
            <input
              type="time"
              value={pickTime}
              onChange={(e) => setPickTime(e.target.value)}
              className="w-full bg-dark border border-lime/20 rounded-md px-4 py-3 text-sm text-white focus:outline-none focus:border-lime mb-6"
            />

            <button
              onClick={() => scheduleVideo(editingVideo, pickDate, pickTime)}
              disabled={!pickDate}
              className="w-full bg-lime text-dark font-display font-bold uppercase tracking-wide py-3.5 rounded-md text-sm disabled:opacity-40"
            >
              Simpan Jadwal
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

export default function KalenderPage() {
  return (
    <AuthGate>
      <KalenderContent />
    </AuthGate>
  );
}
