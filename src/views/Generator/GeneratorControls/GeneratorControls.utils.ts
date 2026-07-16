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
