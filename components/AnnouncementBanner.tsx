'use client'

import { useEffect, useState } from 'react'
import { X, Megaphone, ExternalLink, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase'

interface Announcement {
  message: string
  active: boolean
  type: 'info' | 'warning' | 'success'
}

// Function to convert URLs and WhatsApp numbers in text to clickable links
function LinkifyText({ text }: { text: string }) {
  // Convert WhatsApp numbers (+1234567890) to wa.me links first
  const processedText = text.replace(/\+(\d[\d\s-]{6,}\d)/g, (match, number) => {
    const cleanNumber = number.replace(/[\s-]/g, '')
    return `https://wa.me/${cleanNumber}`
  })

  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = processedText.split(urlRegex)
  const matches = processedText.match(urlRegex) || []

  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {matches[i] && (
            <a
              href={matches[i]}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 underline hover:no-underline font-semibold"
              onClick={(e) => e.stopPropagation()}
            >
              {matches[i].includes('wa.me') ? (
                <>
                  <Phone className="w-3 h-3" />
                  WhatsApp +{matches[i].replace('https://wa.me/', '')}
                </>
              ) : (
                <>
                  {matches[i].replace(/^https?:\/\//, '').slice(0, 30)}
                  {matches[i].replace(/^https?:\/\//, '').length > 30 ? '...' : ''}
                  <ExternalLink className="w-3 h-3" />
                </>
              )}
            </a>
          )}
        </span>
      ))}
    </>
  )
}

export function AnnouncementBanner() {
  const supabase = createClient()
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Load from database first
    async function loadFromDatabase() {
      const { data } = await supabase
        .from('system_announcements')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      
      if (data) {
        setAnnouncement({
          message: data.message,
          active: data.active,
          type: data.type as 'info' | 'warning' | 'success'
        })
      }
    }
    
    loadFromDatabase()
    
    // Fallback: Load from localStorage for immediate updates from same session
    const stored = localStorage.getItem('system_announcement')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setAnnouncement(parsed)
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, [])

  // Listen for changes (when admin updates in same session)
  useEffect(() => {
    const handleStorage = () => {
      const stored = localStorage.getItem('system_announcement')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setAnnouncement(parsed)
          setDismissed(false)
        } catch {
          // Invalid JSON, ignore
        }
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  if (!announcement?.active || !announcement?.message || dismissed) {
    return null
  }

  const typeStyles = {
    info: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
    warning: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
    success: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
  }

  return (
    <div className={`border-b px-4 py-3 ${typeStyles[announcement.type || 'info']}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Megaphone className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">
            <LinkifyText text={announcement.message} />
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="flex-shrink-0 h-8 w-8 p-0"
          onClick={() => setDismissed(true)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
