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
import { SOCIAL_PLATFORMS, cn } from '@/lib/utils'
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
} from '@/components/ui/dropdown-menu'
// Social platform icons (simple SVG paths)
const ICONS: Record<string, React.ReactNode> = {
  instagram: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
  tiktok: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>,
  facebook: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  twitter: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  youtube: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
  linkedin: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  website: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  whatsapp: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>,
};

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()

  const [profiles, setProfiles] = useState<any[]>([])
  const [currentProfile, setCurrentProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [activePlatforms, setActivePlatforms] = useState<string[]>([])
  
  // Form states (linked to currentProfile)
  const [links, setLinks] = useState<Record<string, string>>({})
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
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
    setAvatarUrl(p.avatar_url || '')
    setBannerUrl(p.banner_url || '')
    setLinks(p.links || {})
    
    // Auto-expand platforms that have values
    const hasValues = Object.keys(p.links || {}).filter(key => !!p.links[key])
    setActivePlatforms(hasValues)
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
        avatar_url: avatarUrl,
        banner_url: bannerUrl,
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
      alert('Error saving: ' + error?.message)
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
      alert('Error deleting: ' + error?.message)
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

  function togglePlatform(key: string) {
    setActivePlatforms(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key) 
        : [...prev, key]
    )
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
              <div className="flex flex-col items-center w-full pb-6 border-b border-dashed">
                <div className="w-full relative flex flex-col items-center mb-20">
                  {/* Banner Preview */}
                  <div className="w-full h-40 rounded-xl bg-primary/5 border border-dashed overflow-hidden transition-all group-hover:border-primary">
                    {bannerUrl ? (
                      <img src={bannerUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                       <span className="text-xs text-muted-foreground">Banner Preview</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Avatar Overlay in Preview */}
                  <div className="absolute top-24 z-10 group">
                    <div className="w-28 h-28 rounded-full bg-muted border-4 border-background flex items-center justify-center overflow-hidden shadow-md transition-all group-hover:scale-105">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <span className="text-xs text-muted-foreground">Live Header Preview</span>
                </div>
                
                <div className="w-full space-y-4">
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
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="avatarUrl">Avatar Image URL</Label>
                      <Input
                        id="avatarUrl"
                        value={avatarUrl}
                        onChange={e => setAvatarUrl(e.target.value)}
                        placeholder="https://example.com/photo.jpg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bannerUrl">Banner Image URL</Label>
                      <Input
                        id="bannerUrl"
                        value={bannerUrl}
                        onChange={e => setBannerUrl(e.target.value)}
                        placeholder="https://example.com/banner.jpg"
                      />
                    </div>
                  </div>
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
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/20">
              <CardTitle className="text-base">Social Links</CardTitle>
              <CardDescription>Select the platforms you use to add your links</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {/* Platform Selector as Tags */}
              <div className="p-4 bg-muted/20 flex flex-wrap gap-2">
                {SOCIAL_PLATFORMS.map(p => {
                  const hasValue = !!links[p.key];
                  const isActive = activePlatforms.includes(p.key);
                  return (
                    <button
                      key={p.key}
                      onClick={() => togglePlatform(p.key)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-full border text-xs transition-all duration-200",
                        isActive 
                          ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                          : hasValue
                            ? "bg-background border-primary/30 text-foreground"
                            : "bg-background border-border text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      <span className={cn(isActive ? "text-primary-foreground" : "")} style={{ color: isActive ? undefined : p.color }}>
                        {ICONS[p.key] || <div className="w-4 h-4 rounded-full bg-current opacity-20" />}
                      </span>
                      <span>{p.label}</span>
                      {hasValue && !isActive && <div className="ml-1 w-1 h-1 rounded-full bg-primary" />}
                    </button>
                  );
                })}
              </div>

              {/* Multi-Active Input Area */}
              <div className="border-t divide-y">
                {activePlatforms.length > 0 ? (
                  activePlatforms.map(platformKey => {
                    const platform = SOCIAL_PLATFORMS.find(p => p.key === platformKey);
                    if (!platform) return null;
                    return (
                      <div key={platformKey} className="p-5 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`link-${platformKey}`} className="flex items-center gap-2 text-xs" style={{ color: platform.color }}>
                            {ICONS[platformKey]}
                            {platform.label} URL
                          </Label>
                          <button 
                            onClick={() => togglePlatform(platformKey)}
                            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                          >
                            Hide
                          </button>
                        </div>
                        <Input
                          id={`link-${platformKey}`}
                          type="url"
                          value={links[platformKey] || ''}
                          onChange={e => setLinks(prev => ({ ...prev, [platformKey]: e.target.value }))}
                          placeholder={platform.placeholder}
                          className="h-11 shadow-sm border-slate-200 dark:border-slate-800"
                        />
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 bg-slate-50/30 dark:bg-transparent">
                    <p className="text-sm text-muted-foreground">No platforms selected. Click a tag above to start adding links.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="pt-4 flex gap-4">
             <Button onClick={handleSave} disabled={saving} className="flex-1 h-12 gap-2 shadow-md">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saving ? 'Syncing…' : saved ? 'Successfully Updated!' : 'Update Profile'}
            </Button>
          </div>
        </div>

        {/* RIGHT: QR preview */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="sticky top-28 shadow-md border-primary/5 overflow-hidden">
            <div className="h-1.5 w-full bg-primary" />
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <QrCode className="h-4 w-4 text-primary" />
                Live Preview
              </CardTitle>
              <CardDescription>Your unique shareable QR code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* QR Code */}
              <div
                ref={qrRef}
                className="flex items-center justify-center rounded-3xl bg-white p-8 border shadow-inner overflow-hidden"
              >
                {username ? (
                  <QRCodeSVG
                    value={profileUrl}
                    size={220}
                    level="H"
                    includeMargin={false}
                  />
                ) : (
                  <div className="w-[220px] h-[220px] flex items-center justify-center text-muted-foreground text-xs text-center px-4 font-medium italic">
                    Set a username to generate your QR code
                  </div>
                )}
              </div>



              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 h-10"
                  onClick={handleCopyLink}
                  disabled={!username}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  Copy link
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 h-10"
                  onClick={handleDownloadQR}
                  disabled={!username}
                >
                  <Download className="h-4 w-4" />
                  QR Image
                </Button>
              </div>

              <Button
                variant="secondary"
                size="sm"
                className="w-full h-11 gap-2 mt-2 border"
                onClick={() => router.push(`/${username}`)}
                disabled={!username}
              >
                <ExternalLink className="h-4 w-4" />
                Go to Public Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
