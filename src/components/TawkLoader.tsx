// src/components/TawkLoader.tsx
'use client';

import { useEffect, useState } from 'react';

export default function TawkLoader() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || window.Tawk_API || loaded) return;

    const script = document.createElement('script');
    script.src = 'https://embed.tawk.to/YOUR_TAWK_ID/DEFAULT';
    script.async = true;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    script.onload = () => {
      setLoaded(true);
      console.log('✅ Tawk.to loaded');
    };

    document.body.appendChild(script);
  }, [loaded]);

  return null;
}
