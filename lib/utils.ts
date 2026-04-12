import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const SOCIAL_PLATFORMS = [
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/username', color: '#E1306C' },
  { key: 'tiktok',    label: 'TikTok',    placeholder: 'https://tiktok.com/@username',   color: '#000000' },
  { key: 'facebook',  label: 'Facebook',  placeholder: 'https://facebook.com/username',  color: '#1877F2' },
  { key: 'twitter',   label: 'X (Twitter)',placeholder: 'https://x.com/username',         color: '#000000' },
  { key: 'youtube',   label: 'YouTube',   placeholder: 'https://youtube.com/@username',  color: '#FF0000' },
  { key: 'linkedin',  label: 'LinkedIn',  placeholder: 'https://linkedin.com/in/username',color:'#0A66C2' },
  { key: 'website',   label: 'Website',   placeholder: 'https://yoursite.com',           color: '#6366F1' },
  { key: 'whatsapp',  label: 'WhatsApp',  placeholder: 'https://wa.me/213XXXXXXXXX',     color: '#25D366' },
]
