/**
 * Tooltip for the Validate button. Disabled reasons take priority; when the
 * toolbar is compact the label moves into the tooltip since the button shows
 * only its icon, and there is nothing to add otherwise.
 */
export function getValidateTooltip(
  isScriptExportable: boolean,
  isProxyOnline: boolean,
  isCompact: boolean
): string {
  if (!isScriptExportable) return 'Fix script errors to enable validation'
  if (!isProxyOnline) return 'Start proxy to enable validation'
  if (isCompact) return 'Validate'

  return ''
}

/**
 * Tooltip for the Configure with Assistant button, following the same rules
 * as the Validate one: the disabled reason wins, then the compact label.
 */
export function getConfigureTooltip(
  hasRecording: boolean,
  isCompact: boolean
): string {
  if (!hasRecording) return 'Select a recording to configure with the Assistant'
  if (isCompact) return 'Configure with Assistant'

  return ''
}
