export {};

declare global {
  interface ImportMetaEnv {
    VITE_SHEET_CSV_URL?: string;
    VITE_GOOGLE_API_KEY?: string;
    VITE_GOOGLE_SHEET_ID?: string;
    VITE_GOOGLE_SHEET_RANGE?: string;
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}


