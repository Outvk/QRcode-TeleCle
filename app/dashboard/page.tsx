'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ThemeToggle'
import { QRCodeSVG } from 'qrcode.react'
import { SOCIAL_PLATFORMS } from '@/lib/utils'
import {
  QrCode, LogOut, Save, Loader2, ExternalLink,
  Download, Copy, Check, User, Plus, Trash2, ChevronDown
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()

  const [profiles, setProfiles] = useState<any[]>([])
  const [currentProfile, setCurrentProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  // Form states (linked to currentProfile)
  const [links, setLinks] = useState<Record<string, string>>({})
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  
  const [copied, setCopied] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  async function loadProfiles(selectId?: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (data && data.length > 0) {
      setProfiles(data)
      const toSelect = selectId ? data.find(p => p.id === selectId) : data[0]
      selectProfile(toSelect || data[0])
    } else {
      setProfiles([])
      setCurrentProfile(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadProfiles()
  }, [])

  function selectProfile(p: any) {
    setCurrentProfile(p)
    setDisplayName(p.display_name || '')
    setUsername(p.username || '')
    setBio(p.bio || '')
    setLinks(p.links || {})
  }

  async function handleSave() {
    if (!currentProfile) return
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ 
        display_name: displayName, 
        username, 
        bio, 
        links, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', currentProfile.id)

    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      // Update local profiles list
      setProfiles(prev => prev.map(p => p.id === currentProfile.id ? { ...p, display_name: displayName, username, bio, links } : p))
    } else {
      alert('Error saving: ' + error.message)
    }
  }

  async function handleCreateProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setSaving(true)
    const newUsername = `profile_${Math.floor(Math.random() * 10000)}`
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        username: newUsername,
        display_name: 'New Profile',
        links: {}
      })
      .select()
      .single()

    setSaving(false)
    if (data) {
      await loadProfiles(data.id)
    } else {
      alert('Error creating profile: ' + error?.message)
    }
  }

  async function handleDeleteProfile() {
    if (!currentProfile || profiles.length <= 1) {
      alert("You must have at least one profile.")
      return
    }
    if (!confirm("Are you sure you want to delete this profile? This cannot be undone.")) return

    setDeleting(true)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', currentProfile.id)

    setDeleting(false)
    if (!error) {
      await loadProfiles()
    } else {
      alert('Error deleting: ' + error.message)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(`${siteUrl}/${username}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownloadQR() {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return
    const data = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([data], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `qrlinks-${username}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  const profileUrl = `${siteUrl}/${username}`

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-background">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-background/95 backdrop-blur z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            <span className="font-bold text-sm tracking-tight">QRLinks</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 h-9 border-dashed">
                <span className="max-w-[100px] truncate">{currentProfile?.display_name || currentProfile?.username}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>My Profiles</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {profiles.map(p => (
                <DropdownMenuItem key={p.id} onClick={() => selectProfile(p)} className="flex items-center justify-between">
                  {p.display_name || p.username}
                  {p.id === currentProfile?.id && <Check className="h-3 w-3" />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleCreateProfile} className="text-primary focus:text-primary">
                <Plus className="h-3.5 w-3.5 mr-2" />
                Create New Profile
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push(`/${username}`)} 
            className="gap-2 hidden sm:flex"
            disabled={!username}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View
          </Button>
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Log out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </nav>

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT: Menu / Profiles List (Mobile only maybe?) - We'll skip and stay on main layout */}

        {/* MIDDLE: Edit form */}
        <div className="lg:col-span-8 space-y-6">

          {/* Profile info */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4" />
                  Profile details
                </CardTitle>
                <CardDescription>Customise how your public page looks</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleDeleteProfile}
                disabled={profiles.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username (Public URL)</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                    placeholder="yourname"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Tell people a little about yourself..."
                  className="resize-none"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Social links */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Links</CardTitle>
              <CardDescription>Add the platforms you want to show</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {SOCIAL_PLATFORMS.map(p => (
                <div key={p.key} className="space-y-1.5 px-1">
                  <Label htmlFor={p.key} className="flex items-center gap-2 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: p.color }}
                    />
                    {p.label}
                  </Label>
                  <Input
                    id={p.key}
                    type="url"
                    value={links[p.key] || ''}
                    onChange={e => setLinks(prev => ({ ...prev, [p.key]: e.target.value }))}
                    placeholder={p.placeholder}
                    className="h-10"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="sticky bottom-8 bg-background/80 backdrop-blur p-4 rounded-xl border border-primary/10 shadow-lg flex gap-4">
             <Button onClick={handleSave} disabled={saving} className="flex-1 gap-2 font-semibold shadow-md">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saving ? 'Saving changes…' : saved ? 'Changes saved!' : 'Save changes'}
            </Button>
          </div>
        </div>

        {/* RIGHT: QR preview */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="sticky top-28 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <QrCode className="h-4 w-4" />
                Live Preview
              </CardTitle>
              <CardDescription>Your unique QR code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* QR Code */}
              <div
                ref={qrRef}
                className="flex items-center justify-center rounded-2xl bg-white p-6 border shadow-inner overflow-hidden"
              >
                {username ? (
                  <QRCodeSVG
                    value={profileUrl}
                    size={200}
                    level="H"
                    includeMargin={false}
                  />
                ) : (
                  <div className="w-[200px] h-[200px] flex items-center justify-center text-muted-foreground text-xs text-center px-4">
                    Set a username to generate your QR code
                  </div>
                )}
              </div>

              {/* URL */}
              {username && (
                <div className="rounded-lg bg-muted/50 border px-3 py-2.5 text-xs text-muted-foreground break-all font-mono leading-relaxed">
                  {profileUrl}
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleCopyLink}
                  disabled={!username}
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy link'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleDownloadQR}
                  disabled={!username}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="w-full gap-2 mt-2"
                onClick={() => router.push(`/${username}`)}
                disabled={!username}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open profile page
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
