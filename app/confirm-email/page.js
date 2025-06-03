'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ConfirmEmailPage() {
  const [status, setStatus] = useState('confirming') // 'confirming', 'success', 'error', 'expired'
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Get tokens from URL
        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')
        const type = searchParams.get('type')
        
        if (type === 'signup' && accessToken && refreshToken) {
          // Set the session with the tokens from URL
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          
          if (error) {
            console.error('Email confirmation error:', error)
            setStatus('error')
            setError(error.message)
          } else {
            setStatus('success')
            // Redirect to login after 3 seconds
            setTimeout(() => {
              router.push('/login?confirmed=true')
            }, 3000)
          }
        } else {
          setStatus('error')
          setError('Invalid confirmation link')
        }
      } catch (error) {
        console.error('Error confirming email:', error)
        setStatus('error')
        setError('Failed to confirm email')
      } finally {
        setLoading(false)
      }
    }

    confirmEmail()
  }, [searchParams, router])

  // Show loading while confirming
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--background-secondary)'}}>
        <div className="text-center animate-fadeIn">
          <div className="loading-lg mx-auto mb-4"></div>
          <p className="text-lg" style={{color: 'var(--foreground)'}}>Confirming your email...</p>
          <p className="text-sm mt-2" style={{color: 'var(--foreground-secondary)'}}>Please wait while we verify your email address</p>
        </div>
      </div>
    )
  }

  // Show success message
  if (status === 'success') {
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
              background: 'linear-gradient(135deg, #10b981, #34d399)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold mb-4" style={{color: 'var(--foreground)'}}>
              Email Confirmed!
            </h2>
            <p className="text-lg mb-6" style={{color: 'var(--foreground-secondary)'}}>
              Your email address has been successfully verified. Your account is now active and pending admin approval.
            </p>
            <p className="text-sm mb-8" style={{color: 'var(--foreground-tertiary)'}}>
              You will be redirected to the login page shortly. Once an admin approves your account, you'll receive a welcome email with full access to the alumni directory.
            </p>
            
            <Link href="/login" className="btn-primary w-full">
              Continue to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Show error message
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
            Confirmation Failed
          </h2>
          <p className="text-lg mb-8" style={{color: 'var(--foreground-secondary)'}}>
            {error || 'This email confirmation link is invalid or has expired.'}
          </p>
          
          <div className="space-y-4">
            <Link href="/signup" className="btn-primary w-full">
              Sign Up Again
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