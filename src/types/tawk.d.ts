// src/types/tawk.d.ts
export {};

declare global {
  interface Window {
    Tawk_API?: {
      toggle?: () => void;
      show?: () => void;
      hide?: () => void;
      onLoad?: () => void;
      [key: string]: unknown;
    };
  }
}
