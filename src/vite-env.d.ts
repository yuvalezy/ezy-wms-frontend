/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_SERVER_URL?: string
  readonly VITE_APP_DEBUG?: string
  readonly VITE_APP_TEST?: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}