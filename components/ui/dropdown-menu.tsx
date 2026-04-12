"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { open, setOpen })
        }
        return child
      })}
    </div>
  )
}

const DropdownMenuTrigger = ({ children, open, setOpen, asChild, ...props }: any) => {
  return (
    <div onClick={() => setOpen(!open)} {...props}>
      {children}
    </div>
  )
}

const DropdownMenuContent = ({ children, open, setOpen, className, align = "end", ...props }: any) => {
  if (!open) return null

  return (
    <div
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 mt-2",
        align === "start" ? "left-0" : "right-0",
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { setOpen })
        }
        return child
      })}
    </div>
  )
}

const DropdownMenuItem = ({ className, setOpen, onClick, children, ...props }: any) => {
  return (
    <div
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      onClick={(e) => {
        onClick?.(e)
        setOpen?.(false)
      }}
      {...props}
    >
      {children}
    </div>
  )
}

const DropdownMenuLabel = ({ className, ...props }: any) => (
  <div className={cn("px-2 py-1.5 text-sm font-semibold", className)} {...props} />
)

const DropdownMenuSeparator = ({ className, ...props }: any) => (
  <div className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
)

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
}
