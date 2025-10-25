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
  const [zoomedPhoto, setZoomedPhoto] = useState(null)

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
      <div className="modern-container" style={{paddingTop: '1rem', paddingBottom: '0.5rem'}}>
        <Link 
          href="/dashboard"
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
          Back to Directory
        </Link>
      </div>

      {/* Profile Content */}
      <div className="modern-container px-4 sm:px-6 lg:px-8" style={{paddingTop: '3rem', paddingBottom: '2rem'}}>
        <div style={{maxWidth: '700px', margin: '0 auto'}}>
          <div className="mx-2 sm:mx-0" style={{
            background: 'white', 
            borderRadius: '12px',
            overflow: 'hidden', 
            border: '1px solid var(--border-light)',
            width: '100%',
            maxWidth: '700px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            animation: 'zoomIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
          }}>
            {/* Edit Profile Button - Only show for own profile */}
            {isOwnProfile && (
              <div style={{
                padding: '1rem 2.5rem',
                display: 'flex',
                justifyContent: 'flex-end',
                borderBottom: '1px solid var(--border-light)'
              }}>
                <Link
                  href="/profile/edit"
                  className="btn-secondary text-sm"
                  style={{padding: '0.5rem 1.5rem'}}
                >
                  Edit Profile
                </Link>
              </div>
            )}

            {/* Profile Header Section - Horizontal Layout */}
            <div className="p-8 sm:p-10" style={{
              background: 'white',
              borderBottom: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '2rem',
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
                marginLeft: '0.75rem',
                marginTop: '0.5rem'
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
                      borderRadius: '50%',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease'
                    }}
                    onClick={() => {
                      setZoomedPhoto({
                        url: alumni.photo_url,
                        name: alumni.full_name
                      });
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
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
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem'}}>
                  {/* Name */}
                  <h1 className="text-lg md:text-xl font-bold" style={{
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
                    <div title="WhatsApp" style={{cursor: 'pointer', display: 'flex', alignItems: 'center'}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#25d366">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                    </div>
                    {alumni.phone ? (
                      <a
                        href={`https://wa.me/${alumni.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '0.875rem',
                          color: 'var(--foreground-secondary)',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        {alumni.phone}
                      </a>
                    ) : (
                      <span style={{fontSize: '0.875rem', color: 'var(--foreground-secondary)', fontStyle: 'italic'}}>
                        Not provided
                      </span>
                    )}
                  </div>
                </div>

                {/* Roll Number - Separate row below the grid */}
                {alumni.roll_no && (
                  <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem'}}>
                    <div title="Roll Number" style={{cursor: 'pointer', display: 'flex', alignItems: 'center'}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-secondary)" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10 9 9 9 8 9"/>
                      </svg>
                    </div>
                    <span style={{fontSize: '0.875rem', color: 'var(--foreground-secondary)'}}>
                      Roll No: {alumni.roll_no}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* About Section */}
            <div style={{padding: '2rem 2.5rem'}}>
              <div style={{
                background: 'var(--background)',
                padding: '1.25rem 1.5rem',
                borderRadius: '10px',
                border: '1px solid var(--border-light)',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start'
              }}>
                <div title="About" style={{cursor: 'pointer', display: 'flex', alignItems: 'center', marginTop: '0.125rem'}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-secondary)" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <p style={{
                  color: alumni.bio ? 'var(--foreground)' : 'var(--foreground-secondary)',
                  fontSize: '1rem',
                  lineHeight: 1.6,
                  margin: 0,
                  flex: 1,
                  fontStyle: alumni.bio ? 'normal' : 'italic'
                }}>
                  {alumni.bio || 'No bio added yet.'}
                </p>
              </div>

              {/* Social Media Links - Only show if any link exists */}
              {(alumni.linkedin_url || alumni.facebook_url || alumni.instagram_url) && (
                <div style={{
                  marginTop: '1.5rem',
                  display: 'flex',
                  gap: '1rem',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  {alumni.linkedin_url && (
                    <a
                      href={alumni.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-all duration-200 hover:scale-110"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-light)',
                        background: 'white',
                        color: '#0077B5',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                      LinkedIn
                    </a>
                  )}
                  
                  {alumni.facebook_url && (
                    <a
                      href={alumni.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-all duration-200 hover:scale-110"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-light)',
                        background: 'white',
                        color: '#1877F2',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f0f7ff'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      Facebook
                    </a>
                  )}
                  
                  {alumni.instagram_url && (
                    <a
                      href={alumni.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-all duration-200 hover:scale-110"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-light)',
                        background: 'white',
                        color: '#E4405F',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fff0f3'}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                      </svg>
                      Instagram
                    </a>
                  )}
                </div>
              )}
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