import * as monaco from 'monaco-editor'
import '../languages/log'

export const k6StudioDarkBackground = '#1E1E1E'

monaco.editor.defineTheme('k6-studio-dark', {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'error.log', foreground: '#CE9178', fontStyle: 'bold' },
    { token: 'stackTrace.log', foreground: '#CE9178', fontStyle: 'italic' },
    { token: 'timestamp.log', foreground: '#368F2E' },
    { token: 'string.log', foreground: '#CE9178' },
  ],
  colors: {
    'editor.background': k6StudioDarkBackground,
  },
})
