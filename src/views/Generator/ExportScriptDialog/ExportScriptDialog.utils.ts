export function getScriptNameWithExtension(scriptName: string) {
  return scriptName.endsWith('.js') ? scriptName : `${scriptName}.js`
}
