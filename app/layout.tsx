import './globals.css'
import { Outfit, IBM_Plex_Mono } from 'next/font/google'
import { Providers } from '@/components/Providers'
import { cn } from '@/lib/utils'

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(outfit.variable, ibmPlexMono.variable)}>
      <head>
        <title>TeleCle — Your socials in one scan</title>
        <meta name="description" content="Generate a QR code that links to all your social profiles" />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
