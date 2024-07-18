import { ReadOnlyEditor } from '../ReadOnlyEditor'

interface PreviewProps {
  content: string
  contentType: string
  format: string
}

export function Preview({ content, contentType, format }: PreviewProps) {
  if (format === 'image') {
    return (
      <img
        src={`data:${contentType};base64,${content}`}
        style={{
          display: 'block',
          maxWidth: '100%',
          boxShadow: 'var(--shadow-3)',
        }}
      />
    )
  }

  return <ReadOnlyEditor language={format} value={content} />
}
