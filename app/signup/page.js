'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Script from 'next/script'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  // Form state management - we're tracking all the information new alumni will provide
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    batchRange: '' // Changed to single batch range field
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check if we should show confirmation message
  useEffect(() => {
    if (searchParams.get('confirmation') === 'sent') {
      setShowConfirmation(true)
    }
  }, [searchParams])

  // This function updates our form data whenever a user types in any field
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // Generate batch range options
  const generateBatchRanges = () => {
    const ranges = []
    const currentYear = new Date().getFullYear()
    
    // Generate ranges from current year going backwards
    for (let startYear = currentYear - 5; startYear >= 1980; startYear -= 6) {
      const endYear = startYear + 5
      ranges.push({
        value: `${startYear}-${endYear}`,
        label: `${startYear} - ${endYear}`,
        startYear,
        endYear
      })
    }
    
    return ranges
  }

  // This function checks if all the data is valid before we send it to Supabase
  const validateForm = () => {
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }

    // Check password length (Supabase requires at least 6 characters)
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }

    // Validate batch range is selected
    if (!formData.batchRange) {
      setError('Please select your batch')
      return false
    }

    return true
  }

  // This is the main function that creates a new alumni account
  const handleSignup = async (e) => {
    e.preventDefault()
    
    // Clear any previous errors
    setError(null)
    
    // Validate form before proceeding
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    
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
              { action: 'signup' }
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
          action: 'signup',
        }),
      })

      const recaptchaData = await recaptchaResponse.json()

      if (!recaptchaData.success) {
        throw new Error(recaptchaData.message || 'reCAPTCHA verification failed')
      }

      // If reCAPTCHA passed, create the authentication account in Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/confirm-email`,
          data: {
            full_name: formData.fullName,
          }
        }
      })
      
      if (authError) throw authError
      
      // Step 2: Create the alumni profile with additional information
      // Note: This will only work if email confirmation is disabled in Supabase
      // If email confirmation is enabled, this profile creation will happen after email confirmation
      if (authData.user && !authData.user.email_confirmed_at) {
        // Email confirmation is required - show success message without creating profile yet
        router.push('/signup?confirmation=sent')
      } else if (authData.user) {
        // Email confirmation is disabled - create profile immediately
        // Parse batch range to get start and end years
        const [batchStart, batchEnd] = formData.batchRange.split('-').map(year => parseInt(year.trim()))
        
        const { error: profileError } = await supabase
          .from('alumni_profiles')
          .insert({
            user_id: authData.user.id,
            full_name: formData.fullName,
            email: formData.email,
            phone: formData.phone.trim() || null,
            batch_start: batchStart,
            batch_end: batchEnd,
            bio: null,
            is_approved: false,
            created_at: new Date().toISOString(),
          })
        
        if (profileError) throw profileError
        
        // Success! Redirect to login page
        router.push('/login?signup=success')
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Show email confirmation success message
  if (showConfirmation) {
    return (
      <>
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
          onLoad={() => setRecaptchaLoaded(true)}
        />
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
                background: 'linear-gradient(135deg, #0066ff, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              
              <h2 className="text-3xl font-bold mb-4" style={{color: 'var(--foreground)'}}>
                Check Your Email
              </h2>
              <p className="text-lg mb-6" style={{color: 'var(--foreground-secondary)'}}>
                We&apos;ve sent a confirmation email to <strong>{formData.email}</strong>
              </p>
              <p className="text-sm mb-8" style={{color: 'var(--foreground-tertiary)'}}>
                Please check your email and click the confirmation link to activate your account. The link will expire in 24 hours.
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="btn-secondary w-full"
                >
                  Back to Sign Up
                </button>
                <Link href="/login" className="btn-primary w-full">
                  Go to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    )
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
            <div className="text-center" style={{marginBottom: '3rem'}}>
              <h2 className="text-4xl font-bold mb-4" style={{color: 'var(--foreground)', letterSpacing: '-0.02em'}}>
                Create Account
              </h2>
              <p className="text-lg" style={{color: 'var(--foreground-secondary)'}}>
                JNV Pandoh Alumni Network
              </p>
              <p className="mt-6" style={{color: 'var(--foreground-tertiary)', fontSize: '0.9375rem'}}>
                Already have an account?{' '}
                <Link href="/login" className="font-medium transition-colors duration-200" style={{color: 'var(--primary)'}}>
                  Sign in here
                </Link>
              </p>
            </div>
        
            <form className="space-y-6" onSubmit={handleSignup}>
              {/* Error message display */}
              {error && (
                <div style={{background: 'rgba(255, 59, 48, 0.08)', border: '1px solid rgba(255, 59, 48, 0.2)', borderRadius: 'var(--radius-sm)', padding: '1rem'}}>
                  <p className="text-center font-medium" style={{color: 'var(--error)'}}>{error}</p>
                </div>
              )}
              
              <div className="space-y-8">
                {/* Full Name Input */}
                <div className="flex flex-col lg:flex-row lg:items-center" style={{gap: '0.5rem', paddingBottom: '1rem'}}>
                  <label htmlFor="fullName" className="text-sm font-medium lg:w-36 lg:flex-shrink-0" style={{color: 'var(--foreground-secondary)'}}>
                    Full Name *
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    className="input w-full"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>

                {/* Email Input */}
                <div className="flex flex-col lg:flex-row lg:items-center" style={{gap: '0.5rem', paddingBottom: '1rem'}}>
                  <label htmlFor="email" className="text-sm font-medium lg:w-36 lg:flex-shrink-0" style={{color: 'var(--foreground-secondary)'}}>
                    Email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="input w-full"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                {/* Phone Input */}
                <div className="flex flex-col lg:flex-row lg:items-center" style={{gap: '0.5rem', paddingBottom: '1rem'}}>
                  <label htmlFor="phone" className="text-sm font-medium lg:w-36 lg:flex-shrink-0" style={{color: 'var(--foreground-secondary)'}}>
                    Mobile Number *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    className="input w-full"
                    placeholder="e.g., +91 9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                {/* Batch Range Dropdown */}
                <div className="flex flex-col lg:flex-row lg:items-center" style={{gap: '0.5rem', paddingBottom: '1rem'}}>
                  <label htmlFor="batchRange" className="text-sm font-medium lg:w-36 lg:flex-shrink-0" style={{color: 'var(--foreground-secondary)'}}>
                    Batch *
                  </label>
                  <select
                    id="batchRange"
                    name="batchRange"
                    required
                    className="input w-full"
                    style={{padding: '0.625rem 1rem'}}
                    value={formData.batchRange}
                    onChange={handleChange}
                  >
                    <option value="">Select your batch</option>
                    {generateBatchRanges().map((range) => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Password Input */}
                <div className="flex flex-col lg:flex-row lg:items-center" style={{gap: '0.5rem', paddingBottom: '1rem'}}>
                  <label htmlFor="password" className="text-sm font-medium lg:w-36 lg:flex-shrink-0" style={{color: 'var(--foreground-secondary)'}}>
                    Password *
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="input w-full"
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                {/* Confirm Password Input */}
                <div className="flex flex-col lg:flex-row lg:items-center" style={{gap: '0.5rem', paddingBottom: '1rem'}}>
                  <label htmlFor="confirmPassword" className="text-sm font-medium lg:w-36 lg:flex-shrink-0" style={{color: 'var(--foreground-secondary)'}}>
                    Confirm Password *
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="input w-full"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Submit Button */}
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
                      Creating account...
                    </div>
                  ) : (
                    'Create Account'
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