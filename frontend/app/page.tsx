import { SiteNav, CinematicFooter } from '../components/site';
import { CosmosLanding } from '../components/cosmos/CosmosLanding';

/**
 * The landing page IS the cosmos experience: a WebGL flight through space with
 * the committee's story told across four scroll sections, then a grounded join
 * panel. The playable town lives at /play; every CTA here points there.
 *
 * SiteNav frames the top; a cinematic footer closes it (brand, routes, socials,
 * back-to-top). All the copy comes from data via components/cosmos/content.ts, so the page and the
 * game stay one voice. A Server Component — the heavy hero is a client island
 * dynamically imported inside CosmosLanding.
 */
export default function Home() {
  return (
    <>
      <SiteNav links={[{ href: '#join', label: 'JOIN' }]} />

      <main id="main" tabIndex={-1} className="focus-visible:outline-none">
        <CosmosLanding />
      </main>

      <CinematicFooter />
    </>
  );
}
