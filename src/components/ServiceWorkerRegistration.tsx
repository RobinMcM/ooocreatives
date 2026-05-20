'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/pwa-utils';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null;
}
