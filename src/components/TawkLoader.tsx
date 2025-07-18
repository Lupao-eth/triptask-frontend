'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function TawkLoader() {
  const pathname = usePathname();

  const shouldShowTawk =
    pathname === '/login' || pathname === '/customer/help';

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!document.getElementById('tawk-script')) {
      const script = document.createElement('script');
      script.id = 'tawk-script';
      script.src = 'https://embed.tawk.to/687973d03d9d30190be7996e/1j0d6opoa';
      script.async = true;
      script.charset = 'UTF-8';
      script.setAttribute('crossorigin', '*');
      document.body.appendChild(script);
    }

    const interval = setInterval(() => {
      if (window.Tawk_API && typeof window.Tawk_API.setAttributes === 'function') {
        if (shouldShowTawk) {
          window.Tawk_API?.showWidget?.();
          console.log('✅ Tawk widget shown');
        } else {
          window.Tawk_API?.hideWidget?.();
          console.log('🚫 Tawk widget hidden');
        }
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [shouldShowTawk]);

  return null;
}
