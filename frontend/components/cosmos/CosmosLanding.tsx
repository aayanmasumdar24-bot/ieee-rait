'use client';

import dynamic from 'next/dynamic';
import { CosmosFallback } from './CosmosFallback';

// three + gsap are heavy and touch the DOM, so the hero never renders on the
// server and stays out of the route's initial JS. The static fallback holds the
// space (and carries the real <h1>) until the chunk resolves. ssr:false is only
// allowed inside a Client Component — hence this thin wrapper.
const CosmosHero = dynamic(() => import('./CosmosHero').then((m) => m.CosmosHero), {
  ssr: false,
  loading: () => <CosmosFallback />,
});

export function CosmosLanding() {
  return <CosmosHero />;
}
