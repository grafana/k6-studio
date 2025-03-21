import { JsonPreview } from '@/components/JsonPreview'
import { ReadOnlyEditor } from '@/components/Monaco/ReadOnlyEditor'

import { Font } from './Font'

interface PreviewProps {
  content: string
  contentType: string
  format: string
}

export function Preview({ content, contentType, format }: PreviewProps) {
  if (format === 'html') {
    return (
      <iframe
        sandbox="allow-same-origin"
        srcDoc={content}
        style={{ width: '100%', height: '100%' }}
      />
    )
  }

  if (format === 'audio') {
    return (
      <audio controls>
        <source src={`data:${contentType};base64,${content}`} />
      </audio>
    )
  }

  if (format === 'font') {
    return <Font url={`data:${contentType};base64,${content}`} />
  }

  if (format === 'image') {
    return (
      <img src={`data:${contentType};base64,${content}`} style={mediaStyles} />
    )
  }

  if (format === 'video') {
    return (
      <video controls style={mediaStyles}>
        <source src={`data:${contentType};base64,${content}`} />
      </video>
    )
  }

  if (format === 'json') {
    return (
      // TODO: https://github.com/grafana/k6-studio/issues/277
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      <JsonPreview content={JSON.parse(content)} />
    )
  }

  return <ReadOnlyEditor language={format} value={content} />
}

const mediaStyles = {
  display: 'block',
  maxWidth: '100%',
  boxShadow: 'var(--shadow-3)',
}
