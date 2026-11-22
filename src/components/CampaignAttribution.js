'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getCampaignAttribution } from '@/lib/campaign-attribution.mjs';

export function CampaignAttribution() {
  const pathname = usePathname();
  useEffect(() => { getCampaignAttribution(); }, [pathname]);
  return null;
}
