'use client'

import { useEffect, useState } from 'react'
import { X, Megaphone } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Announcement {
  message: string
  active: boolean
  type: 'info' | 'warning' | 'success'
}

export function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Load announcement from localStorage
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

  // Listen for changes (when admin updates)
  useEffect(() => {
    const handleStorage = () => {
      const stored = localStorage.getItem('system_announcement')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setAnnouncement(parsed)
          setDismissed(false)
        } catch {
          setAnnouncement(null)
        }
      } else {
        setAnnouncement(null)
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
    <div className={`fixed top-0 left-0 right-0 z-[100] border-b px-4 py-3 ${typeStyles[announcement.type || 'info']}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Megaphone className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{announcement.message}</p>
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
