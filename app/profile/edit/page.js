'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import PhotoUpload from '@/components/PhotoUpload'

export default function EditProfilePage() {
  const router = useRouter()
  
  // State for the form data - starts empty but will be filled with current profile data
  const [formData, setFormData] = useState({
    full_name: '',
    batch_start: '',
    batch_end: '',
    current_job: '',
    city: '',
    state: '',
    photo_url: '',
  })
  
  // State for managing the form submission process
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  // When the page loads, fetch the current user's profile data
  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      // First, check if user is logged in
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Not logged in, redirect to login
        router.push('/login')
        return
      }
      
      setCurrentUser(user)
      
      // Now fetch their profile data
      const { data: profile, error } = await supabase
        .from('alumni_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (error) {
        console.error('Error fetching profile:', error)
        setError('Could not load your profile data')
      } else if (profile) {
        // Fill the form with existing data
        setFormData({
          full_name: profile.full_name || '',
          batch_start: profile.batch_start || '',
          batch_end: profile.batch_end || '',
          current_job: profile.current_job || '',
          city: profile.city || '',
          state: profile.state || '',
          photo_url: profile.photo_url || '',
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear any error when user starts typing
    if (error) setError(null)
    if (success) setSuccess(false)
  }

  // Validate form data before saving
  const validateForm = () => {
    // Check required fields
    if (!formData.full_name.trim()) {
      setError('Name is required')
      return false
    }
    
    // Validate batch years
    const startYear = parseInt(formData.batch_start)
    const endYear = parseInt(formData.batch_end)
    
    if (!startYear || !endYear) {
      setError('Both batch years are required')
      return false
    }
    
    if (startYear > endYear) {
      setError('Batch start year cannot be after end year')
      return false
    }
    
    const currentYear = new Date().getFullYear()
    if (startYear < 1950 || endYear > currentYear) {
      setError('Please enter valid batch years')
      return false
    }
    
    return true
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Clear previous messages
    setError(null)
    setSuccess(false)
    
    // Validate the form
    if (!validateForm()) {
      return
    }
    
    setSaving(true)
    
    try {
      // Update the profile in the database
      const { error: updateError } = await supabase
        .from('alumni_profiles')
        .update({
          full_name: formData.full_name.trim(),
          batch_start: parseInt(formData.batch_start),
          batch_end: parseInt(formData.batch_end),
          current_job: formData.current_job.trim() || null,
          city: formData.city.trim() || null,
          state: formData.state.trim() || null,
          photo_url: formData.photo_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', currentUser.id)
      
      if (updateError) {
        throw updateError
      }
      
      // Show success message
      setSuccess(true)
      
      // After a short delay, redirect to profile page
      setTimeout(() => {
        router.push(`/profile/${currentUser.id}`)
      }, 1500)
      
    } catch (error) {
      console.error('Error updating profile:', error)
      setError('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Show loading state while fetching initial data
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center modern-fade-in">
          <div className="modern-loading mx-auto mb-6"></div>
          <p className="modern-text-primary text-xl font-semibold">Loading your profile...</p>
          <p className="modern-text-muted mt-2">Please wait while we fetch your data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{background: 'var(--background-secondary)'}}>
      {/* Header */}
      <header className="modern-header">
        <div className="modern-container" style={{paddingTop: '2rem', paddingBottom: '2rem'}}>
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold" style={{color: 'var(--foreground)', letterSpacing: '-0.02em'}}>Edit Profile</h1>
            <Link 
              href={currentUser ? `/profile/${currentUser.id}` : '/dashboard'}
              className="btn-secondary"
            >
              Cancel
            </Link>
          </div>
        </div>
      </header>

      {/* Edit Form */}
      <div className="modern-container" style={{paddingTop: '3rem', paddingBottom: '4rem'}}>
        <div className="max-w-3xl mx-auto">
          <div className="modern-card modern-fade-in" style={{padding: '3rem'}}>
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Success Message */}
              {success && (
                <div className="bg-success bg-opacity-10 border border-success border-opacity-50 rounded-lg p-4">
                  <p className="text-success text-center font-medium flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Profile updated successfully! Redirecting...
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-error bg-opacity-10 border border-error border-opacity-50 rounded-lg p-4">
                  <p className="text-error text-center font-medium">{error}</p>
                </div>
              )}

              {/* Basic Information Section */}
              <div>
                <h2 className="text-2xl font-semibold mb-8" style={{color: 'var(--foreground)', letterSpacing: '-0.01em'}}>Basic Information</h2>
                
                {/* Photo Upload Section */}
                <div style={{marginBottom: '2.5rem'}}>
                  <label className="block text-sm font-medium mb-4" style={{color: 'var(--foreground-secondary)'}}>
                    Profile Photo
                  </label>
                  <PhotoUpload
                    currentPhotoUrl={formData.photo_url}
                    userId={currentUser?.id}
                    onPhotoUploaded={(newPhotoUrl) => {
                      setFormData(prev => ({ ...prev, photo_url: newPhotoUrl }))
                    }}
                  />
                </div>
                
                {/* Full Name */}
                <div style={{marginBottom: '2rem'}}>
                  <label htmlFor="full_name" className="block text-sm font-medium mb-3" style={{color: 'var(--foreground-secondary)'}}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    required
                    value={formData.full_name}
                    onChange={handleChange}
                    className="input"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Batch Years */}
                <div className="grid grid-cols-2" style={{gap: '1.5rem'}}>
                  <div>
                    <label htmlFor="batch_start" className="block text-sm font-medium mb-3" style={{color: 'var(--foreground-secondary)'}}>
                      Batch Start Year *
                    </label>
                    <input
                      type="number"
                      id="batch_start"
                      name="batch_start"
                      required
                      min="1950"
                      max={new Date().getFullYear()}
                      value={formData.batch_start}
                      onChange={handleChange}
                      className="input"
                      placeholder="e.g., 2018"
                    />
                  </div>
                  <div>
                    <label htmlFor="batch_end" className="block text-sm font-medium mb-3" style={{color: 'var(--foreground-secondary)'}}>
                      Batch End Year *
                    </label>
                    <input
                      type="number"
                      id="batch_end"
                      name="batch_end"
                      required
                      min="1950"
                      max={new Date().getFullYear()}
                      value={formData.batch_end}
                      onChange={handleChange}
                      className="input"
                      placeholder="e.g., 2022"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information Section */}
              <div style={{paddingTop: '2.5rem', borderTop: '1px solid var(--border-light)'}}>
                <h2 className="text-2xl font-semibold mb-8" style={{color: 'var(--foreground)', letterSpacing: '-0.01em'}}>Professional Information</h2>
                
                {/* Current Job */}
                <div>
                  <label htmlFor="current_job" className="block text-sm font-medium mb-3" style={{color: 'var(--foreground-secondary)'}}>
                    Current Job/Position
                  </label>
                  <input
                    type="text"
                    id="current_job"
                    name="current_job"
                    value={formData.current_job}
                    onChange={handleChange}
                    className="input"
                    placeholder="e.g., Software Engineer at TechCorp"
                  />
                </div>
              </div>

              {/* Location Information Section */}
              <div style={{paddingTop: '2.5rem', borderTop: '1px solid var(--border-light)'}}>
                <h2 className="text-2xl font-semibold mb-8" style={{color: 'var(--foreground)', letterSpacing: '-0.01em'}}>Location</h2>
                
                <div className="grid grid-cols-2" style={{gap: '1.5rem'}}>
                  {/* City */}
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium mb-3" style={{color: 'var(--foreground-secondary)'}}>
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="input"
                      placeholder="e.g., Mumbai"
                    />
                  </div>
                  
                  {/* State */}
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium mb-3" style={{color: 'var(--foreground-secondary)'}}>
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="input"
                      placeholder="e.g., Maharashtra"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex" style={{paddingTop: '2.5rem', gap: '1rem', borderTop: '1px solid var(--border-light)'}}>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <div className="flex items-center justify-center">
                      <div className="loading mr-3"></div>
                      Saving...
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
                <Link
                  href={currentUser ? `/profile/${currentUser.id}` : '/dashboard'}
                  className="flex-1 btn-secondary text-center"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>

          {/* Help text */}
          <p className="text-center text-sm" style={{marginTop: '2rem', color: 'var(--foreground-tertiary)'}}>
            Fields marked with * are required. Your email cannot be changed here for security reasons.
          </p>
        </div>
      </div>
    </div>
  )
}