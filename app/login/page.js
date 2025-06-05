'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Script from 'next/script'
import { supabase } from '@/lib/supabase'
import dynamic from 'next/dynamic'

// Dynamically import FloatingMusicOrb to avoid SSR issues
const FloatingMusicOrb = dynamic(() => import('@/components/FloatingMusicOrb'), {
  ssr: false
})

export default function LoginPage() {
  // State management for form inputs and UI feedback
  const [loginIdentifier, setLoginIdentifier] = useState('') // Can be email or mobile
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false)
  const router = useRouter()

  // Handle the login form submission
  const handleLogin = async (e) => {
    e.preventDefault() // Prevent the default form submission behavior
    
    setError(null) // Clear any previous errors
    setLoading(true) // Show loading state
    
    try {
      // Execute reCAPTCHA v3
      if (!window.grecaptcha) {
        throw new Error('reCAPTCHA not loaded')
      }

      const token = await new Promise((resolve, reject) => {
        window.grecaptcha.ready(async () => {
          try {
            const token = await window.grecaptcha.execute(
              process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
              { action: 'login' }
            )
            resolve(token)
          } catch (err) {
            reject(err)
          }
        })
      })

      // Verify reCAPTCHA token
      const recaptchaResponse = await fetch('/api/auth/verify-recaptcha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          action: 'login',
        }),
      })

      const recaptchaData = await recaptchaResponse.json()

      if (!recaptchaData.success) {
        throw new Error(recaptchaData.message || 'reCAPTCHA verification failed')
      }

      // Check if loginIdentifier is email or mobile
      let email = loginIdentifier
      
      // If it looks like a mobile number, find the email from database
      if (/^\+?[0-9\s\-()]+$/.test(loginIdentifier.trim())) {
        // It's a mobile number, fetch the corresponding email
        const { data: profileData, error: profileError } = await supabase
          .from('alumni_profiles')
          .select('email')
          .eq('phone', loginIdentifier.trim())
          .single()
        
        if (profileError || !profileData) {
          throw new Error('Mobile number not found or not registered')
        }
        
        email = profileData.email
      }

      // If reCAPTCHA passed, attempt to sign in with Supabase using email
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      // If successful, redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      // If there's an error, display it to the user
      setError(error.message)
    } finally {
      setLoading(false) // Always turn off loading state
    }
  }

  return (
    <>
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
        onLoad={() => setRecaptchaLoaded(true)}
      />
      <div className="min-h-screen flex items-center justify-center md:p-4" style={{background: 'var(--background-secondary)'}}>
        <div className="max-w-lg w-full mx-auto min-h-screen md:min-h-0 relative">
          <div className="animate-fadeIn h-screen md:h-auto flex flex-col justify-center login-card-mobile" style={{
            background: 'var(--card-background)', 
            borderRadius: 'var(--radius-lg)', 
            padding: '3rem'
          }}>
            <div className="text-center" style={{marginBottom: '2rem'}}>
              <img 
                src="/logo-alumni.png" 
                alt="Alumni Directory Logo" 
                style={{
                  height: '140px',
                  width: 'auto',
                  objectFit: 'contain',
                  marginBottom: '1.5rem',
                  maxHeight: '140px',
                  display: 'block',
                  margin: '0 auto 1.5rem auto'
                }}
              />
              <h2 className="text-4xl font-bold" style={{color: 'var(--foreground)', letterSpacing: '-0.02em', marginBottom: '0.75rem'}}>
                Hami Navodaya Ho
              </h2>
              <div className="flex items-center justify-center gap-3">
                <p className="text-lg" style={{color: 'var(--foreground-secondary)'}}>
                  JNV Pandoh Alumni Network
                </p>
                <FloatingMusicOrb />
              </div>
              <p className="mt-6" style={{color: 'var(--foreground-tertiary)', fontSize: '0.9375rem'}}>
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="font-medium transition-colors duration-200" style={{color: 'var(--primary)'}}>
                  Create one here
                </Link>
              </p>
            </div>
        
            <form className="space-y-6" onSubmit={handleLogin}>
              {/* Error message display */}
              {error && (
                <div style={{background: 'rgba(255, 59, 48, 0.08)', border: '1px solid rgba(255, 59, 48, 0.2)', borderRadius: 'var(--radius-sm)', padding: '1rem'}}>
                  <p className="text-center font-medium" style={{color: 'var(--error)'}}>{error}</p>
                </div>
              )}
              
              <div className="space-y-6">
                {/* Email or Mobile input field */}
                <div className="flex flex-col lg:flex-row lg:items-center" style={{gap: '0.5rem', paddingBottom: '0.5rem'}}>
                  <label htmlFor="loginIdentifier" className="text-sm font-medium lg:w-24 lg:flex-shrink-0" style={{color: 'var(--foreground-secondary)'}}>
                    Email/Mobile
                  </label>
                  <input
                    id="loginIdentifier"
                    name="loginIdentifier"
                    type="text"
                    autoComplete="username"
                    required
                    className="input w-full"
                    placeholder="Enter email or mobile number"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                  />
                </div>
                
                {/* Password input field */}
                <div className="flex flex-col lg:flex-row lg:items-center" style={{gap: '0.5rem', paddingBottom: '0.5rem'}}>
                  <label htmlFor="password" className="text-sm font-medium lg:w-24 lg:flex-shrink-0" style={{color: 'var(--foreground-secondary)'}}>
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="input w-full"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit button */}
              <div className="flex justify-center" style={{paddingTop: '1rem'}}>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{padding: '0.75rem 2rem'}}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="loading mr-3"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>

              {/* Forgot Password Link */}
              <div className="text-center" style={{paddingTop: '1rem'}}>
                <Link 
                  href="/forgot-password" 
                  className="text-sm font-medium transition-colors duration-200" 
                  style={{color: 'var(--primary)'}}
                >
                  Forgot your password?
                </Link>
              </div>
            </form>
          </div>
      </div>
    </div>
    </>
  )
}