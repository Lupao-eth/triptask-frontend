'use client';

import { useEffect, useState } from 'react';

export default function TawkLoader() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || loaded) return;

    const script = document.createElement('script');
    script.src = 'https://embed.tawk.to/687973d03d9d30190be7996e/1j0d6opoa'; // ✅ Your Tawk ID
    script.async = true;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    // 👇 Setup the API to hide the widget once loaded
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_API.onLoad = function () {
      window.Tawk_API?.hideWidget?.(); // Hide the widget initially
      console.log('✅ Tawk.to loaded and widget hidden');
      setLoaded(true);
    };

    document.body.appendChild(script);
  }, [loaded]);

  return null;
}
