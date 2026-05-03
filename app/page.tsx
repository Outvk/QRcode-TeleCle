'use client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useAuth } from '@/components/Providers'
import { QrCode, Zap, Lock, Infinity, User, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase'

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b backdrop-blur-xl bg-white/10 dark:bg-black/10 border-white/20 dark:border-white/10">
        <div className="flex items-center gap-2">
          <img src="/tèlèclè-8.svg" alt="TeleCle" className="h-8 w-5 dark:invert dark:opacity-90 transition-all duration-200" />
          <span className="font-semibold text-md tracking-tight">TèlèClè</span>
        </div>
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => router.push('/profiles')}>
                Profiles
              </Button>
              <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
                Dashboard
              </Button>
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => router.push('/auth')}>Sign in</Button>
              <Button size="sm" onClick={() => router.push('/auth')}>Get started</Button>
              <ThemeToggle />
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        {/* Animated QR Code above badge */}
        <div className="w-full max-w-[200px] h-6 mb-2 relative overflow-hidden ">
          <img 
            src="/qr-code.svg" 
            alt="QR Code" 
            className="h-4 w-4 absolute top-1 animate-roll-qr dark:invert ml-1"
          />
          {/* Sparkle trail - 8 small dots (black in light mode, white in dark mode) */}
          <div className="absolute top-2 left-0 w-1 h-1 rounded-full bg-foreground animate-sparkle-1 shadow-[0_0_4px_rgba(0,0,0,0.5)] dark:shadow-[0_0_4px_rgba(255,255,255,0.5)]" />
          <div className="absolute top-1 left-0 w-px h-px rounded-full bg-foreground animate-sparkle-2" />
          <div className="absolute top-3 left-0 w-px h-px rounded-full bg-foreground animate-sparkle-3" />
          <div className="absolute top-1.5 left-0 w-px h-px rounded-full bg-foreground animate-sparkle-4 opacity-80" />
          <div className="absolute top-2.5 left-0 w-px h-px rounded-full bg-foreground animate-sparkle-5" />
          <div className="absolute top-0.5 left-0 w-px h-px rounded-full bg-foreground animate-sparkle-6" />
          <div className="absolute top-3.5 left-0 w-px h-px rounded-full bg-foreground animate-sparkle-7 opacity-70" />
          <div className="absolute top-1 left-0 w-px h-px rounded-full bg-foreground animate-sparkle-8" />
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground mb-6">
          <Zap className="h-3 w-3" /> Free forever — no subscriptions
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 max-w-xl">
          All your socials,<br />one QR code
        </h1>
        <p className="text-muted-foreground max-w-sm mb-8 text-sm leading-relaxed">
          Create a free profile page with all your social links. Generate a permanent QR code and share it anywhere — a business card, a poster, a bio.
        </p>
        <div className="flex gap-3">
          <Button size="lg" onClick={() => router.push('/auth')}>
            Create your page
          </Button>
          <Button size="lg" variant="outline" onClick={() => router.push('/auth')}>
            Sign in
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 max-w-2xl w-full">
          {[
            { icon: <Infinity className="h-4 w-4" />, title: 'Free forever', desc: 'No paid plans. No expiring QR codes.' },
            { icon: <Zap className="h-4 w-4" />, title: 'Instant setup', desc: 'Your page is live in under a minute.' },
            { icon: <Lock className="h-4 w-4" />, title: 'You own your links', desc: 'Hosted on your own domain. No middlemen.' },
          ].map(f => (
            <div key={f.title} className="rounded-xl border bg-card p-5 text-left">
              <div className="text-muted-foreground mb-2">{f.icon}</div>
              <h3 className="font-medium text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-12 bg-slate-50/30 dark:bg-background">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4">
            <img src="/tèlèclè-8.svg" alt="TeleCle" className="h- w-4 dark:invert dark:opacity-90 transition-all duration-200" />
            <span className="font-bold text-md tracking-tight italic">TèlèClè</span>
          </div>
          <p className="text-xs text-muted-foreground text-center max-w-xs mb-8 leading-relaxed font-medium">
            The simplest way to bridge your physical and digital presence. 100% free and open forever.
            <br />
            <span className="text-muted-foreground/50">"MADE BY CHOUAIB"</span>
          </p>
          <a 
            href="https://www.instagram.com/out_vk/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-xs font-normal normal-case tracking-normal mb-6"
          >
            Talk to Developer
          </a>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent mb-8" />
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4 text-[10px] font-medium text-muted-foreground/50">
            <div className="flex items-center gap-4">
              <p className="uppercase tracking-widest font-bold"> {new Date().getFullYear()} TeleCle</p>
              <span className="text-muted-foreground/30">|</span>
              <a 
                href="https://wa.me/213559725428" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[#25D366] normal-case"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                WhatsApp
              </a>
              <a 
                href="https://www.instagram.com/telee_cle/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[#E1306C] normal-case"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069ZM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0Zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881Z"/></svg>
                Instagram: <span className="font-semibold">@telee_cle</span>
              </a>
            </div>
            <div className="flex gap-6 uppercase tracking-widest font-bold">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
