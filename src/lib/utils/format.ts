import { formatDistanceToNow, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

export function formatRemainingTime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (d > 0) return `${d}일 ${h}시간 ${m}분 ${s}초`;
  if (h > 0) return `${h}시간 ${m}분 ${s}초`;
  if (m > 0) return `${m}분 ${s}초`;
  return `${s}초`;
}

export function formatMatchScore(score: number): string {
  return `${Math.round(score * 100)}% 일치`;
}

export function formatRelativeTime(isoString: string): string {
  return formatDistanceToNow(parseISO(isoString), { addSuffix: true, locale: ko });
}

export function secondsUntil(isoString: string): number {
  const diff = new Date(isoString).getTime() - Date.now();
  return Math.max(0, Math.floor(diff / 1000));
}
