/// <reference types="vite/client" />

declare const __APP_VERSION__: string

interface ImportMetaEnv {
  readonly VITE_TARGET?: string
  readonly VITE_STUDIO_BRIDGE_WS?: string
}

declare const K6_API_URL: string
declare const GRAFANA_CLIENT_ID: string
declare const GRAFANA_API_URL: string
declare const GRAFANA_COM_URL: string

declare const TARGET_PLATFORM: NodeJS.Platform
