/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHEETS_ENDPOINT?: string;
  readonly VITE_SHEETS_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
