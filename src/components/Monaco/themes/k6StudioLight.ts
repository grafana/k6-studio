import * as monaco from 'monaco-editor'

export const k6StudioLightBackground = '#fafafa'

monaco.editor.defineTheme('k6-studio-light', {
  base: 'vs',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': k6StudioLightBackground,
  },
})
