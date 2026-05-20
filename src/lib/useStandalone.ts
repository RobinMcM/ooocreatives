import { useEffect, useState } from 'react';

export function useStandalone() {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone =
      (navigator as any).standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);
  }, []);

  return isStandalone;
}
