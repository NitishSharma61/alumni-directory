'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Footer from '@/components/Footer'
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
      <div className="modern-container" style={{paddingTop: '1rem'}}>
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
      <div className="modern-container" style={{paddingTop: '1.5rem', paddingBottom: '2rem'}}>
        <div style={{maxWidth: '700px', margin: '0 auto'}}>
          <div className="animate-fadeIn" style={{
            background: 'white', 
            borderRadius: 'var(--radius-lg)', 
            overflow: 'hidden', 
            border: '1px solid var(--border-light)'
          }}>
            {/* Profile Header Section */}
            <div className="text-center" style={{
              padding: '2rem 1.5rem 1.5rem 1.5rem', 
              background: 'white', 
              borderBottom: '1px solid var(--border-light)'
            }}>
              {/* Large profile photo/initial */}
              <div className="mx-auto flex items-center justify-center overflow-hidden" style={{
                width: '120px', 
                height: '120px', 
                background: 'white', 
                borderRadius: '50%', 
                marginBottom: '1.5rem', 
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px var(--border-light)',
                border: '4px solid white'
              }}>
                {alumni.photo_url ? (
                  <img 
                    src={alumni.photo_url} 
                    alt={alumni.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl md:text-5xl font-semibold" style={{color: 'var(--primary)'}}>
                    {alumni.full_name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              {/* Name and batch */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3" style={{
                color: 'var(--foreground)', 
                letterSpacing: '-0.02em',
                lineHeight: '1.2'
              }}>
                {alumni.full_name}
              </h1>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '0.5rem'}}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Class of {alumni.batch_start} - {alumni.batch_end}
              </div>
            </div>

            {/* Profile Details Section */}
            <div style={{padding: '2.5rem'}}>
              <div className="grid grid-cols-1 md:grid-cols-2 w-full" style={{gap: '2rem', marginBottom: '2.5rem'}}>
                {/* Current Job */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  padding: '1.25rem',
                  backgroundColor: 'var(--background-muted)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border-light)'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: 'var(--background-tertiary)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '1rem',
                    flexShrink: 0
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-secondary)" strokeWidth="2">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                      <line x1="8" y1="21" x2="16" y2="21"/>
                      <line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                  </div>
                  <div style={{flex: 1, minWidth: 0}}>
                    <h3 className="text-sm font-semibold uppercase tracking-wider mb-2" style={{color: 'var(--foreground-tertiary)'}}>
                      Current Position
                    </h3>
                    <p style={{
                      color: 'var(--foreground)', 
                      fontWeight: '500',
                      fontSize: '1rem',
                      lineHeight: '1.4',
                      wordWrap: 'break-word'
                    }}>
                      {alumni.current_job || 'Not specified'}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  padding: '1rem',
                  backgroundColor: 'white',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border-light)'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: 'var(--background-tertiary)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '1rem',
                    flexShrink: 0
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-secondary)" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div style={{flex: 1, minWidth: 0}}>
                    <h3 className="text-sm font-semibold uppercase tracking-wider mb-2" style={{color: 'var(--foreground-tertiary)'}}>
                      Location
                    </h3>
                    <p style={{
                      color: 'var(--foreground)', 
                      fontWeight: '500',
                      fontSize: '1rem',
                      lineHeight: '1.4',
                      wordWrap: 'break-word'
                    }}>
                      {alumni.city || alumni.state 
                        ? `${alumni.city || ''}${alumni.city && alumni.state ? ', ' : ''}${alumni.state || ''}`
                        : 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div style={{paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)', marginBottom: '1.5rem'}}>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{color: 'var(--foreground-tertiary)'}}>About</h3>
                <div style={{
                  background: 'white', 
                  padding: '1rem', 
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border-light)'
                }}>
                  <p style={{
                    color: alumni.bio ? 'var(--foreground)' : 'var(--foreground-secondary)', 
                    fontSize: '1rem', 
                    lineHeight: 1.6,
                    margin: 0
                  }}>
                    {alumni.bio || 'This alumni hasn&apos;t added a bio yet.'}
                  </p>
                </div>
              </div>

              {/* Contact Section */}
              <div style={{paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)', marginBottom: '1.5rem'}}>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{color: 'var(--foreground-tertiary)'}}>Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 w-full" style={{gap: '1.5rem'}}>
                  {/* Email */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    padding: '1rem',
                    backgroundColor: 'white',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border-light)'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: 'var(--primary)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '1rem',
                      flexShrink: 0
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </div>
                    <div style={{flex: 1, minWidth: 0}}>
                      <h4 className="text-sm font-semibold uppercase tracking-wider mb-2" style={{color: 'var(--foreground-tertiary)'}}>
                        Email
                      </h4>
                      <p style={{
                        color: 'var(--foreground)', 
                        fontWeight: '500',
                        fontSize: '1rem',
                        lineHeight: '1.4',
                        wordWrap: 'break-word'
                      }}>
                        {currentUser?.email || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    padding: '1rem',
                    backgroundColor: 'white',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border-light)'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: 'var(--background-tertiary)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '1rem',
                      flexShrink: 0
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-secondary)" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                    </div>
                    <div style={{flex: 1, minWidth: 0}}>
                      <h4 className="text-sm font-semibold uppercase tracking-wider mb-2" style={{color: 'var(--foreground-tertiary)'}}>
                        Phone
                      </h4>
                      <p style={{
                        color: 'var(--foreground)', 
                        fontWeight: '500',
                        fontSize: '1rem',
                        lineHeight: '1.4',
                        wordWrap: 'break-word'
                      }}>
                        {alumni.phone || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Section */}
              <div className="flex justify-between items-center" style={{
                paddingTop: '1.5rem', 
                borderTop: '1px solid var(--border-light)'
              }}>
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
      
      {/* Footer */}
      <Footer />
    </div>
  )
}