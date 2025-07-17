// src/types/tawk.d.ts
export {};

declare global {
  interface Window {
    Tawk_API?: {
      toggle?: () => void;
      hideWidget?: () => void;
      showWidget?: () => void;
      onLoad?: () => void;
      [key: string]: unknown;
    };
  }
}
