export function trimToLength(text: string, maxLength: number, ellipsis = '…') {
  if (text.length <= maxLength) {
    return text
  }

  return text.slice(0, maxLength - ellipsis.length) + ellipsis
}
