export function formatTime(milliseconds: number) {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  const minutesStr = minutes.toString().padStart(2, '0')
  const secondsStr = seconds.toString().padStart(2, '0')

  return `${minutesStr}:${secondsStr}`
}
