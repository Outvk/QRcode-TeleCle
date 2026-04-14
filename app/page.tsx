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
          <ThemeToggle />
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
                Dashboard
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => router.push('/auth')}>Sign in</Button>
              <Button size="sm" onClick={() => router.push('/auth')}>Get started</Button>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
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
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-xs font-normal normal-case tracking-normal mb-8"
            >
                Talk to Developer
            </a>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent mb-8" />
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4 text-[10px] uppercase tracking-widest font-bold text-muted-foreground/50">
            <p>© {new Date().getFullYear()} TeleCle. All rights reserved.</p>
            <div className="flex gap-6">
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
