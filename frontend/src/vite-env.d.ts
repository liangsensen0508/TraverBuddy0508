/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 接口根地址，如 /api 或 https://api.example.com */
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
