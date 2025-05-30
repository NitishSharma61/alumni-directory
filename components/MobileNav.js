'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { isAdminEmail } from '@/lib/constants'

export default function MobileNav({ user }) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const isAdmin = user ? isAdminEmail(user.email) : false

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="sm:hidden flex flex-col justify-center items-center"
        style={{padding: '0.5rem'}}
        aria-label="Toggle menu"
      >
        <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`} style={{backgroundColor: 'var(--foreground)'}}></span>
        <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${isOpen ? 'opacity-0' : 'opacity-100'}`} style={{backgroundColor: 'var(--foreground)'}}></span>
        <span className={`bg-current block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${isOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`} style={{backgroundColor: 'var(--foreground)'}}></span>
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div className={`fixed top-0 right-0 h-full w-64 max-w-[85vw] bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50 sm:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 sm:p-6">
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* User Info Section */}
          <div className="mb-6 text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-2 overflow-hidden" 
                 style={{background: user?.user_metadata?.avatar_url ? 'transparent' : 'var(--primary)', color: 'white'}}>
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-semibold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <p className="text-sm font-medium" style={{color: 'var(--foreground)'}}>
              {user?.email}
            </p>
          </div>

          {/* Menu Content */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '1.375rem'}}>
            <Link
              href="/dashboard"
              className="block py-4 px-5 rounded-lg transition-colors"
              style={{backgroundColor: 'var(--background-tertiary)', color: 'var(--foreground)'}}
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </div>
            </Link>

            <Link
              href="/profile/edit"
              className="block py-4 px-5 rounded-lg transition-colors"
              style={{backgroundColor: 'var(--background-tertiary)', color: 'var(--foreground)'}}
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </div>
            </Link>

            {user && (
              <Link
                href={`/profile/${user.id}`}
                className="block py-4 px-5 rounded-lg transition-colors"
                style={{backgroundColor: 'var(--background-tertiary)', color: 'var(--foreground)'}}
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </div>
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                className="block py-4 px-5 rounded-lg transition-colors"
                style={{backgroundColor: 'var(--primary-light)', color: 'var(--primary)'}}
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  Admin Dashboard
                </div>
              </Link>
            )}

            <button
              onClick={() => {
                handleLogout()
                setIsOpen(false)
              }}
              className="w-full text-left py-4 px-5 rounded-lg transition-colors"
              style={{backgroundColor: 'rgba(255, 59, 48, 0.1)', color: 'var(--error)'}}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}