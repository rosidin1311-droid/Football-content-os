import { ContentType, VideoStatus, CONTENT_TYPE_LABELS, CONTENT_TYPE_COLORS, STATUS_LABELS } from '@/lib/types';

export function ContentTypeBadge({ type }: { type: ContentType }) {
  const color = CONTENT_TYPE_COLORS[type];
  return (
    <span
      className="inline-block font-display font-bold text-[11px] tracking-wide px-2 py-0.5 rounded uppercase"
      style={{ backgroundColor: `${color}26`, color }}
    >
      {CONTENT_TYPE_LABELS[type]}
    </span>
  );
}

const STATUS_COLORS: Record<VideoStatus, string> = {
  idea: '#8A8A80',
  script_ready: '#64B4FF',
  voice_ready: '#FFD700',
  edit_ready: '#FF9500',
  scheduled: '#7FFF00',
  uploaded: '#7FFF00',
};

export function StatusBadge({ status }: { status: VideoStatus }) {
  const color = STATUS_COLORS[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-wide px-2 py-0.5 rounded uppercase border"
      style={{ borderColor: `${color}4D`, color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {STATUS_LABELS[status]}
    </span>
  );
}
