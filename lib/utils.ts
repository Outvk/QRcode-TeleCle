import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Security validation utilities

/**
 * Validates and sanitizes username
 * Only allows: a-z, 0-9, hyphen, underscore
 * Prevents: path traversal, XSS, special characters
 */
export function validateUsername(username: string): { valid: boolean; error?: string; sanitized: string } {
  const sanitized = username.toLowerCase().replace(/[^a-z0-9_-]/g, '')
  
  if (sanitized.length < 2) {
    return { valid: false, error: 'Username must be at least 2 characters', sanitized }
  }
  
  if (sanitized.length > 32) {
    return { valid: false, error: 'Username must be at most 32 characters', sanitized }
  }
  
  // Check for reserved words that could conflict with routes
  const reservedWords = ['admin', 'sys', 'api', 'auth', 'dashboard', 'profiles', 'login', 'logout', 'signup', 'static', 'public']
  if (reservedWords.includes(sanitized)) {
    return { valid: false, error: 'This username is reserved', sanitized }
  }
  
  return { valid: true, sanitized }
}

/**
 * Validates URL is safe (only http/https protocols)
 * Prevents: javascript:, data:, file:, etc.
 */
export function validateUrl(url: string): { valid: boolean; error?: string } {
  if (!url) return { valid: true }
  
  try {
    const parsed = new URL(url)
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:']
    
    if (!allowedProtocols.includes(parsed.protocol)) {
      return { valid: false, error: 'Only HTTP/HTTPS links are allowed' }
    }
    
    // Additional check for javascript protocol (case insensitive)
    if (url.toLowerCase().startsWith('javascript:')) {
      return { valid: false, error: 'JavaScript URLs are not allowed' }
    }
    
    return { valid: true }
  } catch {
    return { valid: false, error: 'Invalid URL format' }
  }
}

/**
 * Validates image URL is safe
 * Only allows http/https and common image extensions
 */
export function validateImageUrl(url: string): { valid: boolean; error?: string } {
  if (!url) return { valid: true }
  
  const urlValidation = validateUrl(url)
  if (!urlValidation.valid) return urlValidation
  
  // Check for common image extensions or data URLs
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp']
  // Remove query parameters and hash for extension check
  const urlWithoutParams = url.split('?')[0].split('#')[0]
  const hasValidExtension = allowedExtensions.some(ext => urlWithoutParams.toLowerCase().endsWith(ext))
  const isDataUrl = url.startsWith('data:image/')
  // Also allow URLs from known image hosts (Google Images, etc.)
  const isKnownImageHost = /\.(gstatic|googleusercontent|ggpht|ytimg|fbcdn|instagram|cdninstagram)\./.test(url)
  
  if (!hasValidExtension && !isDataUrl && !isKnownImageHost) {
    return { valid: false, error: 'Only image URLs are allowed (jpg, png, gif, webp, svg)' }
  }
  
  return { valid: true }
}

export const SOCIAL_PLATFORMS = [
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/username', color: '#E1306C' },
  { key: 'tiktok',    label: 'TikTok',    placeholder: 'https://tiktok.com/@username',   color: 'var(--brand-contrast)' },
  { key: 'facebook',  label: 'Facebook',  placeholder: 'https://facebook.com/username',  color: '#1877F2' },
  { key: 'twitter',   label: 'X (Twitter)',placeholder: 'https://x.com/username',         color: 'var(--brand-contrast)' },
  { key: 'youtube',   label: 'YouTube',   placeholder: 'https://youtube.com/@username',  color: '#FF0000' },
  { key: 'linkedin',  label: 'LinkedIn',  placeholder: 'https://linkedin.com/in/username',color: '#0A66C2' },
  { key: 'website',   label: 'Website',   placeholder: 'https://yoursite.com',           color: '#6366F1' },
  { key: 'whatsapp',  label: 'WhatsApp',  placeholder: 'https://wa.me/213XXXXXXXXX',     color: '#25D366' },
  { key: 'pinterest', label: 'Pinterest', placeholder: 'https://pinterest.com/username',  color: '#E60023' },
  { key: 'telegram',  label: 'Telegram',  placeholder: 'https://t.me/username',           color: '#0088CC' },
  { key: 'gmail',     label: 'Gmail',     placeholder: 'rive@gmail.com',                  color: '#EA4335' },
  { key: 'snapchat',  label: 'Snapchat',  placeholder: 'https://snapchat.com/add/username',color: '#FFFC00' },
  { key: 'map',       label: 'Map',       placeholder: 'https://maps.google.com/?q=...', color: '#4285F4' },
  { key: 'phone',     label: 'Phone',     placeholder: 'tel:+1234567890',                 color: '#10B981' },
]
