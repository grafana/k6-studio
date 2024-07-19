import { CorrelationRule } from '@/schemas/rules'
import { Header, Request } from '@/types'

export function safeJsonParse(value: string) {
  try {
    return JSON.parse(value)
  } catch (error) {
    console.error('Failed to parse JSON', error)
    return undefined
  }
}

export function replaceCorrelatedValues({
  rule,
  extractedValue,
  uniqueId,
  request,
}: {
  rule: CorrelationRule
  extractedValue: string
  uniqueId: number
  request: Request
}) {
  // Default behaviour replaces all occurences of the string
  if (!rule.replacer) {
    return replaceTextMatches(request, extractedValue, uniqueId)
  }

  // Add logic for replacer
  throw new Error('Not implemented')
}

export function replaceTextMatches(
  request: Request,
  extractedValue: string,
  uniqueId: number
): Request {
  const content = request.content.replaceAll(
    extractedValue,
    `\${correl_${uniqueId}}`
  )
  const url = request.url.replaceAll(extractedValue, `\${correl_${uniqueId}}`)
  const path = request.path.replaceAll(extractedValue, `\${correl_${uniqueId}}`)
  const headers: Header[] = request.headers.map(([key, value]) => {
    const replacedValue = value.replaceAll(
      extractedValue,
      `\${correl_${uniqueId}}`
    )
    return [key, replacedValue]
  })

  return {
    ...request,
    content,
    url,
    path,
    headers,
  }
}
