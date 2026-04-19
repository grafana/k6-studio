import type { Studio } from '@/preload'
import type { RunInCloudState } from '@/components/RunInCloudDialog/states/types'
import type { Script, RunInCloudResult } from '@/handlers/cloud/types'
import type { StreamChatRequest, StreamChatChunk, TokenUsage } from '@/handlers/ai/types'
import type { AssistantAuthResult, AssistantAuthStatus } from '@/handlers/ai/a2a/assistantAuth'
import type { StackHealthStatus } from '@/handlers/ai/a2a/stackHealth'
import type { OpenScriptResult } from '@/handlers/script/types'
import type { GetFilesResponse } from '@/handlers/ui/types'
import type { UsageEvent } from '@/services/usageTracking/types'
import { AppSettingsSchema } from '@/schemas/settings'
import type { BrowserEvent, Recording } from '@/schemas/recording'
import type { UserProfiles, StackInfo } from '@/schemas/profile'
import type { SignInProcessState, SignInResult } from '@/types/auth'
import type {
  ChangeStackResponse,
  SignOutResponse,
} from '@/handlers/auth/types'
import type { AppSettings } from '@/types/settings'
import type { ProxyData, ProxyStatus, StudioFile } from '@/types'
import type { LogEntry, Check } from '@/schemas/k6'
import type { GeneratorFileData } from '@/types/generator'
import type { BrowserTestFile } from '@/schemas/browserTest/v1'
import type { DataFilePreview } from '@/types/testData'
import type { AddToastPayload } from '@/types/toast'
import type { BrowserActionEvent, BrowserReplayEvent } from '@/main/runner/schema'
import type { LaunchBrowserOptions } from '@/recorder/types'
import { runValidatorSession as runValidatorSessionImpl } from '@/utils/runValidatorSession'

const WEB_UNAVAILABLE =
  'This action is not available when k6 Studio is run in the web browser. Use the desktop app for full functionality.'

function notAvailable<T = void>(): Promise<T> {
  return Promise.reject(new Error(WEB_UNAVAILABLE))
}

const noop = () => {}
const noopUnsub = () => noop

const emptyFiles: GetFilesResponse = {
  recordings: [],
  generators: [],
  scripts: [],
  dataFiles: [],
  browserTests: [],
  validatorRuns: [],
}

const emptyPreview: DataFilePreview = {
  type: 'csv',
  props: [],
  data: [],
  total: 0,
}

const browserDefaultSettings: AppSettings = {
  version: '4.0',
  proxy: {
    mode: 'regular',
    port: 6000,
    automaticallyFindPort: true,
    sslInsecure: false,
  },
  recorder: { detectBrowserPath: true },
  windowState: { width: 1200, height: 800, x: 0, y: 0, isMaximized: true },
  telemetry: { usageReport: true, errorReport: true },
  appearance: { theme: 'system' },
  ai: { provider: 'openai' },
}

const SETTINGS_STORAGE_KEY = 'k6-studio-web-settings'

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) {
      return browserDefaultSettings
    }
    const parsed = JSON.parse(raw) as unknown
    const merged = { ...browserDefaultSettings, ...(parsed as object) }
    return AppSettingsSchema.parse(merged)
  } catch {
    return browserDefaultSettings
  }
}

async function saveSettings(settings: AppSettings) {
  const parsed = AppSettingsSchema.parse(settings)
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(parsed))
}

const emptyProfiles: UserProfiles = {
  currentStack: '',
  stacks: {},
}

const openScriptUnavailable: OpenScriptResult = {
  script: '',
  isExternal: false,
  options: {},
}

const browserStudio = {
  auth: {
    getProfiles: async () => emptyProfiles,
    signIn: async (): Promise<SignInResult> => ({ type: 'aborted' }),
    retryStack: noop,
    selectStack: noop,
    abortSignIn: async () => {},
    signOut: async (_stack: StackInfo): Promise<SignOutResponse> => ({
      current: null,
      profiles: emptyProfiles,
    }),
    changeStack: async (_stackId: string): Promise<ChangeStackResponse> =>
      notAvailable(),
    onStateChange: (_callback: (state: SignInProcessState) => void) =>
      noopUnsub,
  },

  proxy: {
    launchProxy: async () => {},
    stopProxy: async () => {},
    onProxyData: (_callback: (data: ProxyData) => void) => noopUnsub,
    getProxyStatus: async (): Promise<ProxyStatus> => 'offline',
    onProxyStatusChange: (_callback: (status: ProxyStatus) => void) =>
      noopUnsub,
    checkProxyHealth: async () => false,
  },

  browser: {
    launchBrowser: async (_options: LaunchBrowserOptions) =>
      Promise.reject(
        new Error(
          `${WEB_UNAVAILABLE} Run Grafana k6 Studio with the web bridge enabled — for example: npm run start:bridge — then reload this page so recording can open a real browser through the desktop app.`
        )
      ),
    stopBrowser: noop,
    onBrowserClosed: (_callback: () => void) => noopUnsub,
    onBrowserLaunchError: (_callback: (error: unknown) => void) =>
      noopUnsub,
    openExternalLink: async (url: string) => {
      try {
        const parsed = new URL(url)
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          return
        }
        window.open(parsed.toString(), '_blank', 'noopener,noreferrer')
      } catch {
        // ignore invalid URLs
      }
    },
    onBrowserEvent: (_callback: (event: BrowserEvent[]) => void) =>
      noopUnsub,
  },

  script: {
    showScriptSelectDialog: async () => undefined,
    openScript: async (_scriptPath: string): Promise<OpenScriptResult> =>
      openScriptUnavailable,
    runScriptFromGenerator: async (_script: string, _shouldTrack?: boolean) =>
      notAvailable(),
    saveScript: async (_script: string, _fileName: string) => notAvailable(),
    runScript: async (_scriptPath: string) => notAvailable(),
    stopScript: noop,
    onScriptLog: (_callback: (data: LogEntry) => void) => noopUnsub,
    onScriptStarted: (_callback: () => void) => noopUnsub,
    onScriptStopped: (_callback: () => void) => noopUnsub,
    onScriptFinished: (_callback: () => void) => noopUnsub,
    onScriptFailed: (_callback: () => void) => noopUnsub,
    onScriptCheck: (_callback: (data: Check[]) => void) => noopUnsub,
    onBrowserAction: (_callback: (data: BrowserActionEvent) => void) =>
      noopUnsub,
    onBrowserReplay: (_callback: (events: BrowserReplayEvent[]) => void) =>
      noopUnsub,
    runValidatorSession: runValidatorSessionImpl,
  },

  data: {
    importFile: async () => undefined,
    loadPreview: async (_filePath: string): Promise<DataFilePreview> =>
      Promise.resolve(emptyPreview),
  },

  har: {
    saveFile: async (_data: Recording, _prefix: string) => notAvailable(),
    openFile: async (_filePath: string) => notAvailable<Recording>(),
    importFile: async () => undefined,
  },

  ui: {
    toggleTheme: noop,
    detectBrowser: async () => false,
    openContainingFolder: async (_file: StudioFile) =>
      Promise.resolve(WEB_UNAVAILABLE),
    openFileInDefaultApp: async (_file: StudioFile) =>
      Promise.resolve(WEB_UNAVAILABLE),
    deleteFile: async (_file: StudioFile) => notAvailable(),
    getFiles: async (): Promise<GetFilesResponse> => emptyFiles,
    renameFile: async (
      _fileName: string,
      _newName: string,
      _type: StudioFile['type']
    ) => notAvailable(),
    reportIssue: async () => {},
    onAddFile: (_callback: (file: StudioFile) => void) => noopUnsub,
    onRemoveFile: (_callback: (file: StudioFile) => void) => noopUnsub,
    onToast: (_callback: (toast: AddToastPayload) => void) => noopUnsub,
  },

  validatorRun: {
    saveSession: async (
      _data: Recording,
      _runSourceLabel: string,
      _startedAtMs: number
    ) => undefined,
    openFile: async (_fileName: string) => notAvailable<Recording>(),
  },

  generator: {
    createGenerator: async (_recordingPath: string) => notAvailable(),
    saveGenerator: async (_generator: GeneratorFileData, _fileName: string) =>
      notAvailable(),
    loadGenerator: async (_fileName: string) =>
      notAvailable<GeneratorFileData>(),
  },

  browserTest: {
    create: async () => notAvailable<string>(),
    open: async (_fileName: string) => notAvailable<BrowserTestFile>(),
    save: async (_fileName: string, _data: BrowserTestFile) => notAvailable(),
  },

  app: {
    platform: 'linux' as NodeJS.Platform,
    onApplicationClose: (_callback: () => void) => noopUnsub,
    closeApplication: noop,
    changeRoute: noop,
    trackEvent: (_event: UsageEvent) => {},
    onDeepLink: (_callback: (url: string) => void) => noopUnsub,
  },

  log: {
    openLogFolder: noop,
    getLogContent: async () => '',
    onLogChange: (_callback: (content: string) => void) => noopUnsub,
  },

  settings: {
    getSettings: async () => loadSettings(),
    saveSettings,
    selectBrowserExecutable: async () => undefined,
    selectUpstreamCertificate: async () => undefined,
    isEncryptionAvailable: async () => false,
  },

  browserRemote: {
    highlightElement: noop,
    navigateTo: noop,
  },

  cloud: {
    run: async (_script: Script): Promise<RunInCloudResult> =>
      ({ type: 'aborted' }),
    signedIn: noop,
    onStateChange: (_callback: (state: RunInCloudState) => void) =>
      noopUnsub,
  },

  ai: {
    streamChat: (_request: StreamChatRequest) => ({
      onChunk: (_callback: (chunk: StreamChatChunk) => void) => noopUnsub,
      onEnd: (_callback: (usage?: TokenUsage) => void) => noopUnsub,
      abort: noop,
    }),
    onAssistantVerificationCode: (_callback: (code: string) => void) =>
      noopUnsub,
    assistantSignIn: async (): Promise<AssistantAuthResult> => ({
      type: 'error',
      error: WEB_UNAVAILABLE,
    }),
    assistantCancelSignIn: async () => {},
    assistantGetStatus: async (): Promise<AssistantAuthStatus> => ({
      authenticated: false,
      stackId: null,
      stackName: null,
    }),
    assistantSignOut: async () => {},
    assistantWakeStack: async () => {},
    assistantCheckStackHealth: async (): Promise<StackHealthStatus> =>
      'loading',
  },
} as const

export function createBrowserStudio(): Studio {
  return browserStudio as unknown as Studio
}
