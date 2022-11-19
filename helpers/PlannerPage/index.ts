/**
 * Convert minutes to readable time
 * @param duration Duration in minutes
 * @returns Duration in hh:mm format
 */
export function formatDuration(duration: number) {
  return new Date(duration * 60 * 1000).toISOString().slice(11, 16);
}
