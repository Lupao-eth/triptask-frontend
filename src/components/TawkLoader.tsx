'use client';

import { useEffect, useState } from 'react';

export default function TawkLoader() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || loaded) return;

    // Prevent loading script multiple times
    if (document.getElementById('tawk-script')) return;

    // Set up Tawk_API and hide on load
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_API.onLoad = function () {
      if (typeof window.Tawk_API?.hide === 'function') {
        window.Tawk_API.hide(); // Hide the widget immediately
        console.log('✅ Tawk loaded and widget hidden');
      }
      setLoaded(true);
    };

    const script = document.createElement('script');
    script.id = 'tawk-script';
    script.src = 'https://embed.tawk.to/687973d03d9d30190be7996e/1j0d6opoa'; // ✅ Your widget URL
    script.async = true;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    document.body.appendChild(script);
  }, [loaded]);

  return null;
}
