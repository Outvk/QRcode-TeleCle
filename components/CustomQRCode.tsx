'use client'
import { forwardRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'

interface CustomQRCodeProps {
  value: string
  size?: number
  level?: 'L' | 'M' | 'Q' | 'H'
  logoUrl?: string
  logoSize?: number
  logoBorderRadius?: number
  logoHasBg?: boolean
  fgColor?: string
  bgColor?: string
  borderRadius?: number
  className?: string
}

export const CustomQRCode = forwardRef<HTMLDivElement, CustomQRCodeProps>(
  ({ 
    value, 
    size = 200, 
    level = 'H', 
    logoUrl, 
    logoSize = 40, 
    logoBorderRadius = 50,
    logoHasBg = false,
    fgColor = '#000000',
    bgColor = '#FFFFFF',
    borderRadius = 12,
    className = '' 
  }, ref) => {
    return (
      <div 
        ref={ref} 
        className={`relative inline-block ${className}`}
        style={{ backgroundColor: bgColor, borderRadius: `${borderRadius}px` }}
      >
        <QRCodeSVG
          value={value}
          size={size}
          level={level}
          fgColor={fgColor}
          bgColor={bgColor}
          className="block"
          style={{ borderRadius: `${borderRadius}px` }}
        />
        {logoUrl && (
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-1 shadow-md"
            style={{
              width: `${logoSize}px`,
              height: `${logoSize}px`,
              backgroundColor: logoHasBg ? bgColor : 'transparent',
              borderRadius: `${logoBorderRadius}px`,
            }}
          >
            <img
              src={logoUrl}
              alt="Logo"
              style={{ borderRadius: `${logoBorderRadius}px` }}
              className="w-full h-full object-contain"
              onError={(e) => {
                // Hide logo if it fails to load
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        )}
      </div>
    )
  }
)

CustomQRCode.displayName = 'CustomQRCode'
