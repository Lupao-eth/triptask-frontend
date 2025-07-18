'use client';

import { useEffect } from 'react';

export default function TawkLoader() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Prevent injecting the script more than once
    if (document.getElementById('tawk-script')) return;

    // Define Tawk_API and hide the widget on load
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_API.onLoad = () => {
      if (typeof window.Tawk_API?.hideWidget === 'function') {
        window.Tawk_API.hideWidget();
        console.log('✅ Tawk widget loaded and hidden');
      } else {
        console.warn('❗ Tawk widget loaded but hideWidget not available');
      }
    };

    // Inject the Tawk script
    const script = document.createElement('script');
    script.id = 'tawk-script';
    script.src = 'https://embed.tawk.to/687973d03d9d30190be7996e/1j0d6opoa';
    script.async = true;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    document.body.appendChild(script);

    // 🔴 Cleanup logic when component unmounts (leave page)
    return () => {
      const existingScript = document.getElementById('tawk-script');
      if (existingScript) {
        existingScript.remove();
        console.log('🧹 Tawk script removed');
      }
      // Clean up global object
      delete window.Tawk_API;
    };
  }, []);

  return null;
}
