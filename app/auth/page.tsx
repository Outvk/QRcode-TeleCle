'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useAuth } from '@/components/Providers'
import { QrCode, Loader2 } from 'lucide-react'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // Check rate limit for login attempts (5 attempts per 15 minutes)
    const { data: rateLimitData, error: rateLimitError } = await supabase
      .rpc('check_rate_limit', {
        p_identifier: email.toLowerCase(),
        p_action: 'login',
        p_max_attempts: 5,
        p_window_minutes: 15
      })
    
    if (rateLimitError || !rateLimitData) {
      setMessage('Too many login attempts. Please try again in 15 minutes.')
      setLoading(false)
      return
    }

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setMessage(error.message)
      } else {
        setMessage('Check your email for a confirmation link!')
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setMessage(error.message)
      } else {
        // Check if user is blocked
        const { data: blockedData } = await supabase
          .from('blocked_users')
          .select('user_id')
          .eq('user_id', data.user?.id)
          .single()
        
        if (blockedData) {
          await supabase.auth.signOut()
          setMessage('Your account has been blocked. Contact support.')
          setLoading(false)
          return
        }
        
        router.push('/dashboard')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b">
        <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src="/tèlèclè-8.svg" alt="TeleCle" className="h-8 w-5 dark:invert dark:opacity-90 transition-all duration-200" />
          <span className="font-semibold text-md tracking-tight letter-spacing-[0.1em]">TèlèClè</span>
        </a>
        <ThemeToggle />
      </nav>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Hero text */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-primary-foreground mb-4">
              <QrCode className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight mb-2">
              {mode === 'login' ? 'Welcome back' : 'Create your profile'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === 'login'
                ? 'Sign in to manage your QR links'
                : 'One QR code. All your socials.'}
            </p>
          </div>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">
                {mode === 'login' ? 'Sign in' : 'Sign up'}
              </CardTitle>
              <CardDescription>
                {mode === 'login'
                  ? 'Enter your credentials to continue'
                  : 'Create a free account to get started'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                </div>

                {message && (
                  <p className={`text-sm ${message.includes('Check') ? 'text-green-600 dark:text-green-400' : 'text-destructive'}`}>
                    {message}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {mode === 'login' ? 'Sign in' : 'Create account'}
                </Button>
              </form>

              <div className="mt-4 text-center text-sm text-muted-foreground">
                {mode === 'login' ? (
                  <>Don't have an account?{' '}
                    <button onClick={() => { setMode('signup'); setMessage('') }} className="text-foreground font-medium hover:underline">
                      Sign up
                    </button>
                  </>
                ) : (
                  <>Already have an account?{' '}
                    <button onClick={() => { setMode('login'); setMessage('') }} className="text-foreground font-medium hover:underline">
                      Sign in
                    </button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
