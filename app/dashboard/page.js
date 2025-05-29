'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import InstallPrompt from '@/components/InstallPrompt'
import Footer from '@/components/Footer'
import Header from '@/components/Header'

export default function DashboardPage() {
  // State management remains the same
  const [user, setUser] = useState(null)
  const [alumni, setAlumni] = useState([])
  const [filteredAlumni, setFilteredAlumni] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [batchFilter, setBatchFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const router = useRouter()

  // All the useEffect hooks and functions remain the same
  useEffect(() => {
    checkUser()
    fetchAlumni()
  }, [])

  useEffect(() => {
    filterAlumni()
  }, [searchTerm, batchFilter, locationFilter, alumni])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }
      
      setUser(user)
    } catch (error) {
      console.error('Error checking user:', error)
      router.push('/login')
    }
  }

  const fetchAlumni = async () => {
    try {
      const { data, error } = await supabase
        .from('alumni_profiles')
        .select('*')
        .order('full_name', { ascending: true })
      
      if (error) throw error
      
      setAlumni(data || [])
      setFilteredAlumni(data || [])
    } catch (error) {
      console.error('Error fetching alumni:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAlumni = () => {
    let filtered = alumni

    if (searchTerm) {
      filtered = filtered.filter(person =>
        person.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (batchFilter) {
      const year = parseInt(batchFilter)
      filtered = filtered.filter(person =>
        year >= person.batch_start && year <= person.batch_end
      )
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
            <h2 className="text-xl md:text-2xl font-semibold" style={{color: 'var(--foreground)', letterSpacing: '-0.01em'}}>Find Alumni</h2>
            <p style={{color: 'var(--foreground-secondary)', fontSize: '0.9375rem'}}>
              Showing <span className="font-semibold" style={{color: 'var(--foreground)'}}>{filteredAlumni.length}</span> of{' '}
              <span className="font-semibold" style={{color: 'var(--foreground)'}}>{alumni.length}</span> alumni
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <label htmlFor="search" className="text-sm font-medium text-secondary whitespace-nowrap">
                Name:
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search alumni..."
                className="input flex-1"
                style={{padding: '0.625rem 1rem'}}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3">
              <label htmlFor="batch" className="text-sm font-medium text-secondary whitespace-nowrap">
                Batch:
              </label>
              <input
                type="number"
                id="batch"
                placeholder="Year"
                className="input flex-1"
                style={{padding: '0.625rem 1rem'}}
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-3">
              <label htmlFor="location" className="text-sm font-medium text-secondary whitespace-nowrap">
                Location:
              </label>
              <input
                type="text"
                id="location"
                placeholder="City/State"
                className="input flex-1"
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
            >

              {/* Profile Photo Section */}
              <div className="text-center" style={{marginBottom: '1.25rem'}}>
                {person.photo_url ? (
                  <div style={{position: 'relative', display: 'inline-block'}}>
                    <img
                      src={person.photo_url}
                      alt={person.full_name}
                      className="rounded-full mx-auto object-cover"
                      style={{
                        width: '96px',
                        height: '96px',
                        minWidth: '96px',
                        minHeight: '96px',
                        maxWidth: '96px',
                        maxHeight: '96px',
                        border: '4px solid white',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px var(--border-light)'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      bottom: '4px',
                      right: '4px',
                      width: '16px',
                      height: '16px',
                      background: 'var(--success)',
                      borderRadius: '50%',
                      border: '3px solid white',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }} />
                  </div>
                ) : (
                  <div style={{position: 'relative', display: 'inline-block'}}>
                    <div className="rounded-full mx-auto flex items-center justify-center" style={{
                      width: '80px',
                      height: '80px',
                      minWidth: '80px',
                      minHeight: '80px',
                      maxWidth: '80px',
                      maxHeight: '80px',
                      background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--background-tertiary) 100%)',
                      border: '4px solid white',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px var(--border-light)'
                    }}>
                      <span className="text-2xl font-semibold" style={{
                        color: 'var(--primary)',
                        fontWeight: '600'
                      }}>
                        {person.full_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div style={{
                      position: 'absolute',
                      bottom: '4px',
                      right: '4px',
                      width: '16px',
                      height: '16px',
                      background: 'var(--success)',
                      borderRadius: '50%',
                      border: '3px solid white',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }} />
                  </div>
                )}
              </div>

              {/* Alumni Details */}
              <div className="text-center" style={{marginBottom: '0.75rem'}}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: 'var(--foreground)',
                  marginBottom: '0.375rem',
                  letterSpacing: '-0.025em',
                  lineHeight: '1.3'
                }}>
                  {person.full_name}
                </h3>
                
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  padding: '0.375rem 0.875rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8125rem',
                  fontWeight: '500',
                  marginBottom: '1rem'
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '0.5rem'}}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  Class of {person.batch_end}
                </div>
              </div>
              
              {/* Details Section - Always show with placeholder text */}
              <div style={{marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem'}}>
                {/* Current Role - Always show */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    backgroundColor: 'var(--background-tertiary)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '0.5rem',
                    flexShrink: 0
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-secondary)" strokeWidth="2">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                      <line x1="8" y1="21" x2="16" y2="21"/>
                      <line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                  </div>
                  <div style={{flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: 'var(--foreground-tertiary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      whiteSpace: 'nowrap'
                    }}>
                      Role:
                    </span>
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: person.current_job && person.current_job.trim() ? 'var(--foreground)' : 'var(--foreground-tertiary)',
                      lineHeight: '1.4',
                      fontStyle: person.current_job && person.current_job.trim() ? 'normal' : 'italic'
                    }}>
                      {person.current_job && person.current_job.trim() ? person.current_job : 'Not filled yet'}
                    </span>
                  </div>
                </div>
                
                {/* Location - Always show */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: 'var(--background-tertiary)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '0.75rem'
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-secondary)" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: (person.city && person.city.trim()) || (person.state && person.state.trim()) ? 'var(--foreground-secondary)' : 'var(--foreground-tertiary)',
                    fontStyle: (person.city && person.city.trim()) || (person.state && person.state.trim()) ? 'normal' : 'italic'
                  }}>
                    {(person.city && person.city.trim()) || (person.state && person.state.trim()) 
                      ? [person.city, person.state].filter(item => item && item.trim()).join(', ')
                      : 'Not filled yet'}
                  </div>
                </div>
              </div>

              {/* View Profile Button */}
              <div style={{textAlign: 'center'}}>
                <Link
                  href={`/profile/${person.user_id}`}
                  className="view-profile-btn"
                >
                  View Profile
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginLeft: '0.375rem'}}>
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
      
      {/* Install Prompt */}
      <InstallPrompt />
      
      {/* Footer */}
      <Footer />
    </div>
  )
}