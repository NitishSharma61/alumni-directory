'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { isAdminEmail } from '@/lib/constants'

export default function ConfirmEmailPage() {
  const [status, setStatus] = useState('confirming') // 'confirming', 'success', 'error', 'expired'
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Check for error in URL (expired/invalid links)
        const errorCode = searchParams.get('error_code')
        const errorDescription = searchParams.get('error_description')

        if (errorCode) {
          console.error('Magic link error:', errorCode, errorDescription)
          setStatus('error')
          setError(errorDescription || 'Magic link is invalid or has expired')
          setLoading(false)
          return
        }

        // Get confirmation parameters from URL
        const tokenHash = searchParams.get('token_hash')
        const token = searchParams.get('token')
        const code = searchParams.get('code')
        const type = searchParams.get('type')
        const isSignup = searchParams.get('signup') === 'true'

        console.log('URL params:', { tokenHash, token, code, type, isSignup })

        // Declare variables for auth result
        let data = null
        let error = null

        // For PKCE code flow, check if user is already authenticated
        // (Supabase auto-handles PKCE on page load)
        if (code) {
          console.log('Detected PKCE code, checking session...')
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

          if (sessionData?.session?.user) {
            console.log('User already authenticated via PKCE')
            data = { user: sessionData.session.user, session: sessionData.session }
            error = null
          } else if (sessionError) {
            console.error('Session error:', sessionError)
            error = sessionError
          } else {
            console.error('No session found after PKCE code')
            error = { message: 'Failed to authenticate. Please try signing up again.' }
          }
        }
        // Handle token_hash or token flow (magic link OTP verification)
        else if ((tokenHash || token) && type) {
          console.log('Using OTP verification flow')
          const result = await supabase.auth.verifyOtp({
            token_hash: tokenHash || token,
            type: type
          })
          data = result.data
          error = result.error
        }

        if (error) {
          console.error('Verification error:', error)
          setStatus('error')
          setError(error.message)
          setLoading(false)
          return
        }

        if (data && data.user) {
          console.log('User authenticated:', data.user.id)
          console.log('User email:', data.user.email)

          const userEmail = data.user.email.toLowerCase()

          // Check if user already exists in alumni_profiles
          const { data: profile } = await supabase
            .from('alumni_profiles')
            .select('id, is_approved')
            .eq('user_id', data.user.id)
            .single()

          if (profile) {
            console.log('User has alumni profile:', profile)
            // User exists in alumni_profiles, redirect to dashboard
            setStatus('success')
            setTimeout(() => {
              router.push('/dashboard')
            }, 2000)
            return
          }

          // Check if user already exists in pending_approval
          const { data: pendingProfile } = await supabase
            .from('pending_approval')
            .select('id')
            .eq('user_id', data.user.id)
            .single()

          if (pendingProfile) {
            console.log('User already in pending_approval')
            // User already pending, redirect to waiting page
            setStatus('success')
            setTimeout(() => {
              router.push('/waiting')
            }, 1000)
            return
          }

          // New signup - get data from localStorage
          if (isSignup) {
            console.log('Creating new signup record...')
            const pendingData = localStorage.getItem('pendingSignupData')

            if (pendingData) {
              const profileData = JSON.parse(pendingData)
              localStorage.removeItem('pendingSignupData')

              console.log('Profile data:', profileData)

              // Check if user is admin
              const isAdmin = isAdminEmail(userEmail)

              if (isAdmin) {
                // Admin: insert directly into alumni_profiles
                console.log('Admin detected, auto-approving...')
                const { error: insertError } = await supabase
                  .from('alumni_profiles')
                  .insert({
                    user_id: data.user.id,
                    full_name: profileData.fullName,
                    email: userEmail,
                    phone: profileData.phone,
                    roll_no: profileData.rollNo,
                    batch_start: profileData.batchStart,
                    batch_end: profileData.batchEnd,
                    bio: null,
                    is_approved: true,
                    approved_at: new Date().toISOString(),
                    approved_by: 'auto-approved-admin',
                    created_at: new Date().toISOString(),
                  })

                if (insertError) {
                  console.error('Failed to create admin profile:', insertError)
                  throw insertError
                }

                // Redirect to dashboard
                setStatus('success')
                setTimeout(() => {
                  router.push('/dashboard')
                }, 2000)
              } else {
                // Regular user: insert into pending_approval
                console.log('Regular user, adding to pending_approval...')
                const { error: insertError } = await supabase
                  .from('pending_approval')
                  .insert({
                    user_id: data.user.id,
                    full_name: profileData.fullName,
                    email: userEmail,
                    phone: profileData.phone,
                    roll_no: profileData.rollNo,
                    batch_start: profileData.batchStart,
                    batch_end: profileData.batchEnd,
                    bio: null,
                    photo_url: null,
                    created_at: new Date().toISOString(),
                  })

                if (insertError) {
                  console.error('Failed to create pending profile:', insertError)
                  throw insertError
                }

                // Redirect to waiting page
                setStatus('success')
                setTimeout(() => {
                  router.push('/waiting')
                }, 1000)
              }
            } else {
              console.error('No signup data in localStorage')
              setStatus('error')
              setError('Signup data not found. Please sign up again.')
            }
          } else {
            // Not a signup flow, just logged in
            setStatus('success')
            setTimeout(() => {
              router.push('/dashboard')
            }, 2000)
          }
        } else {
          console.error('No user data received')
          setStatus('error')
          setError('Authentication failed - no user data')
        }
      } catch (error) {
        console.error('Error processing magic link:', error)
        setStatus('error')
        setError('Failed to process magic link')
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
          <p className="text-lg" style={{color: 'var(--foreground)'}}>Logging you in...</p>
          <p className="text-sm mt-2" style={{color: 'var(--foreground-secondary)'}}>Please wait while we process your magic link</p>
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
              Successfully Logged In!
            </h2>
            <p className="text-lg mb-6" style={{color: 'var(--foreground-secondary)'}}>
              You&apos;ve been authenticated successfully. Redirecting you to the dashboard...
            </p>
            <p className="text-sm mb-8" style={{color: 'var(--foreground-tertiary)'}}>
              If your account is pending approval, you&apos;ll see a notification banner. Once an admin approves your account, you&apos;ll receive a welcome email with full access to the alumni directory.
            </p>

            <Link href="/dashboard" className="btn-primary w-full">
              Go to Dashboard
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
            Magic Link Expired
          </h2>
          <p className="text-lg mb-8" style={{color: 'var(--foreground-secondary)'}}>
            {error || 'This magic link is invalid or has expired. Magic links are valid for 1 hour.'}
          </p>

          <div className="space-y-4">
            <Link href="/login" className="btn-primary w-full">
              Request New Magic Link
            </Link>
            <Link href="/signup" className="btn-secondary w-full">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}