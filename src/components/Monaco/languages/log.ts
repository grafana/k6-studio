import * as monaco from 'monaco-editor'

monaco.languages.register({ id: 'log' })
monaco.languages.setMonarchTokensProvider('log', {
  tokenizer: {
    root: [
      [/\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}.\d{3}]/, 'timestamp'],
      [/\[error]/, 'error'],
      [/^\s*at.*$/, 'stackTrace'],
      [/['"].*?['"]/, 'string'],
    ],
  },
})
