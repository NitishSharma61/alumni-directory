'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'

// Create a global event emitter for navigation events
const navigationEvents = {
  listeners: [],
  emit(loading) {
    this.listeners.forEach(listener => listener(loading))
  },
  subscribe(listener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }
}

// Override router push to emit loading events
if (typeof window !== 'undefined') {
  const originalPush = window.history.pushState
  window.history.pushState = function(...args) {
    navigationEvents.emit(true)
    originalPush.apply(window.history, args)
  }
}

export function NavigationLoader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Subscribe to navigation events
    const unsubscribe = navigationEvents.subscribe(setIsLoading)
    return unsubscribe
  }, [])

  useEffect(() => {
    // When route changes, hide loader
    setIsLoading(false)
  }, [pathname, searchParams])

  if (!isLoading) return null

  return (
    <div className="navigation-loader">
      <div className="spinner-container">
        <div className="modern-spinner"></div>
      </div>
    </div>
  )
}

// Custom Link component that shows loader on click
export function LoadingLink({ children, href, ...props }) {
  const router = useRouter()
  
  const handleClick = (e) => {
    e.preventDefault()
    navigationEvents.emit(true)
    router.push(href)
  }

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  )
}