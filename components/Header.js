'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { isAdminEmail } from '@/lib/constants'
import MobileNav from './MobileNav'

export default function Header() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        setIsAdmin(isAdminEmail(user.email))
        
        // Fetch user profile for name and photo
        const { data: profileData } = await supabase
          .from('alumni_profiles')
          .select('full_name, photo_url')
          .eq('user_id', user.id)
          .single()
        
        if (profileData) {
          setProfile(profileData)
        }
      }
    } catch (error) {
      console.error('Error checking user:', error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Get page title based on current route
  const getPageTitle = () => {
    if (pathname === '/dashboard') return null // Show full branding on dashboard
    if (pathname === '/profile/edit') return 'Edit Profile'
    if (pathname.startsWith('/profile/')) return 'Profile'
    if (pathname === '/terms') return 'Terms & Conditions'
    if (pathname === '/privacy') return 'Privacy Policy'
    if (pathname === '/contact') return 'Contact'
    return null
  }

  const pageTitle = getPageTitle()

  return (
    <header className="modern-header">
      <div className="modern-container" style={{paddingTop: '0.5rem', paddingBottom: '0.5rem'}}>
        <div className="flex justify-between items-center">
          {/* Left side - Logo and title */}
          <div className="flex items-center" style={{gap: '0.75rem'}}>
            <Link href="/dashboard" style={{display: 'flex', zIndex: 10, position: 'relative'}}>
              <Image 
                src="/logo alumni.png" 
                alt="Alumni Directory Logo" 
                width={100}
                height={60}
                style={{height: '60px', width: 'auto', cursor: 'pointer', pointerEvents: 'auto'}}
              />
            </Link>
            {pageTitle ? (
              <h1 className="text-lg md:text-xl lg:text-2xl font-semibold" style={{color: 'var(--foreground)', letterSpacing: '-0.01em'}}>
                {pageTitle}
              </h1>
            ) : (
              <div className="hidden sm:block min-w-0">
                <h1 className="text-lg md:text-xl lg:text-2xl font-semibold truncate" style={{color: 'var(--foreground)', letterSpacing: '-0.01em', lineHeight: '1.2'}}>
                  Alumni Directory
                </h1>
                <p className="text-xs md:text-sm truncate" style={{color: 'var(--foreground-secondary)', lineHeight: '1.2'}}>
                  JNV Pandoh Alumni Network
                </p>
              </div>
            )}
          </div>

          {/* Right side - Admin button and User menu */}
          <div className="flex items-center" style={{gap: '1rem'}}>
            {/* Admin Dashboard Button - Only show for admins */}
            {isAdmin && pathname !== '/admin' && (
              <Link 
                href="/admin" 
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 btn-secondary"
                style={{
                  background: 'transparent',
                  color: 'var(--primary)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  border: '2px solid var(--primary)',
                  textDecoration: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--primary)'
                  e.currentTarget.style.color = 'white'
                  e.currentTarget.style.borderColor = 'var(--primary)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--primary)'
                  e.currentTarget.style.borderColor = 'var(--primary)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Admin Dashboard
              </Link>
            )}

            {/* User menu */}
            {user && (
              <>
                {/* Desktop and Tablet user dropdown */}
                <div 
                  className="hidden sm:block relative" 
                  ref={dropdownRef}
                >
                {/* Profile Button */}
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="p-1 rounded-full hover:ring-2 hover:ring-offset-2 hover:ring-primary transition-all cursor-pointer"
                  aria-label="User profile"
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden shadow-sm"
                    style={{
                      background: profile?.photo_url ? 'transparent' : 'var(--primary)',
                      color: 'white',
                      fontSize: '1.125rem',
                      fontWeight: 600
                    }}
                  >
                    {profile?.photo_url ? (
                      <img 
                        src={profile.photo_url} 
                        alt={profile.full_name || 'Profile'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      profile?.full_name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                </button>

                {/* Dropdown menu - positioned directly below profile */}
                <div 
                  className={`absolute right-0 top-full bg-white overflow-hidden transition-all duration-200 ease-out z-50 ${
                    dropdownOpen ? 'opacity-100 transform translate-y-0 scale-100' : 'opacity-0 transform -translate-y-2 scale-95 pointer-events-none'
                  }`}
                  style={{
                    boxShadow: dropdownOpen ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : 'none',
                    border: '2px solid rgba(0, 0, 0, 0.1)',
                    marginTop: '12px',
                    borderRadius: 'var(--radius)',
                    padding: '0.5rem 0',
                    minWidth: '240px',
                    width: 'auto'
                  }}
                >
                  {/* Edit Profile */}
                  <Link
                    href="/profile/edit"
                    className="flex items-center hover:bg-slate-50 transition-colors duration-150"
                    style={{color: 'var(--foreground)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center'}}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <svg className="w-5 h-5" style={{color: 'var(--primary)', marginRight: '0.75rem'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span style={{fontSize: '0.95rem', fontWeight: '500'}}>Edit Profile</span>
                  </Link>

                  {/* Admin Dashboard - Only show for admins */}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center hover:bg-slate-50 transition-colors duration-150"
                      style={{color: 'var(--foreground)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center'}}
                      onClick={() => setDropdownOpen(false)}
                    >
                      <svg className="w-5 h-5" style={{color: 'var(--primary)', marginRight: '0.75rem'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                      <span style={{fontSize: '0.95rem', fontWeight: '500'}}>Admin Dashboard</span>
                    </Link>
                  )}

                  {/* Divider */}
                  <div className="border-t border-slate-100" style={{margin: '0.5rem 0'}}></div>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center hover:bg-red-50 transition-colors duration-150 text-red-600"
                    style={{padding: '1rem 1.5rem'}}
                  >
                    <svg className="w-5 h-5" style={{marginRight: '0.75rem'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span style={{fontSize: '0.95rem', fontWeight: '500'}}>Logout</span>
                  </button>
                </div>
                </div>

                {/* Mobile navigation */}
                <MobileNav user={user} />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}