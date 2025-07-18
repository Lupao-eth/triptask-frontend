'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function TawkLoader() {
  const pathname = usePathname();

  const shouldLoadTawk =
    pathname === '/login' || pathname === '/customer/help';

  useEffect(() => {
    const loadTawk = () => {
      if (typeof window === 'undefined') return;
      if (document.getElementById('tawk-script')) return;

      // Reinitialize flag
      window.Tawk_LoadStart = new Date();
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
    };

    if (shouldLoadTawk) {
      loadTawk();
    }

    return () => {
      if (typeof window === 'undefined') return;

      const existing = document.getElementById('tawk-script');
      if (existing) {
        existing.remove();
        console.log('❌ Tawk script removed');
      }

      // Clear globals to allow fresh load next time
      delete window.Tawk_API;
      delete window.Tawk_LoadStart;
      window.TAWK_READY = false;
    };
  }, [shouldLoadTawk]);

  return null;
}
