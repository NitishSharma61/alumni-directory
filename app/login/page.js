'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Script from 'next/script'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  // State management for form inputs and UI feedback
  const [email, setEmail] = useState('')
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

      // If reCAPTCHA passed, attempt to sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      // If successful, redirect to the dashboard
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
      <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--background-secondary)'}}>
        <div className="max-w-lg w-full mx-auto">
          <div className="animate-fadeIn" style={{background: 'var(--card-background)', borderRadius: 'var(--radius-lg)', padding: '3rem'}}>
            <div className="text-center" style={{marginBottom: '2rem'}}>
              <img 
                src="/logo alumni.png" 
                alt="Alumni Directory Logo" 
                style={{
                  height: '100px',
                  width: 'auto',
                  objectFit: 'contain',
                  marginBottom: '1rem',
                  maxHeight: '100px',
                  display: 'block',
                  margin: '0 auto 1rem auto'
                }}
              />
              <h2 className="text-4xl font-bold" style={{color: 'var(--foreground)', letterSpacing: '-0.02em', marginBottom: '0.75rem'}}>
                Hami Navidaya Ho
              </h2>
              <p className="text-lg" style={{color: 'var(--foreground-secondary)'}}>
                JNV Pandoh Alumni Network
              </p>
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
                {/* Email input field */}
                <div className="flex flex-col lg:flex-row lg:items-center" style={{gap: '0.5rem', paddingBottom: '0.5rem'}}>
                  <label htmlFor="email" className="text-sm font-medium lg:w-24 lg:flex-shrink-0" style={{color: 'var(--foreground-secondary)'}}>
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="input w-full"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
            </form>
          </div>
      </div>
    </div>
    </>
  )
}