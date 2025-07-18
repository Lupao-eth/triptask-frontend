'use client';

import { useEffect } from 'react';

export default function TawkLoader() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.Tawk_API || document.getElementById('tawk-script')) return;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_API.onLoad = function () {
      console.log('✅ Tawk loaded');
      window.TAWK_READY = true;
    };

    const script = document.createElement('script');
    script.id = 'tawk-script';
    script.src = 'https://embed.tawk.to/687973d03d9d30190be7996e/1j0d6opoa';
    script.async = true;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    document.body.appendChild(script);
  }, []);

  return null;
}
