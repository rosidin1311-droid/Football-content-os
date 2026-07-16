export type ContentType = 'taktik' | 'berita' | 'highlight' | 'shorts';

export type VideoStatus =
  | 'idea'
  | 'script_ready'
  | 'voice_ready'
  | 'edit_ready'
  | 'scheduled'
  | 'uploaded';

export interface Video {
  id: string;
  user_id: string;
  title: string;
  content_type: ContentType;
  hook: string | null;
  script: string | null;
  description: string | null;
  tags: string[] | null;
  thumbnail_text: string | null;
  status: VideoStatus;
  scheduled_date: string | null;
  scheduled_time: string | null;
  duration_target_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  taktik: 'Taktik & Analisis',
  berita: 'Berita & Transfer',
  highlight: 'Highlight & Review',
  shorts: 'Shorts',
};

export const CONTENT_TYPE_COLORS: Record<ContentType, string> = {
  taktik: '#7FFF00',
  berita: '#FFD700',
  highlight: '#FF4D6D',
  shorts: '#64B4FF',
};

export const STATUS_LABELS: Record<VideoStatus, string> = {
  idea: 'Ide',
  script_ready: 'Script Siap',
  voice_ready: 'Voice Siap',
  edit_ready: 'Edit Siap',
  scheduled: 'Terjadwal',
  uploaded: 'Sudah Upload',
};

export const STATUS_ORDER: VideoStatus[] = [
  'idea',
  'script_ready',
  'voice_ready',
  'edit_ready',
  'scheduled',
  'uploaded',
];
