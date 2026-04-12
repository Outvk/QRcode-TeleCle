import Link from 'next/link'
import { QrCode } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <QrCode className="h-10 w-10 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-semibold mb-2">Profile not found</h1>
      <p className="text-muted-foreground text-sm mb-6">
        This username doesn't exist yet. Want to claim it?
      </p>
      <Link
        href="/auth"
        className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Create your page
      </Link>
    </div>
  )
}
