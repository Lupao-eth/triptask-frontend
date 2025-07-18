export {};

declare global {
  interface Window {
    Tawk_API?: {
      toggle?: () => void;
      show?: () => void;
      hide?: () => void;
      showWidget?: () => void;
      hideWidget?: () => void;
      onLoad?: () => void;
      [key: string]: unknown;
    };
    TAWK_READY?: boolean;
  }
}
