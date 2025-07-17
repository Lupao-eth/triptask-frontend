'use client';

import { useEffect, useState } from 'react';

export default function TawkLoader() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || loaded) return;

    const script = document.createElement('script');
    script.src = 'https://embed.tawk.to/687973d03d9d30190be7996e/1j0d6opoa'; // ✅ Your Tawk.to widget URL
    script.async = true;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    // Setup Tawk_API before script loads
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_API.onLoad = function () {
      if (typeof window.Tawk_API?.hide === 'function') {
        window.Tawk_API.hide(); // 🔒 Hide float widget by default
        console.log('✅ Tawk loaded and widget hidden');
      }
      setLoaded(true);
    };

    document.body.appendChild(script);
  }, [loaded]);

  return null;
}
