import type { AppState } from "@/types";

/**
 * Second to resume a video from: where it was left, a few seconds earlier for context.
 * Starts from the beginning if it was finished, nearly finished, or barely started.
 */
export function resumeAt(state: AppState, id: string): number {
  const t = state.videoTime[id] ?? 0;
  if (t < 15 || state.videosDone.includes(id) || (state.videoProgress[id] ?? 0) > 0.97) return 0;
  return Math.max(0, t - 3);
}

export const clock = (sec: number) => {
  const s = Math.floor(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
};
