// src/types/tawk.d.ts

export {};

declare global {
  interface Window {
    Tawk_API?: {
      toggle?: () => void;
      onLoad?: () => void;
      [key: string]: unknown; // 🔒 Avoids `any`, but still flexible
    };
  }
}
