import { StudioUIStore } from './useStudioUIStore'

export function selectFileCountPerType(state: StudioUIStore) {
  return {
    recordings: state.recordings.size,
    generators: state.generators.size,
    browserTests: state.browserTests.size,
    scripts: state.scripts.size,
    dataFiles: state.dataFiles.size,
  }
}
