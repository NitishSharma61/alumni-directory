'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import PhotoUpload from '@/components/PhotoUpload'
import Header from '@/components/Header'

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
    phone: '',
    photo_url: '',
    bio: '',
    linkedin_url: '',
    facebook_url: '',
    instagram_url: '',
  })
  
  // State for managing the form submission process
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [zoomedPhoto, setZoomedPhoto] = useState(null)

  // When the page loads, fetch the current user's profile data
  useEffect(() => {
    fetchUserProfile()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
          phone: profile.phone || '',
          photo_url: profile.photo_url || '',
          bio: profile.bio || '',
          linkedin_url: profile.linkedin_url || '',
          facebook_url: profile.facebook_url || '',
          instagram_url: profile.instagram_url || '',
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
          phone: formData.phone.trim() || null,
          photo_url: formData.photo_url || null,
          bio: formData.bio.trim() || null,
          linkedin_url: formData.linkedin_url.trim() || null,
          facebook_url: formData.facebook_url.trim() || null,
          instagram_url: formData.instagram_url.trim() || null,
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
      <Header />

      {/* Back Navigation */}
      <div className="modern-container" style={{paddingTop: '1rem'}}>
        <Link 
          href={currentUser ? `/profile/${currentUser.id}` : '/dashboard'}
          className="btn-secondary inline-flex items-center"
          style={{
            padding: '0.5rem 1.25rem',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Profile
        </Link>
      </div>

      {/* Edit Form */}
      <div className="modern-container" style={{paddingTop: '1rem', paddingBottom: '1.5rem'}}>
        <div style={{maxWidth: '800px', margin: '0 auto'}}>
          <div className="animate-fadeIn" style={{
            background: 'white', 
            borderRadius: 'var(--radius-lg)', 
            overflow: 'hidden', 
            border: '1px solid var(--border-light)'
          }}>
            {/* Page Header */}
            <div className="text-center" style={{
              background: 'white', 
              borderBottom: '1px solid var(--border-light)',
              padding: '3rem'
            }}>
              <h1 className="text-2xl font-bold mb-2" style={{
                color: 'var(--foreground)', 
                letterSpacing: '-0.02em',
                lineHeight: '1.2'
              }}>
                Edit Profile
              </h1>
              <p style={{
                color: 'var(--foreground-secondary)',
                lineHeight: '1.5'
              }}>
                Update your information to help fellow alumni connect with you
              </p>
            </div>

            {/* Form Content */}
            <div style={{padding: '3rem'}}>
            <form onSubmit={handleSubmit} className="space-y-8">
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
                <h2 className="text-lg font-semibold uppercase tracking-wider mb-4" style={{color: 'var(--foreground-tertiary)'}}>Basic Information</h2>
                
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
                    onPhotoClick={(photoUrl) => {
                      setZoomedPhoto({
                        url: photoUrl,
                        name: formData.full_name || 'Profile Photo'
                      });
                    }}
                  />
                </div>
                
                {/* Full Name */}
                <div className="flex flex-col lg:flex-row lg:items-center" style={{marginBottom: '1.5rem', gap: '0.5rem'}}>
                  <label htmlFor="full_name" className="text-sm font-medium lg:w-24 lg:flex-shrink-0" style={{color: 'var(--foreground-secondary)'}}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    required
                    value={formData.full_name}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="Enter your full name"
                    style={{padding: '0.625rem 1rem'}}
                  />
                </div>

                {/* Batch Years */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{marginBottom: '1.5rem'}}>
                  <div className="flex flex-col lg:flex-row lg:items-center" style={{gap: '0.5rem'}}>
                    <label htmlFor="batch_start" className="text-sm font-medium lg:w-24 lg:flex-shrink-0" style={{color: 'var(--foreground-secondary)'}}>
                      Start Year *
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
                      className="input w-full"
                      placeholder="e.g., 2018"
                      style={{padding: '0.625rem 1rem'}}
                    />
                  </div>
                  <div className="flex flex-col lg:flex-row lg:items-center" style={{gap: '0.5rem'}}>
                    <label htmlFor="batch_end" className="text-sm font-medium lg:w-24 lg:flex-shrink-0" style={{color: 'var(--foreground-secondary)'}}>
                      End Year *
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
                      className="input w-full"
                      placeholder="e.g., 2022"
                      style={{padding: '0.625rem 1rem'}}
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information Section */}
              <div style={{paddingTop: '2rem', borderTop: '1px solid var(--border-light)'}}>
                <h2 className="text-lg font-semibold uppercase tracking-wider mb-6" style={{color: 'var(--foreground-tertiary)'}}>Professional Information</h2>
                
                {/* Current Job */}
                <div className="flex flex-col lg:flex-row lg:items-center" style={{marginBottom: '1.5rem', gap: '0.5rem'}}>
                  <label htmlFor="current_job" className="text-sm font-medium lg:w-40 lg:flex-shrink-0" style={{color: 'var(--foreground-secondary)'}}>
                    Job/Position
                  </label>
                  <input
                    type="text"
                    id="current_job"
                    name="current_job"
                    value={formData.current_job}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="e.g., Software Engineer"
                    style={{padding: '0.625rem 1rem'}}
                  />
                </div>

                {/* Phone Number */}
                <div className="flex flex-col lg:flex-row lg:items-start" style={{gap: '0.5rem'}}>
                  <label htmlFor="phone" className="text-sm font-medium lg:w-40 lg:flex-shrink-0" style={{color: 'var(--foreground-secondary)'}}>
                    Phone Number
                  </label>
                  <div className="w-full">
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input w-full"
                      style={{padding: '0.625rem 1rem'}}
                      placeholder="e.g., +91 9876543210"
                    />
                    <p className="text-xs mt-2" style={{color: 'var(--foreground-tertiary)'}}>
                      Your phone number will be visible to other alumni for networking purposes
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Media Section */}
              <div style={{paddingTop: '2rem', borderTop: '1px solid var(--border-light)'}}>
                <h2 className="text-lg font-semibold uppercase tracking-wider mb-6" style={{color: 'var(--foreground-tertiary)'}}>Social Media</h2>
                
                {/* LinkedIn */}
                <div className="flex flex-col lg:flex-row lg:items-center" style={{marginBottom: '1.5rem', gap: '0.5rem'}}>
                  <label htmlFor="linkedin_url" className="text-sm font-medium lg:w-40 lg:flex-shrink-0" style={{color: 'var(--foreground-secondary)'}}>
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    id="linkedin_url"
                    name="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="https://linkedin.com/in/yourprofile"
                    style={{padding: '0.625rem 1rem'}}
                  />
                </div>

                {/* Facebook */}
                <div className="flex flex-col lg:flex-row lg:items-center" style={{marginBottom: '1.5rem', gap: '0.5rem'}}>
                  <label htmlFor="facebook_url" className="text-sm font-medium lg:w-40 lg:flex-shrink-0" style={{color: 'var(--foreground-secondary)'}}>
                    Facebook
                  </label>
                  <input
                    type="url"
                    id="facebook_url"
                    name="facebook_url"
                    value={formData.facebook_url}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="https://facebook.com/yourprofile"
                    style={{padding: '0.625rem 1rem'}}
                  />
                </div>

                {/* Instagram */}
                <div className="flex flex-col lg:flex-row lg:items-center" style={{gap: '0.5rem'}}>
                  <label htmlFor="instagram_url" className="text-sm font-medium lg:w-40 lg:flex-shrink-0" style={{color: 'var(--foreground-secondary)'}}>
                    Instagram
                  </label>
                  <input
                    type="url"
                    id="instagram_url"
                    name="instagram_url"
                    value={formData.instagram_url}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="https://instagram.com/yourprofile"
                    style={{padding: '0.625rem 1rem'}}
                  />
                </div>
              </div>

              {/* About Section */}
              <div style={{paddingTop: '2rem', borderTop: '1px solid var(--border-light)'}}>
                <div className="flex flex-col lg:flex-row lg:items-start" style={{marginBottom: '2rem', gap: '0.5rem'}}>
                  <label htmlFor="bio" className="text-sm font-medium lg:w-40 lg:flex-shrink-0" style={{color: 'var(--foreground-secondary)'}}>
                    About
                  </label>
                  <div className="w-full">
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      className="input w-full"
                      rows={4}
                      placeholder="Tell us about yourself..."
                      style={{
                        resize: 'vertical', 
                        minHeight: '100px', 
                        maxHeight: '400px',
                        padding: '0.75rem 1rem',
                        fontFamily: 'inherit',
                        lineHeight: '1.5',
                        overflow: 'auto'
                      }}
                    />
                    <p className="text-xs mt-1" style={{color: 'var(--foreground-tertiary)'}}>
                      Max 500 characters • Drag corner to resize
                    </p>
                  </div>
                </div>
              </div>

              {/* Location Information Section */}
              <div style={{paddingTop: '2rem', borderTop: '1px solid var(--border-light)'}}>
                <h2 className="text-lg font-semibold uppercase tracking-wider mb-6" style={{color: 'var(--foreground-tertiary)'}}>Location</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* City */}
                  <div className="flex flex-col lg:flex-row lg:items-center" style={{gap: '0.5rem'}}>
                    <label htmlFor="city" className="text-sm font-medium lg:w-20 lg:flex-shrink-0" style={{color: 'var(--foreground-secondary)'}}>
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="input w-full"
                      placeholder="e.g., Mumbai"
                      style={{padding: '0.625rem 1rem'}}
                    />
                  </div>
                  
                  {/* State */}
                  <div className="flex flex-col lg:flex-row lg:items-center" style={{gap: '0.5rem'}}>
                    <label htmlFor="state" className="text-sm font-medium lg:w-20 lg:flex-shrink-0" style={{color: 'var(--foreground-secondary)'}}>
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="input w-full"
                      placeholder="e.g., Maharashtra"
                      style={{padding: '0.625rem 1rem'}}
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4" style={{paddingTop: '2rem', borderTop: '1px solid var(--border-light)'}}>
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
            
            {/* Help text */}
            <div className="text-center" style={{
              borderTop: '1px solid var(--border-light)',
              color: 'var(--foreground-tertiary)',
              fontSize: '0.875rem',
              padding: '2.5rem'
            }}>
              <p className="text-sm">
                Fields marked with * are required. Your phone number will be visible to all alumni for networking. Your email address from registration is visible only to you on your profile.
              </p>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Zoom Modal */}
      {zoomedPhoto && (
        <div 
          className="photo-zoom-overlay"
          onClick={() => setZoomedPhoto(null)}
        >
          <div 
            className="photo-zoom-container"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="photo-zoom-close"
              onClick={() => setZoomedPhoto(null)}
              title="Close"
            >
              ×
            </button>
            <img 
              src={zoomedPhoto.url}
              alt={zoomedPhoto.name}
              className="photo-zoom-image"
            />
          </div>
        </div>
      )}
      
    </div>
  )
}