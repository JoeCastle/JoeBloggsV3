'use client';

import { useEffect } from 'react';

export default function ScrollToAnchor(): null {
  useEffect(() => {
    const hash = window.location.hash?.slice(1);

    if (hash && document.getElementById(hash)) {
      // Delay to ensure the DOM is fully rendered
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }
  }, []);

  return null;
}
