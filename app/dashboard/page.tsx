'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/Providers'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ThemeToggle'
import { CustomQRCode } from '@/components/CustomQRCode'
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
  pinterest: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.248 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.001 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg>,
  telegram: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/></svg>,
  gmail: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.818V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h.328l10.036 7.5 10.036-7.5h.328c.904 0 1.636.732 1.636 1.636zm-1.636-1.091h-.005L12 11.818 1.641 4.366h-.005C.732 4.366 0 5.098 0 6.002V5.457c0-.904.732-1.636 1.636-1.636h20.728c.904 0 1.636.732 1.636 1.636v.545c0-.904-.732-1.636-1.636-1.636z"/></svg>,
  snapchat: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" className="w-4 h-4"><path d="M561.1 430.6C557.7 421.4 551.3 416.5 544 412.4C542.6 411.6 541.4 410.9 540.3 410.5C538.1 409.4 535.9 408.3 533.7 407.1C510.9 395 493.1 379.8 480.7 361.7C477.2 356.6 474.1 351.2 471.6 345.6C470.5 342.6 470.6 340.9 471.4 339.3C472.2 338.1 473.1 337.1 474.3 336.3C478.2 333.7 482.3 331.1 485 329.3C489.9 326.1 493.8 323.6 496.2 321.9C505.6 315.4 512.1 308.4 516.2 300.6C519.1 295.2 520.7 289.3 521.1 283.2C521.5 277.1 520.5 271 518.3 265.4C512.1 249.1 496.7 239 478 239C474.1 239 470.1 239.4 466.3 240.2C465.3 240.4 464.2 240.7 463.2 240.9C463.4 229.7 463.1 218 462.1 206.4C458.6 165.6 444.3 144.3 429.4 127.2C419.9 116.5 408.7 107.5 396.2 100.5C373.6 87.6 348 81.1 320.1 81.1C292.2 81.1 266.7 87.6 244.1 100.5C231.6 107.5 220.4 116.6 210.8 127.3C195.9 144.3 181.6 165.7 178.1 206.5C177.1 218.1 176.9 229.9 177 241C176 240.7 175 240.5 173.9 240.3C170 239.5 166.1 239.1 162.2 239.1C143.5 239.1 128.1 249.2 121.9 265.5C119.7 271.2 118.7 277.3 119.1 283.3C119.5 289.3 121.1 295.3 124 300.7C128.1 308.5 134.7 315.4 144 322C146.5 323.7 150.4 326.2 155.2 329.4C157.8 331.1 161.7 333.6 165.5 336.1C166.8 337 167.9 338.1 168.8 339.4C169.6 341 169.6 342.8 168.4 346C165.9 351.5 162.9 356.8 159.5 361.8C147.4 379.5 130.1 394.4 108.1 406.4C96.4 412.6 84.2 416.7 79.1 430.7C75.2 441.2 77.8 453.2 87.6 463.3C91.2 467.1 95.4 470.2 100 472.7C109.6 478 119.8 482 130.3 484.8C132.5 485.4 134.6 486.3 136.4 487.5C140 490.6 139.5 495.4 144.2 502.3C146.6 505.9 149.6 509 153.2 511.4C163.2 518.3 174.5 518.8 186.4 519.2C197.2 519.6 209.4 520.1 223.3 524.7C229.1 526.6 235.1 530.3 242 534.6C258.7 544.9 281.6 558.9 319.8 558.9C358 558.9 381.1 544.8 397.9 534.5C404.8 530.3 410.8 526.6 416.4 524.7C430.3 520.1 442.6 519.6 453.3 519.2C465.2 518.7 476.5 518.3 486.5 511.4C490.7 508.5 494.2 504.7 496.7 500.2C500.1 494.4 500.1 490.3 503.3 487.4C505.1 486.2 507 485.3 509.1 484.8C519.8 482 530.1 477.9 539.9 472.6C544.8 470 549.2 466.5 552.9 462.4L553 462.2C562.2 452.3 564.5 440.7 560.8 430.4zM527.1 448.9C506.4 460.4 492.6 459.1 481.8 466C472.7 471.9 478.1 484.5 471.5 489.1C463.4 494.7 439.3 488.7 408.3 499C382.7 507.5 366.3 531.8 320.3 531.8C274.3 531.8 258.3 507.5 232.2 498.9C201.2 488.6 177.1 494.7 169 489C162.4 484.4 167.8 471.8 158.7 465.9C148 459 134.2 460.2 113.4 448.8C100.2 441.5 107.7 437 112.1 434.9C187.2 398.5 199.2 342.3 199.8 338.2C200.4 333.2 201.2 329.2 195.6 324.1C190.2 319.1 166.4 304.4 159.8 299.8C148.9 292.2 144.1 284.5 147.6 275.2C150.1 268.7 156.1 266.3 162.5 266.3C164.5 266.3 166.5 266.5 168.5 267C180.5 269.6 192.2 275.6 198.9 277.2C199.7 277.4 200.5 277.5 201.4 277.5C205 277.5 206.3 275.7 206 271.6C205.2 258.5 203.4 232.9 205.4 209C208.2 176.1 218.8 159.8 231.4 145.4C237.5 138.5 265.9 108.4 320.3 108.4C374.7 108.4 403 138.2 409 145.1C421.6 159.5 432.2 175.8 435 208.7C437.1 232.6 435.3 258.2 434.4 271.3C434.1 275.6 435.4 277.2 439 277.2C439.8 277.2 440.7 277.1 441.5 276.9C448.2 275.3 459.9 269.3 471.9 266.7C473.9 266.3 475.9 266 477.9 266C484.3 266 490.3 268.5 492.8 274.9C496.3 284.3 491.6 291.9 480.6 299.5C474 304.1 450.2 318.8 444.8 323.8C439.2 328.9 440 332.9 440.6 338C441.1 342.2 453.1 398.4 528.3 434.7C532.7 436.9 540.2 441.4 527 448.8z"/></svg>,
  map: <svg viewBox="0 0 24 24" fill="red" className="w-6 h-4"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>,
  phone: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>,
};

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  // All hooks must be called before any conditional logic
  const [profiles, setProfiles] = useState<any[]>([])
  const [currentProfile, setCurrentProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [activePlatforms, setActivePlatforms] = useState<string[]>([])
  const [autoDetected, setAutoDetected] = useState<string[]>([])
  
  // Form states (linked to currentProfile)
  const [links, setLinks] = useState<Record<string, string>>({})
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [bannerUrl, setBannerUrl] = useState('')
  const [qrLogoUrl, setQrLogoUrl] = useState('')
  const [qrColor, setQrColor] = useState('#000000')
  const [qrBgColor, setQrBgColor] = useState('#FFFFFF')
  const [qrBorderRadius, setQrBorderRadius] = useState(12)
  const [qrLogoSize, setQrLogoSize] = useState(44)
  const [qrLogoBorderRadius, setQrLogoBorderRadius] = useState(50)
  const [qrLogoHasBg, setQrLogoHasBg] = useState(false)
  const [showQrCustomization, setShowQrCustomization] = useState(false)
  const [bio, setBio] = useState('')
  
  const [copied, setCopied] = useState(false)
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false)
  const [pasteText, setPasteText] = useState('')
  const qrRef = useRef<HTMLDivElement>(null)

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  // Load profiles on component mount
  useEffect(() => {
    loadProfiles()
  }, [])

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qrcode-telecle.vercel.app'

  // Show single loader for both auth and profile loading
  if (authLoading || !user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

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

  function selectProfile(p: any) {
    setCurrentProfile(p)
    setDisplayName(p.display_name || '')
    setUsername(p.username || '')
    setBio(p.bio || '')
    setAvatarUrl(p.avatar_url || '')
    setBannerUrl(p.banner_url || '')
    setQrLogoUrl(p.qr_logo_url || '')
    setQrColor(p.qr_color || '#000000')
    setQrBgColor(p.qr_bg_color || '#FFFFFF')
    setQrBorderRadius(p.qr_border_radius || 12)
    setQrLogoSize(p.qr_logo_size || 44)
    setQrLogoBorderRadius(p.qr_logo_border_radius || 50)
    setQrLogoHasBg(p.qr_logo_has_bg !== undefined ? p.qr_logo_has_bg : false)
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
        qr_logo_url: qrLogoUrl,
        qr_color: qrColor,
        qr_bg_color: qrBgColor,
        qr_border_radius: qrBorderRadius,
        qr_logo_size: qrLogoSize,
        qr_logo_border_radius: qrLogoBorderRadius,
        qr_logo_has_bg: qrLogoHasBg,
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
    a.download = `telecle-${username}.svg`
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

  // Function to detect social media URLs and auto-populate fields
  function handleSocialMediaPaste(pastedText: string) {
    const urlPatterns = {
      instagram: /(?:https?:\/\/)?(?:www\.)?instagram\.com\/[^\s]+/g,
      tiktok: /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/[^\s]+/g,
      facebook: /(?:https?:\/\/)?(?:www\.)?facebook\.com\/[^\s]+/g,
      twitter: /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/[^\s]+/g,
      youtube: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/[^\s]+/g,
      linkedin: /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s]+/g,
      whatsapp: /(?:https?:\/\/)?(?:www\.)?wa\.me\/[^\s]+/g,
      pinterest: /(?:https?:\/\/)?(?:www\.)?pinterest\.com\/[^\s]+/g,
      telegram: /(?:https?:\/\/)?(?:www\.)?t\.me\/[^\s]+/g,
      gmail: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      snapchat: /(?:https?:\/\/)?(?:www\.)?snapchat\.com\/add\/[^\s]+/g,
      map: /(?:https?:\/\/)?(?:www\.)?(?:maps\.google\.com|google\.com\/maps|goo\.gl\/maps)\/[^\s]+/g,
      phone: /(?:tel:)?\+?[0-9]{8,15}/g,
    };

    const detectedLinks: Record<string, string> = {};
    const platformsToActivate: string[] = [];

    // Check each platform pattern
    Object.entries(urlPatterns).forEach(([platform, pattern]) => {
      const matches = pastedText.match(pattern);
      if (matches && matches.length > 0) {
        const url = matches[0];
        // Handle phone numbers specially with tel: protocol
        let fullUrl;
        if (platform === 'phone') {
          fullUrl = url.startsWith('tel:') ? url : `tel:${url}`;
        } else {
          // Ensure URL has protocol for other platforms
          fullUrl = url.startsWith('http') ? url : `https://${url}`;
        }
        detectedLinks[platform] = fullUrl;
        platformsToActivate.push(platform);
      }
    });

    // Update links state
    if (Object.keys(detectedLinks).length > 0) {
      setLinks(prev => ({ ...prev, ...detectedLinks }));
      setActivePlatforms(prev => [...new Set([...prev, ...platformsToActivate])]);
      
      // Show success feedback
      const detectedPlatforms = Object.keys(detectedLinks);
      setAutoDetected(detectedPlatforms);
      
      // Clear the auto-detected highlight after 3 seconds
      setTimeout(() => {
        setAutoDetected([]);
      }, 3000);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-background">
      <>
          {/* Navbar */}
          <nav className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-background/95 backdrop-blur z-20">
            <div className="flex items-center gap-6">
              <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <img src="/tèlèclè-8.svg" alt="TeleCle" className="h-10 w-10 dark:invert dark:opacity-90 transition-all duration-200 -m-1.5" />
                <span className="font-bold text-sm tracking-tight">TeleCle</span>
              </a>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-1 border border-dashed">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <div className="space-y-2">
                      <Label htmlFor="qrLogoUrl">QR Code Logo URL (Optional)</Label>
                      <Input
                        id="qrLogoUrl"
                        value={qrLogoUrl}
                        onChange={e => setQrLogoUrl(e.target.value)}
                        placeholder="https://example.com/logo.png"
                      />
                      <p className="text-xs text-muted-foreground">
                        Add a logo to the center of your QR code. Recommended size: 200x200px PNG with transparent background.
                      </p>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base">Social Links</CardTitle>
                  <CardDescription className="hidden sm:block">Select the platforms you use to add your links. You can also paste multiple social media URLs at once to auto-fill them!</CardDescription>
                  <CardDescription className="sm:hidden">Select platforms or paste links to auto-fill</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPasteModalOpen(true)}
                  className="gap-2 text-xs"
                >
                  <Copy className="h-3 w-3" />
                  full paste
                </Button>
              </div>
            </CardHeader>
            <CardContent 
              className="p-0"
              onPaste={(e) => {
                // Skip auto-detection if pasting into an input field
                const target = e.target as HTMLElement;
                if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                  return;
                }
                const pastedText = e.clipboardData.getData('text');
                handleSocialMediaPaste(pastedText);
              }}
            >
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
              <div className="border-t">
                {activePlatforms.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    {activePlatforms.map(platformKey => {
                      const platform = SOCIAL_PLATFORMS.find(p => p.key === platformKey);
                      if (!platform) return null;
                      return (
                        <div key={platformKey} className="p-5 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200 border-b md:border-r even:md:border-r-0">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`link-${platformKey}`} className="flex items-center gap-2 text-xs" style={{ color: platform.color }}>
                              {ICONS[platformKey]}
                              {platform.label} URL
                            </Label>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => setLinks(prev => ({ ...prev, [platformKey]: '' }))}
                                className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                                title="Clear URL"
                              >
                                <Trash2 className="h-3 w-3" />
                                Remove
                              </button>
                              <button 
                                onClick={() => togglePlatform(platformKey)}
                                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                              >
                                Hide
                              </button>
                            </div>
                          </div>
                          <Input
                            id={`link-${platformKey}`}
                            type="url"
                            value={links[platformKey] || ''}
                            onChange={e => setLinks(prev => ({ ...prev, [platformKey]: e.target.value }))}
                            placeholder={platform.placeholder}
                            className={cn(
                              "h-11 shadow-sm border-slate-200 dark:border-slate-800 transition-all duration-300",
                              autoDetected.includes(platformKey) && "border-green-500 bg-green-50 dark:bg-green-950/20 animate-pulse"
                            )}
                          />
                        </div>
                      );
                    })}
                  </div>
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
              {(() => {
                const profileUrl = `${siteUrl}/${username}`;
                return (
                  <>
                    {/* QR Code */}
              <div
                ref={qrRef}
                className="flex items-center justify-center rounded-3xl bg-white p-8 border shadow-inner overflow-hidden"
              >
                {username ? (
                  <CustomQRCode
                    value={profileUrl}
                    size={220}
                    level="H"
                    logoUrl={qrLogoUrl}
                    logoSize={qrLogoSize}
                    logoBorderRadius={qrLogoBorderRadius}
                    logoHasBg={qrLogoHasBg}
                    fgColor={qrColor}
                    bgColor={qrBgColor}
                    borderRadius={qrBorderRadius}
                  />
                ) : (
                  <div className="w-[220px] h-[220px] flex items-center justify-center text-muted-foreground text-xs text-center px-4 font-medium italic">
                    Set a username to generate your QR code
                  </div>
                )}
              </div>

              {/* QR Customization Toggle */}
              <div className="space-y-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQrCustomization(!showQrCustomization)}
                  className="w-full gap-2"
                >
                  <QrCode className="h-4 w-4" />
                  {showQrCustomization ? 'Hide' : 'Show'} QR Customization
                </Button>

                {showQrCustomization && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="qrColor" className="text-xs">QR Code Color</Label>
                        <div className="flex gap-2">
                          <Input
                            id="qrColor"
                            type="color"
                            value={qrColor}
                            onChange={(e) => setQrColor(e.target.value)}
                            className="w-12 h-8 p-1 rounded"
                          />
                          <Input
                            value={qrColor}
                            onChange={(e) => setQrColor(e.target.value)}
                            placeholder="#000000"
                            className="flex-1 text-xs"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="qrBgColor" className="text-xs">Background Color</Label>
                        <div className="flex gap-2">
                          <Input
                            id="qrBgColor"
                            type="color"
                            value={qrBgColor}
                            onChange={(e) => setQrBgColor(e.target.value)}
                            className="w-12 h-8 p-1 rounded"
                          />
                          <Input
                            value={qrBgColor}
                            onChange={(e) => setQrBgColor(e.target.value)}
                            placeholder="#FFFFFF"
                            className="flex-1 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="qrBorderRadius" className="text-xs">QR Border Radius: {qrBorderRadius}px</Label>
                        <Input
                          id="qrBorderRadius"
                          type="range"
                          min="0"
                          max="50"
                          value={qrBorderRadius}
                          onChange={(e) => setQrBorderRadius(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="qrLogoSize" className="text-xs">Logo Size: {qrLogoSize}px</Label>
                        <Input
                          id="qrLogoSize"
                          type="range"
                          min="20"
                          max="80"
                          value={qrLogoSize}
                          onChange={(e) => setQrLogoSize(Number(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="qrLogoBorderRadius" className="text-xs">Logo Border Radius: {qrLogoBorderRadius}%</Label>
                      <Input
                        id="qrLogoBorderRadius"
                        type="range"
                        min="0"
                        max="50"
                        value={qrLogoBorderRadius}
                        onChange={(e) => setQrLogoBorderRadius(Number(e.target.value))}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        0% = Square logo, 50% = Fully rounded logo
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="qrLogoHasBg" className="text-xs">Logo Background</Label>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          {qrLogoHasBg ? 'With BG' : 'No BG'}
                        </span>
                        <button
                          id="qrLogoHasBg"
                          type="button"
                          onClick={() => setQrLogoHasBg(!qrLogoHasBg)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            qrLogoHasBg ? 'bg-primary' : 'bg-muted'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              qrLogoHasBg ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
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
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      </div>
        </>

      {/* Paste Links Modal */}
      {isPasteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Copy className="h-4 w-4" />
                Paste Social Links
              </CardTitle>
              <CardDescription>
                Paste your social media URLs here and we will auto-detect them for you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
                placeholder="Paste Instagram, TikTok, YouTube, and other social links here..."
                className="min-h-[120px] resize-none"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsPasteModalOpen(false)
                    setPasteText('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    if (pasteText.trim()) {
                      handleSocialMediaPaste(pasteText)
                      setIsPasteModalOpen(false)
                      setPasteText('')
                    }
                  }}
                  disabled={!pasteText.trim()}
                >
                  Add Links
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
