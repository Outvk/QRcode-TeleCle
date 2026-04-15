'use client'

import React, { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Users, 
  Eye, 
  Link2, 
  Shield, 
  LogOut, 
  TrendingUp,
  ArrowRight,
  UserCircle,
  Crown,
  Trash2,
  Edit3,
  Download,
  Megaphone,
  X,
  Save,
  Trophy,
  Settings2
} from 'lucide-react'
import { VisitorChart } from '@/components/VisitorChart'
import { ThemeToggle } from '@/components/ThemeToggle'

interface Profile {
  id: string
  user_id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  links: Record<string, string> | null
  created_at: string
  visit_count?: number
  total_views?: number
}

interface UserData {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  is_admin: boolean
  is_blocked: boolean
  profile_count: number
  daily_profile_limit: number
}

interface SystemStats {
  totalUsers: number
  totalProfiles: number
  totalLinks: number
  totalVisits: number
  totalViews: number
}

export default function SysDashboardPage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalProfiles: 0,
    totalLinks: 0,
    totalVisits: 0,
    totalViews: 0
  })
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [users, setUsers] = useState<UserData[]>([])
  const [blockedUserIds, setBlockedUserIds] = useState<Set<string>>(new Set())
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'profiles' | 'users' | 'top' | 'announcements'>('profiles')
  const [adminEmail, setAdminEmail] = useState('')
  const profilesTableRef = useRef<HTMLDivElement>(null)
  
  // Edit profile modal state
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null)
  const [editForm, setEditForm] = useState({
    username: '',
    display_name: '',
    bio: '',
    links: {} as Record<string, string>
  })
  
  // System announcement state
  const [announcement, setAnnouncement] = useState({
    message: '',
    active: false,
    type: 'info' as 'info' | 'warning' | 'success'
  })
  const [showAnnouncementEditor, setShowAnnouncementEditor] = useState(false)

  // User limit editing state
  const [editingUserLimit, setEditingUserLimit] = useState<string | null>(null)
  const [userLimitValue, setUserLimitValue] = useState<number>(8)

  useEffect(() => {
    checkAdmin()
    loadSystemData()
  }, [])

  // Close chart when clicking outside the profiles table
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profilesTableRef.current && !profilesTableRef.current.contains(event.target as Node)) {
        setSelectedProfileId(null)
      }
    }
    
    if (selectedProfileId) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [selectedProfileId])

  async function checkAdmin() {
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    
    const isAdmin = user?.email === 'admin@telecle.com' || 
                    user?.user_metadata?.role === 'admin'
    
    if (!isAdmin) {
      router.push('/sys')
      return
    }
    
    setAdminEmail(user?.email || '')
  }

  async function loadSystemData() {
    // Load all users from auth schema using RPC (requires admin privileges)
    const { data: usersData, error: usersError } = await supabase
      .rpc('get_all_users')
    
    // Load all profiles (needed for both cases)
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    let allUsers: UserData[] = []
    
    // Load blocked users
    const { data: blockedData } = await supabase
      .from('blocked_users')
      .select('user_id')
    
    const blockedIds = new Set(blockedData?.map(b => b.user_id) || [])
    setBlockedUserIds(blockedIds)

    // Load user limits
    const { data: userLimitsData } = await supabase
      .from('user_limits')
      .select('user_id, daily_profile_limit')

    const userLimitsMap: Record<string, number> = {}
    userLimitsData?.forEach(l => {
      userLimitsMap[l.user_id] = l.daily_profile_limit
    })

    if (usersData && !usersError) {
      // Use RPC data if available
      allUsers = usersData.map((u: any) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        is_admin: u.raw_user_meta_data?.role === 'admin',
        is_blocked: blockedIds.has(u.id),
        profile_count: 0,
        daily_profile_limit: userLimitsMap[u.id] || 8
      }))
    } else {
      // Fallback: extract unique users from profiles
      const uniqueUserIds = [...new Set(profilesData?.map(p => p.user_id) || [])]
      allUsers = uniqueUserIds.map(userId => ({
        id: userId,
        email: `User ${userId.slice(0, 8)}...`, // Show ID since we can't get email
        created_at: profilesData?.find(p => p.user_id === userId)?.created_at || new Date().toISOString(),
        last_sign_in_at: null,
        is_admin: false,
        is_blocked: blockedIds.has(userId),
        profile_count: 0,
        daily_profile_limit: userLimitsMap[userId] || 8
      }))
    }

    // Count profiles per user
    const profileCountMap: Record<string, number> = {}
    profilesData?.forEach(p => {
      profileCountMap[p.user_id] = (profileCountMap[p.user_id] || 0) + 1
    })
    
    // Update user profile counts
    allUsers = allUsers.map(u => ({
      ...u,
      profile_count: profileCountMap[u.id] || 0
    }))

    // Load all visitor data
    const { data: visitorsData } = await supabase
      .from('unique_visitors')
      .select('profile_id, visitor_fingerprint, visit_count')

    // Calculate visitor counts per profile
    const visitorCounts: Record<string, number> = {}
    const viewCounts: Record<string, number> = {}
    
    visitorsData?.forEach(v => {
      visitorCounts[v.profile_id] = (visitorCounts[v.profile_id] || 0) + 1
      viewCounts[v.profile_id] = (viewCounts[v.profile_id] || 0) + (v.visit_count || 0)
    })

    const profilesWithVisits = (profilesData || []).map(profile => ({
      ...profile,
      visit_count: visitorCounts[profile.id] || 0,
      total_views: viewCounts[profile.id] || 0
    }))

    setProfiles(profilesWithVisits)
    setUsers(allUsers)

    // Calculate totals
    const totalUsers = new Set(profilesWithVisits.map(p => p.user_id)).size
    const totalProfiles = profilesWithVisits.length
    const totalLinks = profilesWithVisits.reduce((acc, p) => 
      acc + Object.values(p.links || {}).filter((l): l is string => typeof l === 'string' && l.trim() !== '').length, 0
    )
    const totalVisits = Object.values(visitorCounts).reduce((a, b) => a + b, 0)
    const totalViews = Object.values(viewCounts).reduce((a, b) => a + b, 0)

    setStats({
      totalUsers,
      totalProfiles,
      totalLinks,
      totalVisits,
      totalViews
    })
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/sys')
  }

  async function blockUser(userId: string) {
    if (!confirm('Are you sure you want to block this user? They will not be able to sign in.')) return
    
    const { error } = await supabase
      .from('blocked_users')
      .insert({ user_id: userId, blocked_by: (await supabase.auth.getUser()).data.user?.id })
    
    if (error) {
      alert('Failed to block user: ' + error.message)
      return
    }
    
    setBlockedUserIds(prev => new Set([...prev, userId]))
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_blocked: true } : u))
  }

  async function unblockUser(userId: string) {
    const { error } = await supabase
      .from('blocked_users')
      .delete()
      .eq('user_id', userId)
    
    if (error) {
      alert('Failed to unblock user: ' + error.message)
      return
    }
    
    setBlockedUserIds(prev => {
      const next = new Set(prev)
      next.delete(userId)
      return next
    })
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_blocked: false } : u))
  }

  async function deleteUser(userId: string, email: string) {
    if (!confirm(`WARNING: This will permanently delete ${email} and all their profiles. This action cannot be undone.\n\nAre you sure?`)) return
    
    const { error } = await supabase
      .rpc('delete_user_admin', { target_user_id: userId })
    
    if (error) {
      alert('Failed to delete user: ' + error.message)
      return
    }
    
    setUsers(prev => prev.filter(u => u.id !== userId))
    setProfiles(prev => prev.filter(p => p.user_id !== userId))
    alert('User deleted successfully')
  }

  async function updateUserLimit(userId: string, newLimit: number) {
    if (newLimit < 1 || newLimit > 100) {
      alert('Limit must be between 1 and 100')
      return
    }

    // Use RPC function to update user limit (bypasses RLS, checks admin role)
    const { error } = await supabase
      .rpc('update_user_daily_limit', { 
        target_user_id: userId, 
        new_limit: newLimit 
      })

    if (error) {
      alert('Failed to update user limit: ' + error.message)
      return
    }

    setUsers(prev => prev.map(u => u.id === userId ? { ...u, daily_profile_limit: newLimit } : u))
    setEditingUserLimit(null)
    alert(`Daily profile limit updated to ${newLimit} for this user`)
  }

  function startEditUserLimit(user: UserData) {
    setEditingUserLimit(user.id)
    setUserLimitValue(user.daily_profile_limit)
  }

  function openEditProfile(profile: Profile) {
    setEditingProfile(profile)
    setEditForm({
      username: profile.username,
      display_name: profile.display_name || '',
      bio: profile.bio || '',
      links: { ...(profile.links || {}) }
    })
  }

  async function saveProfileEdit() {
    if (!editingProfile) return
    
    const { error } = await supabase
      .from('profiles')
      .update({
        username: editForm.username,
        display_name: editForm.display_name || null,
        bio: editForm.bio || null,
        links: editForm.links
      })
      .eq('id', editingProfile.id)
    
    if (error) {
      alert('Failed to update profile: ' + error.message)
      return
    }
    
    setProfiles(prev => prev.map(p => 
      p.id === editingProfile.id 
        ? { ...p, ...editForm, display_name: editForm.display_name || null, bio: editForm.bio || null }
        : p
    ))
    setEditingProfile(null)
    alert('Profile updated successfully')
  }

  function exportToCSV() {
    const headers = ['ID', 'Username', 'Display Name', 'User ID', 'Bio', 'Links Count', 'Visitors', 'Views', 'Created At']
    const rows = profiles.map(p => [
      p.id,
      p.username,
      p.display_name || '',
      p.user_id,
      (p.bio || '').replace(/"/g, '""'),
      Object.values(p.links || {}).filter((l): l is string => typeof l === 'string' && l.trim() !== '').length,
      p.visit_count || 0,
      p.total_views || 0,
      p.created_at
    ])
    
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `profiles-export-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold">System Administration</h1>
                <p className="text-xs text-muted-foreground">{adminEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-muted-foreground">Users</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.totalUsers.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-muted-foreground">Profiles</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.totalProfiles.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-muted-foreground">Links</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.totalLinks.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-600" />
                <span className="text-sm text-muted-foreground">Unique Visits</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.totalVisits.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-muted-foreground">Total Views</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stats.totalViews.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tab Switcher & Actions */}
        <div className="flex flex-wrap gap-2 mb-4 items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'profiles' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('profiles')}
              className="gap-2"
            >
              <Shield className="w-4 h-4" />
              Profiles ({profiles.length})
            </Button>
            <Button
              variant={activeTab === 'users' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('users')}
              className="gap-2"
            >
              <UserCircle className="w-4 h-4" />
              Users ({users.length})
            </Button>
            <Button
              variant={activeTab === 'top' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('top')}
              className="gap-2"
            >
              <Trophy className="w-4 h-4" />
              Top Profiles
            </Button>
            <Button
              variant={activeTab === 'announcements' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('announcements')}
              className="gap-2"
            >
              <Megaphone className="w-4 h-4" />
              Announcements
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        {activeTab === 'profiles' ? (
          <div ref={profilesTableRef}>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                All Profiles ({profiles.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[400px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-muted/50">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Profile</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User ID</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Links</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Visitors</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Views</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profiles.map((profile) => (
                        <React.Fragment key={profile.id}>
                          <tr 
                            onClick={() => setSelectedProfileId(selectedProfileId === profile.id ? null : profile.id)}
                            className={`border-t hover:bg-muted/30 transition-colors cursor-pointer ${selectedProfileId === profile.id ? 'bg-primary/10' : ''}`}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                                  {(profile.display_name?.[0] || profile.username[0]).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{profile.display_name || profile.username}</p>
                                  <p className="text-xs text-muted-foreground">@{profile.username}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-xs text-muted-foreground font-mono">
                              {profile.user_id.slice(0, 8)}...
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="text-sm">{Object.values(profile.links || {}).filter((l): l is string => typeof l === 'string' && l.trim() !== '').length}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="text-sm text-green-600">{profile.visit_count?.toLocaleString() || 0}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="text-sm text-blue-600">{profile.total_views?.toLocaleString() || 0}</span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {selectedProfileId === profile.id && (
                                  <span className="text-xs text-muted-foreground mr-2">Click to close</span>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={(e) => { e.stopPropagation(); openEditProfile(profile) }}
                                  title="Edit profile"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={(e) => { e.stopPropagation(); window.open(`/${profile.username}`, '_blank') }}
                                  title="View profile"
                                >
                                  <ArrowRight className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                          {selectedProfileId === profile.id && (
                            <tr className="bg-muted/20">
                              <td colSpan={6} className="py-4 px-4">
                                <div className="max-w-3xl mx-auto">
                                  <VisitorChart profileId={profile.id} />
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        ) : activeTab === 'users' ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                All Users ({users.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[400px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-muted/50">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ID</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Profiles</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Daily Limit</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Joined</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Last Sign In</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr 
                          key={user.id}
                          className={`border-t hover:bg-muted/30 transition-colors ${user.is_blocked ? 'bg-red-50/50 dark:bg-red-950/20' : ''}`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${user.is_blocked ? 'bg-red-100 text-red-700' : 'bg-muted'}`}>
                                {user.email[0].toUpperCase()}
                              </div>
                              <div>
                                <p className={`font-medium text-sm ${user.is_blocked ? 'text-red-600 line-through' : ''}`}>{user.email}</p>
                                {user.is_blocked && <p className="text-xs text-red-500">BLOCKED</p>}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-xs text-muted-foreground font-mono">
                            {user.id.slice(0, 8)}...
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-sm font-medium">{user.profile_count}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {editingUserLimit === user.id ? (
                              <div className="flex items-center justify-center gap-1">
                                <Input
                                  type="number"
                                  min={1}
                                  max={100}
                                  value={userLimitValue}
                                  onChange={(e) => setUserLimitValue(parseInt(e.target.value) || 8)}
                                  className="w-14 h-7 text-xs text-center px-1"
                                  autoFocus
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => updateUserLimit(user.id, userLimitValue)}
                                >
                                  <Save className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => setEditingUserLimit(null)}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ) : (
                              <button
                                onClick={() => startEditUserLimit(user)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-medium transition-colors"
                                title="Click to edit daily profile limit"
                              >
                                <Settings2 className="w-3 h-3" />
                                {user.daily_profile_limit}
                              </button>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {user.is_admin ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                <Crown className="w-3 h-3" />
                                Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                                User
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {user.is_blocked ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                Blocked
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                Active
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {user.is_blocked ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => unblockUser(user.id)}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  Unblock
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => blockUser(user.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  disabled={user.is_admin}
                                >
                                  {user.is_admin ? 'Protected' : 'Block'}
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteUser(user.id, user.email)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                disabled={user.is_admin}
                                title={user.is_admin ? 'Cannot delete admin' : 'Delete user permanently'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : activeTab === 'top' ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Top Profiles by Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[400px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-muted/50">
                      <tr>
                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground w-12">Rank</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Profile</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Visitors</th>
                        <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Views</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...profiles]
                        .sort((a, b) => (b.total_views || 0) - (a.total_views || 0))
                        .slice(0, 20)
                        .map((profile, index) => (
                        <tr key={profile.id} className="border-t hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4 text-center">
                            {index === 0 ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">1</span>
                            ) : index === 1 ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-xs font-bold">2</span>
                            ) : index === 2 ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">3</span>
                            ) : (
                              <span className="text-sm text-muted-foreground">{index + 1}</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                                {(profile.display_name?.[0] || profile.username[0]).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{profile.display_name || profile.username}</p>
                                <p className="text-xs text-muted-foreground">@{profile.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-sm text-green-600 font-medium">{profile.visit_count?.toLocaleString() || 0}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-sm text-blue-600 font-medium">{profile.total_views?.toLocaleString() || 0}</span>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {new Date(profile.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="w-4 h-4" />
                System Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <Label className="mb-2 block">Announcement Message</Label>
                  <Textarea
                    placeholder="Enter message to show all users..."
                    value={announcement.message}
                    onChange={(e) => setAnnouncement(prev => ({ ...prev, message: e.target.value }))}
                    className="mb-4"
                  />
                  <div className="flex items-center gap-4 mb-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={announcement.active}
                        onChange={(e) => setAnnouncement(prev => ({ ...prev, active: e.target.checked }))}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">Active</span>
                    </label>
                  </div>
                  <Button 
                    onClick={() => {
                      localStorage.setItem('system_announcement', JSON.stringify(announcement))
                      alert('Announcement saved! It will appear on all pages.')
                    }}
                    className="gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Announcement
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Preview:</h4>
                  {announcement.active && announcement.message ? (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-800 dark:text-blue-200 text-sm">
                      {announcement.message}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No active announcement</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Profile Modal */}
        {editingProfile && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => setEditingProfile(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-2 block">Username</Label>
                  <Input
                    value={editForm.username}
                    onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Display Name</Label>
                  <Input
                    value={editForm.display_name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder="Display name"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Bio</Label>
                  <Textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Bio text"
                    rows={3}
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Links</Label>
                  <div className="space-y-2">
                    {['twitter', 'instagram', 'github', 'linkedin', 'website', 'youtube', 'tiktok', 'twitch'].map(platform => (
                      <div key={platform} className="flex items-center gap-2">
                        <span className="text-sm w-20 capitalize">{platform}:</span>
                        <Input
                          value={editForm.links[platform] || ''}
                          onChange={(e) => setEditForm(prev => ({
                            ...prev,
                            links: { ...prev.links, [platform]: e.target.value }
                          }))}
                          placeholder={`${platform} URL`}
                          className="flex-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={saveProfileEdit} className="flex-1 gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setEditingProfile(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
