import { ImmerStateCreator } from '@/utils/typescript'

interface Actions {
  setScriptName: (scriptName: string) => void
  setWizardUsed: (wizardUsed: boolean) => void
}

interface State {
  scriptName: string
  wizardUsed: boolean
}

export type ScriptDataStore = State & Actions

export const createScriptDataSlice: ImmerStateCreator<ScriptDataStore> = (
  set
) => ({
  scriptName: 'my-script.js',
  wizardUsed: false,

  setScriptName: (scriptName: string) =>
    set((state) => {
      state.scriptName = scriptName
    }),

  setWizardUsed: (wizardUsed: boolean) =>
    set((state) => {
      state.wizardUsed = wizardUsed
    }),
})
