'use client';

import { Layout } from '@/components/Layout';
import { useStandalone } from '@/lib/useStandalone';

export function AppShell({ children }: { children: React.ReactNode }) {
  const isStandalone = useStandalone();

  if (isStandalone) {
    return <main className="min-h-screen">{children}</main>;
  }

  return <Layout>{children}</Layout>;
}
