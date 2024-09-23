import { ImmerStateCreator } from '@/utils/typescript'

interface Actions {
  setScriptName: (scriptName: string) => void
}

interface State {
  scriptName: string
}

export type ScriptDataStore = State & Actions

export const createScriptDataSlice: ImmerStateCreator<ScriptDataStore> = (
  set
) => ({
  scriptName: 'my-script.js',

  setScriptName: (scriptName: string) =>
    set((state) => {
      state.scriptName = scriptName
    }),
})
