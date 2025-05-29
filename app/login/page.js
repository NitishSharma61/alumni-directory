'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  // State management for form inputs and UI feedback
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Handle the login form submission
  const handleLogin = async (e) => {
    e.preventDefault() // Prevent the default form submission behavior
    
    setError(null) // Clear any previous errors
    setLoading(true) // Show loading state
    
    try {
      // Attempt to sign in with Supabase
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
    <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--background-secondary)'}}>
      <div className="max-w-md w-full mx-auto px-6">
          <div className="animate-fadeIn" style={{background: 'var(--card-background)', borderRadius: 'var(--radius-lg)', padding: '3rem'}}>
            <div className="text-center" style={{marginBottom: '3rem'}}>
              <img 
                src="/logo alumni.png" 
                alt="Alumni Directory Logo" 
                style={{height: '120px', width: 'auto', margin: '0 auto 2rem auto', display: 'block', maxWidth: '100%', objectFit: 'contain'}}
              />
              <h2 className="text-4xl font-bold mb-4" style={{color: 'var(--foreground)', letterSpacing: '-0.02em'}}>
                Welcome Back
              </h2>
              <p className="text-lg" style={{color: 'var(--foreground-secondary)'}}>
                Reconnect. Network. Thrive.
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
                <div className="flex items-center gap-4" style={{paddingBottom: '0.5rem'}}>
                  <label htmlFor="email" className="text-sm font-medium" style={{color: 'var(--foreground-secondary)', minWidth: '120px'}}>
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="input flex-1"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                
                {/* Password input field */}
                <div className="flex items-center gap-4" style={{paddingBottom: '0.5rem'}}>
                  <label htmlFor="password" className="text-sm font-medium" style={{color: 'var(--foreground-secondary)', minWidth: '120px'}}>
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="input flex-1"
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
  )
}