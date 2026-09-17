import type { Metadata, Viewport } from 'next'
import { BRANCH } from '../data/config'
import { Dock } from '../components/site/Dock'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: `${BRANCH.name} — walk in`,
    template: `%s · ${BRANCH.shortName}`,
  },
  description: `${BRANCH.name} at ${BRANCH.institute}, ${BRANCH.location}. Walk the town, read the three houses, and find out what the branch actually does.`,
  applicationName: BRANCH.shortName,
  keywords: [BRANCH.shortName, 'IEEE', 'student branch', BRANCH.institute, 'engineering', BRANCH.location],
  openGraph: {
    type: 'website',
    siteName: BRANCH.shortName,
    title: `${BRANCH.name} — walk in`,
    description: `A playable town. Three houses: technical, non-technical, and how to join. ${BRANCH.institute}.`,
  },
}

export const viewport: Viewport = {
  themeColor: '#05070d',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="antialiased">
      <head>
        {/* Reveal/RevealText ship their hidden state as an inline style, which
            only a script removes. Without JS the whole page would be blank
            prose; !important outbids a normal inline declaration. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
      </head>
      <body>
        <div className="fixed top-0 left-0 w-full h-full scanline z-[2000] pointer-events-none opacity-15"></div>
        {children}
        <Dock />
      </body>
    </html>
  )
}
