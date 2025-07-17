// types/tawk.d.ts
export {};

declare global {
  interface Window {
    Tawk_API?: {
      [key: string]: unknown;
      toggle?: () => void;
      onLoad?: () => void;
    };
  }
}
