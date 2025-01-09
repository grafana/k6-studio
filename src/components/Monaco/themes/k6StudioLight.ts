import * as monaco from 'monaco-editor'
import '../languages/log'

export const k6StudioLightBackground = '#fafafa'

monaco.editor.defineTheme('k6-studio-light', {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'error.log', foreground: '#A6201E', fontStyle: 'bold' },
    { token: 'stackTrace.log', foreground: '#A6201E', fontStyle: 'italic' },
    { token: 'timestamp.log', foreground: '#368F2E' },
    { token: 'string.log', foreground: '#A6201E' },
  ],
  colors: {
    'editor.background': k6StudioLightBackground,
  },
})
