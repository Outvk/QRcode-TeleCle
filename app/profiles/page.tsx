'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { ThemeToggle } from '@/components/ThemeToggle'
import Footer from '@/components/Footer'
import { useAuth } from '@/components/Providers'
import { 
  Users, ArrowRight, ExternalLink, Search, 
  Trash2, Pencil, Loader2, X, Check
} from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { VisitorChart } from '@/components/VisitorChart'

interface Profile {
  id: string
  user_id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  links: Record<string, string> | null
  created_at: string
}

function getActiveLinksCount(links: Record<string, string> | null): number {
  if (!links) return 0
  return Object.values(links).filter(link => link && link.trim() !== '').length
}

export default function ProfilesPage() {
  const supabase = createClient()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    display_name: '',
    username: '',
    bio: ''
  })
  const [saving, setSaving] = useState(false)
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)

  useEffect(() => {
    loadProfiles()
  }, [user])

  function isOwner(profile: Profile): boolean {
    return user?.id === profile.user_id
  }

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProfiles(profiles)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredProfiles(profiles.filter(p => 
        p.username.toLowerCase().includes(query) ||
        (p.display_name?.toLowerCase() || '').includes(query) ||
        (p.bio?.toLowerCase() || '').includes(query)
      ))
    }
  }, [searchQuery, profiles])

  async function loadProfiles() {
    if (!user) {
      setProfiles([])
      setFilteredProfiles([])
      setLoading(false)
      return
    }

    // Fetch profiles with visit counts
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (profilesData) {
      // Fetch visitor data for all profiles
      const { data: visitorsData } = await supabase
        .from('unique_visitors')
        .select('profile_id, visitor_fingerprint, visit_count')

      // Calculate unique visitors and total views per profile
      const visitorCounts: Record<string, number> = {}
      const viewCounts: Record<string, number> = {}
      
      visitorsData?.forEach(v => {
        // Count unique visitors
        visitorCounts[v.profile_id] = (visitorCounts[v.profile_id] || 0) + 1
        // Sum total views
        viewCounts[v.profile_id] = (viewCounts[v.profile_id] || 0) + (v.visit_count || 0)
      })

      // Merge counts into profiles
      const profilesWithVisits = profilesData.map(profile => ({
        ...profile,
        visit_count: visitorCounts[profile.id] || 0,
        total_views: viewCounts[profile.id] || 0
      }))

      setProfiles(profilesWithVisits)
      setFilteredProfiles(profilesWithVisits)
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this profile?')) return
    
    setDeletingId(id)
    console.log('Deleting profile:', id)
    
    const { error, data } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)
      .select()

    console.log('Delete response:', { error, data })

    if (error) {
      console.error('Delete error:', error)
      alert('Failed to delete profile: ' + error.message)
    } else if (!data || data.length === 0) {
      console.warn('No rows were deleted - check RLS policies')
      alert('Profile could not be deleted. You may not have permission.')
    } else {
      console.log('Profile deleted successfully')
      setProfiles(prev => prev.filter(p => p.id !== id))
      // Reload to confirm
      await loadProfiles()
    }
    setDeletingId(null)
  }

  function startEdit(profile: Profile) {
    setEditingId(profile.id)
    setEditForm({
      display_name: profile.display_name || '',
      username: profile.username,
      bio: profile.bio || ''
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm({ display_name: '', username: '', bio: '' })
  }

  async function handleSave(profile: Profile) {
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: editForm.display_name,
        username: editForm.username,
        bio: editForm.bio
      })
      .eq('id', profile.id)

    if (!error) {
      setProfiles(prev => prev.map(p => 
        p.id === profile.id 
          ? { ...p, ...editForm }
          : p
      ))
      setEditingId(null)
    }
    setSaving(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/10 dark:bg-black/10 border-b border-white/20 dark:border-white/10">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <a href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <div className="p-2 rounded-xl bg-white/20 dark:bg-black/20 backdrop-blur-sm border border-white/30 dark:border-white/20">
              <img src="/tèlèclè-8.svg" alt="TeleCle" className="h-8 w-5 dark:invert dark:opacity-90 transition-all duration-200" />
            </div>
            <span className="text-md font-semibold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">TèlèClè</span>
          </a>
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              href="/auth" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <div className="p-2 rounded-xl bg-white/20 dark:bg-black/20 backdrop-blur-sm border border-white/30 dark:border-white/20">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Add padding for fixed header */}
      <div className="h-20"></div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Users className="w-4 h-4" />
            <span>My Profiles</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Your Profiles
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Manage your profile pages and their QR codes. 
            Edit or remove profiles you no longer need.
          </p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-8 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold">{profiles.length}</div>
            <div className="text-sm text-muted-foreground">Total Profiles</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {profiles.reduce((acc: number, p: any) => acc + (p.visit_count || 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Unique Visitors</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {profiles.reduce((acc: number, p: any) => acc + (p.total_views || 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Views</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">
              {profiles.reduce((acc: number, p: Profile) => acc + getActiveLinksCount(p.links), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Links</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search profiles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredProfiles.length > 0 ? (
          <>
          <div 
            className="border rounded-lg overflow-hidden bg-card max-h-[400px] overflow-y-auto custom-scrollbar"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'hsl(var(--muted-foreground) / 0.3) transparent',
            } as React.CSSProperties}
          >
            <style>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 5px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: transparent;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background-color: hsl(var(--muted-foreground) / 0.4);
                border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background-color: hsl(var(--muted-foreground) / 0.6);
              }
            `}</style>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground bg-muted/50 backdrop-blur-sm">Profile</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-muted-foreground hidden sm:table-cell bg-muted/50 backdrop-blur-sm">Bio</th>
                    <th className="text-center py-4 px-6 text-sm font-medium text-muted-foreground bg-muted/50 backdrop-blur-sm">Links</th>
                    <th className="text-center py-4 px-6 text-sm font-medium text-muted-foreground bg-muted/50 backdrop-blur-sm">Visitors</th>
                    <th className="text-center py-4 px-6 text-sm font-medium text-muted-foreground bg-muted/50 backdrop-blur-sm">Views</th>
                    <th className="text-right py-4 px-6 text-sm font-medium text-muted-foreground bg-muted/50 backdrop-blur-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProfiles.map((profile) => {
                    const activeLinksCount = getActiveLinksCount(profile.links)
                    const isEditing = editingId === profile.id
                    
                    return (
                      <tr 
                        key={profile.id}
                        onClick={() => setSelectedProfileId(profile.id)}
                        className={`border-b last:border-b-0 hover:bg-muted/30 transition-colors cursor-pointer ${selectedProfileId === profile.id ? 'bg-primary/10 hover:bg-primary/10' : ''}`}
                      >
                        <td className="py-4 px-6">
                          {isEditing ? (
                            <div className="space-y-2">
                              <Input
                                value={editForm.display_name}
                                onChange={(e) => setEditForm(prev => ({ ...prev, display_name: e.target.value }))}
                                placeholder="Display name"
                                className="h-8 text-sm"
                              />
                              <Input
                                value={editForm.username}
                                onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                                placeholder="Username"
                                className="h-8 text-sm"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold overflow-hidden shrink-0">
                                {profile.avatar_url ? (
                                  <img 
                                    src={profile.avatar_url} 
                                    alt={profile.username} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-muted-foreground">
                                    {(profile.display_name?.[0] || profile.username[0]).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium truncate">
                                  {profile.display_name || profile.username}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  @{profile.username}
                                </p>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6 hidden sm:table-cell">
                          {isEditing ? (
                            <Input
                              value={editForm.bio}
                              onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                              placeholder="Bio"
                              className="h-8 text-sm"
                            />
                          ) : (
                            <p className="text-sm text-muted-foreground line-clamp-1 max-w-xs">
                              {profile.bio || '-'}
                            </p>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {activeLinksCount}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            {(profile as any).visit_count?.toLocaleString() || 0}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            {(profile as any).total_views?.toLocaleString() || 0}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => { e.stopPropagation(); handleSave(profile); }}
                                disabled={saving}
                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => { e.stopPropagation(); cancelEdit(); }}
                                disabled={saving}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => { e.stopPropagation(); startEdit(profile); }}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                                title="Quick Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => { e.stopPropagation(); handleDelete(profile.id); }}
                                disabled={deletingId === profile.id}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                title="Delete"
                              >
                                {deletingId === profile.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                              <Link 
                                href={`/${profile.username}`}
                                onClick={(e) => e.stopPropagation()}
                                className="ml-2 inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                                title="View Profile"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                              <Link href="/dashboard" onClick={(e) => e.stopPropagation()}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-3 text-xs ml-1"
                                >
                                  Edit
                                </Button>
                              </Link>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
          {selectedProfileId && (
            <div className="mt-8 max-w-3xl mx-auto">
              <VisitorChart profileId={selectedProfileId} />
            </div>
          )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Users className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {!user ? 'Sign in to view your profiles' : filteredProfiles.length === 0 ? 'No profiles found' : 'No profiles yet'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {!user 
                ? 'You need to be signed in to manage your profiles.'
                : searchQuery
                  ? 'Try adjusting your search query.'
                  : 'Create your first profile to get started!'
              }
            </p>
            {!user ? (
              <Link 
                href="/auth"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                Sign In
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link 
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                Create New Profile
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
