'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Eye, EyeOff } from 'lucide-react'

export default function SysLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError('Invalid credentials')
      setLoading(false)
      return
    }

    // Check if user is blocked
    const { data: blockedData } = await supabase
      .from('blocked_users')
      .select('user_id')
      .eq('user_id', data.user?.id)
      .single()
    
    if (blockedData) {
      await supabase.auth.signOut()
      setError('Your account has been blocked.')
      setLoading(false)
      return
    }

    // Check if user is admin (by email or role in metadata)
    const isAdmin = data.user?.email === 'admin@telecle.com' || 
                    data.user?.user_metadata?.role === 'admin'
    
    // Check if email is confirmed
    const emailConfirmed = data.user?.email_confirmed_at || data.user?.confirmed_at

    if (!isAdmin || !emailConfirmed) {
      await supabase.auth.signOut()
      setError('Unauthorized access')
      setLoading(false)
      return
    }

    router.push('/sys/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-xl">System Access</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Restricted area. Authorized personnel only.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verifying...' : 'Access System'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
