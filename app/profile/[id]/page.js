'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  // Get the ID from the URL using Next.js's useParams hook
  const params = useParams()
  const router = useRouter()
  
  // State to store the alumni's data and loading status
  const [alumni, setAlumni] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)

  // When the page loads, check authentication and fetch profile data
  useEffect(() => {
    checkUserAndFetchProfile()
  }, [params.id])

  const checkUserAndFetchProfile = async () => {
    try {
      // First, check if the user is logged in
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // If not logged in, redirect to login page
        router.push('/login')
        return
      }
      
      setCurrentUser(user)
      
      // Now fetch the profile data for the ID in the URL
      const { data, error } = await supabase
        .from('alumni_profiles')
        .select('*')
        .eq('user_id', params.id)
        .single()
      
      if (error) {
        console.error('Error fetching profile:', error)
        // Profile not found or error occurred
        setAlumni(null)
      } else {
        setAlumni(data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: '#f8f9fa'}}>
        <div className="text-center animate-fadeIn">
          <div className="loading-lg mx-auto mb-4"></div>
          <p className="text-lg text-secondary">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Show error state if profile not found
  if (!alumni) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: '#f8f9fa'}}>
        <div className="text-center animate-fadeIn">
          <svg className="mx-auto h-12 w-12 text-tertiary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          <h3 className="text-lg font-semibold text-primary mb-2">Profile not found</h3>
          <p className="text-sm text-secondary mb-6">This alumni profile doesn&apos;t exist or has been removed.</p>
          <Link
            href="/dashboard"
            className="btn-primary"
          >
            Back to Directory
          </Link>
        </div>
      </div>
    )
  }

  // Check if this is the current user's own profile
  const isOwnProfile = currentUser && currentUser.id === alumni.user_id

  return (
    <div className="min-h-screen" style={{background: 'var(--background-secondary)'}}>
      {/* Header */}
      <header className="modern-header">
        <div className="modern-container" style={{paddingTop: '1.5rem', paddingBottom: '1.5rem'}}>
          <div className="flex justify-between items-center">
            <Link 
              href="/dashboard"
              className="flex items-center transition-colors duration-200"
              style={{color: 'var(--foreground-secondary)', fontSize: '0.9375rem'}}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Directory
            </Link>
            {isOwnProfile && (
              <Link
                href="/profile/edit"
                className="btn-primary"
              >
                Edit Profile
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <div className="modern-container" style={{paddingTop: '3rem', paddingBottom: '4rem'}}>
        <div className="max-w-4xl mx-auto">
          <div className="animate-fadeIn" style={{background: 'white', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)'}}>
            {/* Profile Header Section */}
            <div className="text-center" style={{padding: '3rem 2rem', background: 'var(--background-tertiary)', borderBottom: '1px solid var(--border-light)'}}>
              {/* Large profile photo/initial */}
              <div className="mx-auto flex items-center justify-center overflow-hidden" style={{width: '140px', height: '140px', background: 'white', borderRadius: '50%', marginBottom: '2rem', boxShadow: 'var(--shadow)'}}>
                {alumni.photo_url ? (
                  <img 
                    src={alumni.photo_url} 
                    alt={alumni.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl font-semibold" style={{color: 'var(--primary)'}}>
                    {alumni.full_name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              {/* Name and batch */}
              <h1 className="text-4xl font-bold mb-3" style={{color: 'var(--foreground)', letterSpacing: '-0.02em'}}>{alumni.full_name}</h1>
              <p className="text-lg" style={{color: 'var(--foreground-secondary)'}}>
                Class of {alumni.batch_start} - {alumni.batch_end}
              </p>
            </div>

            {/* Profile Details Section */}
            <div style={{padding: '3rem'}}>
              <div className="grid grid-cols-1 md:grid-cols-2" style={{gap: '3rem', marginBottom: '3rem'}}>
                {/* Current Job */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{color: 'var(--foreground-tertiary)'}}>Current Position</h3>
                  <p className="text-xl" style={{color: 'var(--foreground)', fontWeight: 500}}>
                    {alumni.current_job || 'Not specified'}
                  </p>
                </div>

                {/* Location */}
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{color: 'var(--foreground-tertiary)'}}>Location</h3>
                  <p className="text-xl" style={{color: 'var(--foreground)', fontWeight: 500}}>
                    {alumni.city || alumni.state 
                      ? `${alumni.city || ''}${alumni.city && alumni.state ? ', ' : ''}${alumni.state || ''}`
                      : 'Not specified'}
                  </p>
                </div>
              </div>

              {/* About Section */}
              <div style={{paddingTop: '2rem', borderTop: '1px solid var(--border-light)'}}>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{color: 'var(--foreground-tertiary)'}}>About</h3>
                <div style={{background: 'var(--background-tertiary)', padding: '1.5rem', borderRadius: 'var(--radius)', marginBottom: '2rem'}}>
                  <p style={{color: 'var(--foreground-secondary)', fontSize: '1rem', lineHeight: 1.7}}>
                    This alumni hasn&apos;t added a bio yet.
                  </p>
                </div>
              </div>

              {/* Contact Section */}
              <div style={{paddingTop: '2rem', borderTop: '1px solid var(--border-light)'}}>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{color: 'var(--foreground-tertiary)'}}>Contact Information</h3>
                <div style={{background: 'var(--primary-light)', padding: '1.5rem', borderRadius: 'var(--radius)'}}>
                  <p style={{color: 'var(--primary)', fontSize: '0.9375rem'}}>
                    Contact information is only visible to the profile owner.
                  </p>
                </div>
              </div>

              {/* Actions Section */}
              <div className="flex justify-between items-center" style={{marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-light)'}}>
                <p className="text-sm" style={{color: 'var(--foreground-tertiary)'}}>
                  Profile last updated: {new Date(alumni.updated_at).toLocaleDateString()}
                </p>
                {!isOwnProfile && (
                  <button className="btn-primary">
                    Send Message
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}