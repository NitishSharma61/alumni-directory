'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
    batchStart: '',
    batchEnd: ''
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false)
  const router = useRouter()

  // This function updates our form data whenever a user types in any field
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
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

    // Validate batch years make sense
    const startYear = parseInt(formData.batchStart)
    const endYear = parseInt(formData.batchEnd)
    
    if (startYear > endYear) {
      setError('Batch start year cannot be after end year')
      return false
    }

    // Check reasonable year ranges
    const currentYear = new Date().getFullYear()
    if (startYear < 1950 || endYear > currentYear) {
      setError('Please enter valid batch years')
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
      })
      
      if (authError) throw authError
      
      // Step 2: Create the alumni profile with additional information
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('alumni_profiles')
          .insert({
            user_id: authData.user.id,
            full_name: formData.fullName,
            email: formData.email,
            batch_start: parseInt(formData.batchStart),
            batch_end: parseInt(formData.batchEnd),
            bio: null,
            is_approved: false,
            created_at: new Date().toISOString(),
          })
        
        if (profileError) throw profileError
        
        // Success! Redirect to login page with success message
        router.push('/login?signup=success')
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
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
            <div className="text-center" style={{marginBottom: '3rem'}}>
              <h2 className="text-4xl font-bold mb-4" style={{color: 'var(--foreground)', letterSpacing: '-0.02em'}}>
                Join Our Community
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

                {/* Batch Years */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{paddingBottom: '1rem'}}>
                  <div className="flex flex-col lg:flex-row lg:items-center" style={{gap: '0.5rem'}}>
                    <label htmlFor="batchStart" className="text-sm font-medium lg:w-24 lg:flex-shrink-0" style={{color: 'var(--foreground-secondary)'}}>
                      Batch Start *
                    </label>
                    <input
                      id="batchStart"
                      name="batchStart"
                      type="number"
                      required
                      min="1950"
                      max={new Date().getFullYear()}
                      className="input w-full"
                      placeholder="2018"
                      value={formData.batchStart}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex flex-col lg:flex-row lg:items-center" style={{gap: '0.5rem'}}>
                    <label htmlFor="batchEnd" className="text-sm font-medium lg:w-24 lg:flex-shrink-0" style={{color: 'var(--foreground-secondary)'}}>
                      Batch End *
                    </label>
                    <input
                      id="batchEnd"
                      name="batchEnd"
                      type="number"
                      required
                      min="1950"
                      max={new Date().getFullYear()}
                      className="input w-full"
                      placeholder="2022"
                      value={formData.batchEnd}
                      onChange={handleChange}
                    />
                  </div>
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