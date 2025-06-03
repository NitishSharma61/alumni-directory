'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validSession, setValidSession] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if we have a valid password reset session
    const checkSession = async () => {
      try {
        // Supabase sends tokens as URL fragments (#), not query params (?)
        // We need to parse the URL hash manually
        const hash = window.location.hash.substring(1) // Remove the # symbol
        const params = new URLSearchParams(hash)
        
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        const type = params.get('type')
        const error = params.get('error')
        
        // Check for errors first
        if (error) {
          console.error('URL contains error:', error)
          setError('Invalid or expired reset link')
          setCheckingSession(false)
          return
        }
        
        if (type === 'recovery' && accessToken && refreshToken) {
          // Set the session with the tokens from URL
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          
          if (!sessionError) {
            setValidSession(true)
            // Clear the URL hash for security
            window.history.replaceState({}, document.title, window.location.pathname)
          } else {
            console.error('Session error:', sessionError)
            setError('Invalid or expired reset link')
          }
        } else {
          // Check if there's an existing session
          const { data: { session } } = await supabase.auth.getSession()
          if (session && session.user) {
            setValidSession(true)
          } else {
            setError('Invalid or expired reset link')
          }
        }
      } catch (error) {
        console.error('Error checking session:', error)
        setError('Failed to verify reset link')
      } finally {
        setCheckingSession(false)
      }
    }

    checkSession()
  }, [])

  const validateForm = () => {
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    setError(null)
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        throw error
      }

      setSuccess(true)
      
      // Redirect to login after 5 seconds
      setTimeout(() => {
        router.push('/login?reset=success')
      }, 5000)
      
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking session
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--background-secondary)'}}>
        <div className="text-center animate-fadeIn">
          <div className="loading-lg mx-auto mb-4"></div>
          <p className="text-lg" style={{color: 'var(--foreground)'}}>Verifying reset link...</p>
        </div>
      </div>
    )
  }

  // Show error if invalid session
  if (!validSession) {
    return (
      <div className="min-h-screen flex items-center justify-center md:p-4" style={{background: 'var(--background-secondary)'}}>
        <div className="max-w-lg w-full mx-auto">
          <div className="animate-fadeIn text-center" style={{
            background: 'var(--card-background)', 
            borderRadius: 'var(--radius-lg)', 
            padding: '3rem'
          }}>
            <div className="mx-auto mb-6" style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ef4444, #f87171)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold mb-4" style={{color: 'var(--foreground)'}}>
              Invalid Reset Link
            </h2>
            <p className="text-lg mb-8" style={{color: 'var(--foreground-secondary)'}}>
              {error || 'This password reset link is invalid or has expired. Please request a new one.'}
            </p>
            
            <div className="space-y-4">
              <Link href="/forgot-password" className="btn-primary w-full">
                Request New Reset Link
              </Link>
              <Link href="/login" className="btn-secondary w-full">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show success message
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center md:p-4" style={{background: 'var(--background-secondary)'}}>
        <div className="max-w-lg w-full mx-auto">
          <div className="animate-fadeIn text-center" style={{
            background: 'var(--card-background)', 
            borderRadius: 'var(--radius-lg)', 
            padding: '3rem'
          }}>
            <div className="text-center" style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981, #34d399)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                marginBottom: '1.5rem'
              }}>
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)'
                }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <h2 className="text-3xl font-bold mb-4" style={{color: 'var(--foreground)'}}>
                Password Updated!
              </h2>
              <p className="text-lg mb-8" style={{color: 'var(--foreground-secondary)'}}>
                Your password has been successfully updated. You will be redirected to the login page shortly.
              </p>
              
              <Link href="/login" className="btn-primary">
                Continue to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show password reset form
  return (
    <div className="min-h-screen flex items-center justify-center md:p-4" style={{background: 'var(--background-secondary)'}}>
      <div className="max-w-lg w-full mx-auto min-h-screen md:min-h-0">
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
              Reset Password
            </h2>
            <p className="text-lg" style={{color: 'var(--foreground-secondary)'}}>
              Enter your new password below.
            </p>
          </div>
      
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error message display */}
            {error && (
              <div style={{background: 'rgba(255, 59, 48, 0.08)', border: '1px solid rgba(255, 59, 48, 0.2)', borderRadius: 'var(--radius-sm)', padding: '1rem'}}>
                <p className="text-center font-medium" style={{color: 'var(--error)'}}>{error}</p>
              </div>
            )}
            
            <div className="space-y-6">
              {/* New Password input field */}
              <div className="flex flex-col lg:flex-row lg:items-center" style={{gap: '0.5rem', paddingBottom: '0.5rem'}}>
                <label htmlFor="password" className="text-sm font-medium lg:w-32 lg:flex-shrink-0" style={{color: 'var(--foreground-secondary)'}}>
                  New Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="input w-full"
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              {/* Confirm Password input field */}
              <div className="flex flex-col lg:flex-row lg:items-center" style={{gap: '0.5rem', paddingBottom: '0.5rem'}}>
                <label htmlFor="confirmPassword" className="text-sm font-medium lg:w-32 lg:flex-shrink-0" style={{color: 'var(--foreground-secondary)'}}>
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="input w-full"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                    Updating Password...
                  </div>
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </form>
        </div>
    </div>
  </div>
  )
}