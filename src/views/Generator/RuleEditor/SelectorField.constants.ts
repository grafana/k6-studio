import { Selector } from '@/types/rules'

export const fromOptions: Array<{
  value: Selector['from']
  label: string
}> = [
  { value: 'headers', label: 'Headers' },
  { value: 'body', label: 'Body' },
  { value: 'url', label: 'URL' },
]

const typeOptions = {
  beginEnd: { value: 'begin-end', label: 'Begin-End' },
  regex: { value: 'regex', label: 'Regex' },
  json: { value: 'json', label: 'JSON' },
  headerName: { value: 'header-name', label: 'Name' },
  text: { value: 'text', label: 'Text' },
} as const

type AllowedSelectorMapType = Record<
  'replacer' | 'extractor',
  Record<Selector['from'], Array<{ value: Selector['type']; label: string }>>
>

export const allowedSelectorMap: AllowedSelectorMapType = {
  replacer: {
    headers: [
      typeOptions.beginEnd,
      typeOptions.regex,
      typeOptions.headerName,
      typeOptions.text,
    ],
    body: [
      typeOptions.beginEnd,
      typeOptions.regex,
      typeOptions.json,
      typeOptions.text,
    ],
    url: [typeOptions.beginEnd, typeOptions.regex, typeOptions.text],
  },

  // Extractor doesn't support literal text as a selector
  extractor: {
    headers: [typeOptions.beginEnd, typeOptions.regex, typeOptions.headerName],
    body: [typeOptions.beginEnd, typeOptions.regex, typeOptions.json],
    url: [typeOptions.beginEnd, typeOptions.regex],
  },
}
