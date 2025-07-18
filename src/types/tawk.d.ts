// src/types/tawk.d.ts
export {};

declare global {
  interface Window {
    Tawk_API?: {
      toggle?: () => void;
      show?: () => void;
      hide?: () => void;
      showWidget?: () => void;
      hideWidget?: () => void;
      maximize?: () => void;
      onLoad?: () => void;
      [key: string]: unknown;
    };
    Tawk_LoadStart?: Date;
    TAWK_READY?: boolean;
  }
}
