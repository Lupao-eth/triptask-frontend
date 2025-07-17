'use client';

import { useEffect, useState } from 'react';

export default function TawkLoader() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || loaded) return;

    const script = document.createElement('script');
    script.src = 'https://embed.tawk.to/687973d03d9d30190be7996e/1j0d6opoa';
    script.async = true;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_API.onLoad = function () {
      if (window.Tawk_API?.hide) {
        window.Tawk_API.hide(); // Fully hide on load
        console.log('✅ Tawk loaded and widget hidden');
      }
      setLoaded(true);
    };

    document.body.appendChild(script);
  }, [loaded]);

  return null;
}
