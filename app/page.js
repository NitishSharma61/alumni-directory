'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // User is logged in, redirect to dashboard
          router.push('/dashboard')
        } else {
          // User is not logged in, redirect to login
          router.push('/login')
        }
      } catch (error) {
        console.error('Error checking user:', error)
        // On error, redirect to login
        router.push('/login')
      }
    }

    checkUser()
  }, [router])

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--background-secondary)'}}>
      <div className="text-center animate-fadeIn">
        <div className="loading-lg mx-auto mb-4"></div>
        <p className="text-lg" style={{color: 'var(--foreground)'}}>Loading Alumni Directory...</p>
        <p className="text-sm mt-2" style={{color: 'var(--foreground-secondary)'}}>Please wait while we check your login status</p>
      </div>
    </div>
  )
}
