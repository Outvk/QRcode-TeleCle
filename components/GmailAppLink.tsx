'use client'

interface GmailAppLinkProps {
  email: string
  className?: string
  children: React.ReactNode
}

export function GmailAppLink({ email, className, children }: GmailAppLinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
    const isAndroid = /Android/i.test(navigator.userAgent)
    
    if (isMobile) {
      if (isIOS) {
        // Try to open Gmail iOS app
        window.location.href = `googlegmail:///co?to=${encodeURIComponent(email)}`
      } else if (isAndroid) {
        // Try to open Gmail Android app using intent
        window.location.href = `intent://compose?to=${encodeURIComponent(email)}#Intent;package=com.google.android.gm;scheme=mailto;end`
      }
      
      // Fallback to web after a short delay if app didn't open
      setTimeout(() => {
        window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(email)}`, '_blank')
      }, 500)
    } else {
      // Desktop - open web Gmail
      window.open(`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(email)}`, '_blank')
    }
  }
  
  return (
    <a href="#" onClick={handleClick} className={className}>
      {children}
    </a>
  )
}
