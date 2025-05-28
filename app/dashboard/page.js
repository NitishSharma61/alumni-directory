'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import InstallPrompt from '@/components/InstallPrompt'

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
      <header className="modern-header">
        <div className="modern-container" style={{paddingTop: '2rem', paddingBottom: '2rem'}}>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold" style={{color: 'var(--foreground)', letterSpacing: '-0.02em'}}>Alumni Directory</h1>
              <p className="mt-2" style={{color: 'var(--foreground-secondary)', fontSize: '1.125rem'}}>Connect with your fellow alumni community</p>
            </div>
            <div className="flex items-center" style={{gap: '1rem'}}>
              <Link
                href="/profile/edit"
                className="btn-secondary"
              >
                Edit Profile
              </Link>
              <button
                onClick={handleLogout}
                className="btn-primary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <div className="modern-container" style={{paddingTop: '3rem', paddingBottom: '2rem'}}>
        <div className="modern-card modern-fade-in" style={{padding: '2.5rem', marginBottom: '3rem'}}>
          <h2 className="text-2xl font-semibold mb-8" style={{color: 'var(--foreground)', letterSpacing: '-0.01em'}}>Find Alumni</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-secondary mb-2">
                Search by Name
              </label>
              <input
                type="text"
                id="search"
                placeholder="Enter alumni name..."
                className="input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="batch" className="block text-sm font-medium text-secondary mb-2">
                Filter by Batch Year
              </label>
              <input
                type="number"
                id="batch"
                placeholder="e.g., 2020"
                className="input"
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-secondary mb-2">
                Filter by Location
              </label>
              <input
                type="text"
                id="location"
                placeholder="City or State"
                className="input"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between" style={{marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)'}}>
            <p style={{color: 'var(--foreground-secondary)', fontSize: '0.9375rem'}}>
              Showing <span className="font-semibold" style={{color: 'var(--foreground)'}}>{filteredAlumni.length}</span> of{' '}
              <span className="font-semibold" style={{color: 'var(--foreground)'}}>{alumni.length}</span> alumni
            </p>
            {(searchTerm || batchFilter || locationFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setBatchFilter('')
                  setLocationFilter('')
                }}
                style={{color: 'var(--primary)', fontSize: '0.9375rem', fontWeight: 500}}
                className="hover:underline transition-all duration-200"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Alumni Grid */}
      <div className="modern-container" style={{paddingBottom: '4rem'}}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{gap: '2rem'}}>
          {filteredAlumni.map((person) => (
            <div
              key={person.id}
              className="modern-card modern-hover-lift"
              style={{padding: '2rem', marginBottom: 0}}
            >
              {/* Profile Photo Section */}
              <div className="text-center" style={{marginBottom: '1.75rem'}}>
                {person.photo_url ? (
                  <img
                    src={person.photo_url}
                    alt={person.full_name}
                    className="w-28 h-28 rounded-full mx-auto object-cover"
                    style={{border: '3px solid var(--border-light)'}}
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full mx-auto flex items-center justify-center" style={{background: 'var(--background-tertiary)', border: '3px solid var(--border-light)'}}>
                    <span className="text-3xl font-semibold" style={{color: 'var(--primary)'}}>
                      {person.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Alumni Details */}
              <h3 className="text-xl font-semibold text-center" style={{marginBottom: '1.25rem', color: 'var(--foreground)', letterSpacing: '-0.01em'}}>
                {person.full_name}
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-center" style={{color: 'var(--foreground-secondary)'}}>
                  <svg className="w-4 h-4 mr-2" style={{color: 'var(--primary)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span style={{fontSize: '0.875rem'}}>
                    Batch: {person.batch_start} - {person.batch_end}
                  </span>
                </div>
                
                {person.current_job && (
                  <div className="flex items-center justify-center text-secondary">
                    <svg className="w-4 h-4 mr-2 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm truncate">
                      {person.current_job}
                    </span>
                  </div>
                )}
                
                {(person.city || person.state) && (
                  <div className="flex items-center justify-center text-secondary">
                    <svg className="w-4 h-4 mr-2 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm">
                      {person.city}{person.city && person.state && ', '}{person.state}
                    </span>
                  </div>
                )}
              </div>

              {/* View Profile Button */}
              <div style={{marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)'}}>
                <Link
                  href={`/profile/${person.user_id}`}
                  className="btn-accent w-full text-center block"
                >
                  View Profile
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
    </div>
  )
}