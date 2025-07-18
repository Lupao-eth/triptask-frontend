'use client';

import { useEffect } from 'react';

export default function TawkLoader() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.Tawk_API) return; // already loaded

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_API.onLoad = function () {
      if (typeof window.Tawk_API?.hideWidget === 'function') {
        window.Tawk_API.hideWidget();
        console.log('✅ Tawk loaded and widget hidden');
      }
    };

    const script = document.createElement('script');
    script.src = 'https://embed.tawk.to/687973d03d9d30190be7996e/1j0d6opoa';
    script.async = true;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    document.body.appendChild(script);
  }, []);

  return null;
}
