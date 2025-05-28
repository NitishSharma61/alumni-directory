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
    <div className="min-h-screen flex items-center justify-center p-6" style={{background: 'var(--background-secondary)'}}>
      <div className="container-sm">
        <div className="max-w-md w-full mx-auto">
          <div className="animate-fadeIn" style={{background: 'white', borderRadius: 'var(--radius-lg)', padding: '3rem', boxShadow: 'var(--shadow)'}}>
            <div className="text-center" style={{marginBottom: '3rem'}}>
              <h2 className="text-4xl font-bold mb-4" style={{color: 'var(--foreground)', letterSpacing: '-0.02em'}}>
                Welcome Back
              </h2>
              <p className="text-lg" style={{color: 'var(--foreground-secondary)'}}>
                Sign in to Alumni Directory
              </p>
              <p className="mt-6" style={{color: 'var(--foreground-tertiary)', fontSize: '0.9375rem'}}>
                Don't have an account?{' '}
                <Link href="/signup" className="font-medium transition-colors duration-200" style={{color: 'var(--primary)'}}>
                  Create one here
                </Link>
              </p>
            </div>
        
            <form className="space-y-8" onSubmit={handleLogin}>
              {/* Error message display */}
              {error && (
                <div style={{background: 'rgba(255, 59, 48, 0.08)', border: '1px solid rgba(255, 59, 48, 0.2)', borderRadius: 'var(--radius-sm)', padding: '1rem'}}>
                  <p className="text-center font-medium" style={{color: 'var(--error)'}}>{error}</p>
                </div>
              )}
              
              <div className="space-y-6">
                {/* Email input field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-3" style={{color: 'var(--foreground-secondary)'}}>
                    Email Address
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
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-3" style={{color: 'var(--foreground-secondary)'}}>
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
              <div style={{paddingTop: '1rem'}}>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{padding: '1rem'}}
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
    </div>
  )
}