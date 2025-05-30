'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'

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
  }, [params.id]) // eslint-disable-line react-hooks/exhaustive-deps

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
      <Header />
      
      {/* Back Navigation */}
      <div className="modern-container" style={{paddingTop: '0.5rem'}}>
        <Link 
          href="/dashboard"
          className="inline-flex items-center text-sm md:text-base transition-colors duration-200"
          style={{color: 'var(--foreground-secondary)'}}
        >
          <svg className="w-5 h-5 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="hidden sm:inline">Back to Directory</span>
          <span className="sm:hidden">Back</span>
        </Link>
      </div>

      {/* Profile Content */}
      <div className="modern-container px-4 sm:px-6 lg:px-8" style={{paddingTop: '3rem', paddingBottom: '2rem'}}>
        <div style={{maxWidth: '600px', margin: '0 auto'}}>
          <div className="animate-fadeIn mx-2 sm:mx-0" style={{
            background: 'white', 
            borderRadius: '8px',
            overflow: 'hidden', 
            border: '1px solid var(--border-light)',
            width: '100%',
            maxWidth: '600px'
          }}>
            {/* Profile Header Section - Horizontal Layout */}
            <div className="p-6 sm:p-8" style={{
              background: 'white',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1.5rem',
              flexWrap: 'wrap'
            }}>
              {/* Left Column - Profile Photo */}
              <div className="flex items-center justify-center overflow-hidden w-16 h-16 sm:w-20 sm:h-20" style={{
                minWidth: '64px',
                minHeight: '64px',
                background: 'white', 
                borderRadius: '50%', 
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px var(--border-light)',
                border: '3px solid white',
                flexShrink: 0,
                marginLeft: '0.5rem'
              }}>
                {alumni.photo_url ? (
                  <img 
                    src={alumni.photo_url} 
                    alt={alumni.full_name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                      borderRadius: '50%'
                    }}
                  />
                ) : (
                  <span className="text-3xl font-semibold" style={{color: 'var(--primary)'}}>
                    {alumni.full_name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              {/* Right Column - Info */}
              <div style={{flex: 1, minWidth: '200px'}}>
                {/* Name and Class on same row */}
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem'}}>
                  {/* Name */}
                  <h1 className="text-xl md:text-2xl font-bold" style={{
                    color: 'var(--foreground)',
                    letterSpacing: '-0.02em',
                    lineHeight: '1.2'
                  }}>
                    {alumni.full_name}
                  </h1>
                  
                  {/* Class of - Right side */}
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--foreground-secondary)',
                    flexShrink: 0,
                    marginRight: '0.5rem'
                  }}>
                    Class of {alumni.batch_start} - {alumni.batch_end}
                  </p>
                </div>
                
                {/* 2x2 Grid Layout - Mobile: 1 column, Desktop: 2 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2" style={{gap: '0.75rem', marginTop: '0.5rem'}}>
                  {/* Current Position - Top Left */}
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <div title="Current Position" style={{cursor: 'pointer', display: 'flex', alignItems: 'center'}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-secondary)" strokeWidth="2">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                        <line x1="8" y1="21" x2="16" y2="21"/>
                        <line x1="12" y1="17" x2="12" y2="21"/>
                      </svg>
                    </div>
                    <span style={{fontSize: '0.875rem', color: 'var(--foreground-secondary)'}}>
                      {alumni.current_job || 'Not specified'}
                    </span>
                  </div>

                  {/* Location - Top Right */}
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <div title="Location" style={{cursor: 'pointer', display: 'flex', alignItems: 'center'}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-secondary)" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                    </div>
                    <span style={{fontSize: '0.875rem', color: 'var(--foreground-secondary)'}}>
                      {alumni.city || alumni.state
                        ? `${alumni.city || ''}${alumni.city && alumni.state ? ', ' : ''}${alumni.state || ''}`
                        : 'Not specified'}
                    </span>
                  </div>

                  {/* Email - Bottom Left */}
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <div title="Email" style={{cursor: 'pointer', display: 'flex', alignItems: 'center'}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-secondary)" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </div>
                    {alumni.email ? (
                      <a
                        href={`mailto:${alumni.email}`}
                        style={{
                          fontSize: '0.875rem',
                          color: 'var(--primary)',
                          textDecoration: 'underline'
                        }}
                      >
                        {alumni.email}
                      </a>
                    ) : (
                      <span style={{fontSize: '0.875rem', color: 'var(--foreground-secondary)', fontStyle: 'italic'}}>
                        Not provided
                      </span>
                    )}
                  </div>

                  {/* Phone - Bottom Right */}
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <div title="Phone" style={{cursor: 'pointer', display: 'flex', alignItems: 'center'}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-secondary)" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                    </div>
                    {alumni.phone ? (
                      <a
                        href={`https://wa.me/${alumni.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '0.875rem',
                          color: '#25d366',
                          textDecoration: 'underline',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        {alumni.phone}
                        <span style={{fontSize: '0.75rem', color: 'var(--foreground-secondary)'}}>
                          (WhatsApp)
                        </span>
                      </a>
                    ) : (
                      <span style={{fontSize: '0.875rem', color: 'var(--foreground-secondary)', fontStyle: 'italic'}}>
                        Not provided
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div style={{padding: '1.5rem 2rem'}}>
              <div style={{
                background: 'white',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border-light)',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start'
              }}>
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: 'var(--foreground-secondary)',
                  whiteSpace: 'nowrap',
                  marginTop: '0.125rem'
                }}>About:</span>
                <p style={{
                  color: alumni.bio ? 'var(--foreground)' : 'var(--foreground-secondary)',
                  fontSize: '1rem',
                  lineHeight: 1.6,
                  margin: 0,
                  flex: 1,
                  fontStyle: alumni.bio ? 'normal' : 'italic'
                }}>
                  {alumni.bio || 'This alumni hasn&apos;t added a bio yet.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  )
}