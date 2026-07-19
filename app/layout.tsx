import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Saarstahl Green-Steel Simulator',
  description: 'Value & Objection Simulator for green steel partnerships',
  keywords: ['steel', 'sustainability', 'carbon', 'green', 'simulation'],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1e293b',
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-slate-50 dark:bg-slate-950">
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">{children}</body>
    </html>
  )
}
