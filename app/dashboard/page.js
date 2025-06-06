'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { isAdminEmail } from '@/lib/constants'
import Link from 'next/link'
import InstallPrompt from '@/components/InstallPrompt'
import Header from '@/components/Header'
import SearchableSelect from '@/components/SearchableSelect'

export default function DashboardPage() {
  // State management remains the same
  const [user, setUser] = useState(null)
  const [currentUserProfile, setCurrentUserProfile] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [alumni, setAlumni] = useState([])
  const [filteredAlumni, setFilteredAlumni] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [batchFilter, setBatchFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [zoomedPhoto, setZoomedPhoto] = useState(null)
  const router = useRouter()

  // All the useEffect hooks and functions remain the same
  useEffect(() => {
    checkUser()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    filterAlumni()
  }, [searchTerm, batchFilter, locationFilter, alumni]) // eslint-disable-line react-hooks/exhaustive-deps

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }
      
      setUser(user)
      const adminStatus = isAdminEmail(user.email)
      setIsAdmin(adminStatus)
      
      // Fetch current user's profile to check approval status
      const { data: profile } = await supabase
        .from('alumni_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (profile) {
        setCurrentUserProfile(profile)
      }
      
      // Now fetch alumni with correct admin status
      await fetchAlumniWithAdminStatus(adminStatus)
    } catch (error) {
      console.error('Error checking user:', error)
      router.push('/login')
    }
  }

  const fetchAlumni = async () => {
    try {
      // Only fetch approved alumni (unless user is admin)
      let query = supabase
        .from('alumni_profiles')
        .select('*')
        .order('full_name', { ascending: true })
      
      // Non-admin users only see approved alumni
      if (!isAdmin) {
        query = query.eq('is_approved', true)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      setAlumni(data || [])
      setFilteredAlumni(data || [])
    } catch (error) {
      console.error('Error fetching alumni:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAlumniWithAdminStatus = async (adminStatus) => {
    try {
      // Only fetch approved alumni (unless user is admin)
      let query = supabase
        .from('alumni_profiles')
        .select('*')
        .order('full_name', { ascending: true })
      
      // Non-admin users only see approved alumni
      if (!adminStatus) {
        query = query.eq('is_approved', true)
      }
      
      const { data, error } = await query
      
      if (error) throw error
      
      setAlumni(data || [])
      setFilteredAlumni(data || [])
    } catch (error) {
      console.error('Error fetching alumni:', error)
    } finally {
      setLoading(false)
    }
  }

  // Generate batch range options (same as signup page)
  const generateBatchRanges = () => {
    const ranges = []
    const currentYear = new Date().getFullYear()
    
    // Generate all possible 7-year ranges from current year going backwards
    for (let startYear = currentYear; startYear >= 1980; startYear--) {
      const endYear = startYear + 7
      // Only add if the end year doesn't go too far into future
      if (endYear <= currentYear + 1) {
        ranges.push({
          value: `${startYear}-${endYear}`,
          label: `${startYear} - ${endYear}`,
          startYear,
          endYear
        })
      }
    }
    
    return ranges
  }

  const filterAlumni = () => {
    let filtered = alumni

    if (searchTerm) {
      filtered = filtered.filter(person =>
        person.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (batchFilter) {
      // Parse the selected range (e.g., "2017-2022")
      const [rangeStart, rangeEnd] = batchFilter.split('-').map(year => parseInt(year.trim()))
      
      filtered = filtered.filter(person => {
        // Convert to numbers to ensure proper comparison
        const personStart = parseInt(person.batch_start)
        const personEnd = parseInt(person.batch_end)
        
        // FIXED: Use exact batch match - only show people from the exact selected batch
        // This prevents people from other batches appearing in the filtered results
        const exactMatch = personStart === rangeStart && personEnd === rangeEnd
        
        return exactMatch
      })
    }

    if (locationFilter) {
      filtered = filtered.filter(person => {
        const location = `${person.city || ''} ${person.state || ''}`.toLowerCase()
        return location.includes(locationFilter.toLowerCase())
      })
    }

    setFilteredAlumni(filtered)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center animate-fadeIn">
          <div className="loading-lg mx-auto mb-4"></div>
          <p className="text-lg text-primary">Loading alumni directory...</p>
          <p className="text-secondary mt-2">Please wait while we fetch the data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{background: 'var(--background-secondary)'}}>
      {/* Header */}
      <Header />

      {/* Pending Approval Banner */}
      {currentUserProfile && !currentUserProfile.is_approved && !isAdmin && (
        <div style={{background: '#fffbeb', padding: '1rem', borderBottom: '1px solid #fbbf24'}}>
          <div className="modern-container">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="#f59e0b" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-center">
                  <p className="font-semibold" style={{color: '#92400e'}}>Your account is pending approval</p>
                  <p className="text-sm" style={{color: '#92400e'}}>You can update your profile while waiting for approval. Once approved, you&apos;ll be able to see other alumni.</p>
                </div>
                <Link href="/profile/edit" className="btn-secondary" style={{background: '#f59e0b', color: 'white', fontWeight: '600', marginLeft: '1rem'}}>
                  Update Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Main Content - Only show if approved or admin */}
      {(currentUserProfile?.is_approved || isAdmin) ? (
        <>
          {/* Search Section */}
          <div className="modern-container" style={{paddingTop: '1.5rem', paddingBottom: '1rem'}}>
        <div className="modern-fade-in" style={{
          background: 'white',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          marginBottom: '1.5rem'
        }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold" style={{color: 'var(--foreground)', letterSpacing: '-0.01em'}}>Find Alumni</h2>
            <p style={{color: 'var(--foreground-secondary)'}}>
              Showing <span className="font-semibold" style={{color: 'var(--foreground)'}}>{filteredAlumni.length}</span> of{' '}
              <span className="font-semibold" style={{color: 'var(--foreground)'}}>{alumni.length}</span> alumni
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col md:flex-row md:items-center md:gap-3">
              <label htmlFor="search" className="block text-sm font-medium text-secondary mb-2 md:mb-0 md:whitespace-nowrap">
                Search by Name
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search alumni..."
                className="input w-full"
                style={{padding: '0.625rem 1rem'}}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:gap-3">
              <label htmlFor="batch" className="block text-sm font-medium text-secondary mb-2 md:mb-0 md:whitespace-nowrap">
                Filter by Batch Year
              </label>
              <SearchableSelect
                options={[
                  { value: "", label: "All batches" },
                  ...generateBatchRanges()
                ]}
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                name="batchFilter"
                placeholder="All batches"
                className="w-full"
              />
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:gap-3">
              <label htmlFor="location" className="block text-sm font-medium text-secondary mb-2 md:mb-0 md:whitespace-nowrap">
                Filter by Location
              </label>
              <input
                type="text"
                id="location"
                placeholder="City/State"
                className="input w-full"
                style={{padding: '0.625rem 1rem'}}
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>
          </div>

          {(searchTerm || batchFilter || locationFilter) && (
            <div className="flex items-center justify-end" style={{marginTop: '1rem'}}>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setBatchFilter('')
                  setLocationFilter('')
                }}
                style={{color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 500}}
                className="hover:underline transition-all duration-200"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Alumni Grid */}
      <div className="modern-container" style={{paddingBottom: '2rem'}}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{gap: '1.5rem'}}>
          {filteredAlumni.map((person) => (
            <div
              key={person.id}
              className="professional-alumni-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                padding: '1.25rem'
              }}
            >
              {/* Profile Photo Section - Left Side */}
              <div style={{flexShrink: 0}}>
                {person.photo_url ? (
                  <div style={{position: 'relative'}}>
                    <img
                      src={person.photo_url}
                      alt={person.full_name}
                      className="rounded-full object-cover"
                      style={{
                        width: '72px',
                        height: '72px',
                        minWidth: '72px',
                        minHeight: '72px',
                        maxWidth: '72px',
                        maxHeight: '72px',
                        border: '3px solid white',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), 0 0 0 1px var(--border-light)',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoomedPhoto({
                          url: person.photo_url,
                          name: person.full_name
                        });
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '2px',
                      width: '14px',
                      height: '14px',
                      background: 'var(--success)',
                      borderRadius: '50%',
                      border: '2px solid white',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }} />
                  </div>
                ) : (
                  <div style={{position: 'relative'}}>
                    <div className="rounded-full flex items-center justify-center" style={{
                      width: '72px',
                      height: '72px',
                      minWidth: '72px',
                      minHeight: '72px',
                      maxWidth: '72px',
                      maxHeight: '72px',
                      background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--background-tertiary) 100%)',
                      border: '3px solid white',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), 0 0 0 1px var(--border-light)'
                    }}>
                      <span className="text-xl font-semibold" style={{
                        color: 'var(--primary)',
                        fontWeight: '600'
                      }}>
                        {person.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '2px',
                      width: '14px',
                      height: '14px',
                      background: 'var(--success)',
                      borderRadius: '50%',
                      border: '2px solid white',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }} />
                  </div>
                )}
              </div>

              {/* Alumni Details - Right Side */}
              <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                {/* Name and Batch on same row */}
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: 'var(--foreground)',
                    margin: 0,
                    letterSpacing: '-0.025em',
                    lineHeight: '1.3',
                    flex: 1
                  }}>
                    {person.full_name}
                  </h3>
                  
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    backgroundColor: 'var(--background-tertiary)',
                    color: 'var(--foreground-secondary)',
                    padding: '0.125rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.6875rem',
                    fontWeight: '500',
                    width: 'fit-content',
                    flexShrink: 0
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '0.25rem'}}>
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    Batch {person.batch_start} - {person.batch_end}
                  </div>
                </div>

                {/* View Profile Button */}
                <Link
                  href={`/profile/${person.user_id}`}
                  className="view-profile-btn"
                  style={{
                    width: 'fit-content',
                    margin: 0
                  }}
                  onClick={(e) => {
                    // Add zoom animation to the parent card
                    const card = e.currentTarget.closest('.professional-alumni-card');
                    if (card) {
                      card.style.animation = 'clickZoom 0.3s ease-out';
                      setTimeout(() => {
                        if (card) card.style.animation = '';
                      }, 300);
                    }
                  }}
                >
                  View Profile
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginLeft: '0.25rem'}}>
                    <path d="M5 12h14"/>
                    <path d="M12 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAlumni.length === 0 && (
          <div className="text-center animate-fadeIn" style={{padding: '5rem 0'}}>
            <svg className="mx-auto h-20 w-20 mb-6" style={{color: 'var(--foreground-light)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-3xl font-semibold mb-3" style={{color: 'var(--foreground)', letterSpacing: '-0.02em'}}>No Alumni Found</h3>
            <p className="text-lg mb-5" style={{color: 'var(--foreground-secondary)'}}>No alumni match your current search criteria</p>
            <p style={{color: 'var(--foreground-tertiary)', fontSize: '0.9375rem'}}>Try adjusting your filters or clearing them to see all alumni</p>
          </div>
        )}
      </div>
        </>
      ) : (
        /* Not Approved State */
        <div className="min-h-screen flex items-center justify-center" style={{paddingTop: '2rem', paddingBottom: '2rem'}}>
          <div className="text-center max-w-2xl mx-auto" style={{
            background: '#fffbeb', 
            padding: '3rem 2rem', 
            borderRadius: '12px',
            border: '1px solid #fbbf24'
          }}>
            <svg className="mx-auto h-24 w-24 mb-6" style={{color: '#f59e0b'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-3xl font-bold mb-4" style={{color: '#92400e'}}>Account Pending Approval</h2>
            <p className="text-lg mb-8" style={{color: '#92400e'}}>
              Your account is currently being reviewed by our admin team. This usually takes 24-48 hours.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
              <Link href="/profile/edit" className="btn-primary" style={{background: '#f59e0b', color: 'white', border: 'none'}}>
                Complete Your Profile
              </Link>
              <Link href={`/profile/${user?.id}`} className="btn-secondary" style={{background: 'white', color: '#f59e0b', border: '1px solid #f59e0b'}}>
                View Your Profile
              </Link>
            </div>
            <p className="mt-8 text-sm" style={{color: '#92400e'}}>
              You&apos;ll receive an email notification once your account is approved.
            </p>
          </div>
        </div>
      )}
      
      {/* Install Prompt */}
      <InstallPrompt />

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