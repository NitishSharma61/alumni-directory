'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { isAdminEmail } from '@/lib/constants'
import Link from 'next/link'
import Header from '@/components/Header'

// Disable static generation for this page
export const dynamic = 'force-dynamic'

export default function AdminPage() {
  const [user, setUser] = useState(null)
  const [pendingUsers, setPendingUsers] = useState([])
  const [approvedUsers, setApprovedUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState(null)
  const router = useRouter()

  useEffect(() => {
    checkAdminAccess()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const checkAdminAccess = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.error('Auth error or no user:', authError)
        router.push('/login')
        return
      }

      // Check if user is admin
      if (!isAdminEmail(user.email)) {
        router.push('/dashboard')
        return
      }

      setUser(user)
      fetchUsers()
    } catch (error) {
      console.error('Error checking admin access:', error)
      router.push('/login')
    }
  }

  const fetchUsers = async () => {
    try {
      // Fetch pending users
      const { data: pending, error: pendingError } = await supabase
        .from('alumni_profiles')
        .select('*')
        .eq('is_approved', false)
        .order('created_at', { ascending: false })

      if (pendingError) throw pendingError
      setPendingUsers(pending || [])

      // Fetch ALL approved users
      const { data: approved, error: approvedError } = await supabase
        .from('alumni_profiles')
        .select('*')
        .eq('is_approved', true)
        .order('approved_at', { ascending: false })

      if (approvedError) throw approvedError
      setApprovedUsers(approved || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (alumniId) => {
    setProcessingId(alumniId)
    try {
      // Get the current session token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        console.error('Session error:', sessionError)
        throw new Error('No active session')
      }
      
      // Call the API route
      const response = await fetch('/api/admin/approve-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          alumniId: alumniId,
          adminEmail: user.email 
        })
      })
      
      const result = await response.json()
      console.log('Approve response:', response.status, result)
      
      if (!response.ok) {
        console.error('Response not OK:', response.status, response.statusText, result)
        throw new Error(result.error || 'Failed to approve user')
      }
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to approve user')
      }
      
      // Refresh the lists
      await fetchUsers()
    } catch (error) {
      console.error('Error approving user:', error)
      alert(`Failed to approve user: ${error.message || 'Unknown error'}`)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (alumniId) => {
    if (!confirm('Are you sure you want to reject this user?')) return
    
    setProcessingId(alumniId)
    try {
      // Get the current session token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        console.error('Session error:', sessionError)
        throw new Error('No active session')
      }
      
      // Call the API route
      const response = await fetch('/api/admin/reject-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          alumniId: alumniId,
          adminEmail: user.email 
        })
      })
      
      const result = await response.json()
      console.log('Reject response:', response.status, result)
      
      if (!response.ok) {
        console.error('Response not OK:', response.status, response.statusText, result)
        throw new Error(result.error || 'Failed to reject user')
      }
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to reject user')
      }
      
      // Refresh the lists
      await fetchUsers()
    } catch (error) {
      console.error('Error rejecting user:', error)
      alert(`Failed to reject user: ${error.message || 'Unknown error'}`)
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fadeIn">
          <div className="loading-lg mx-auto mb-4"></div>
          <p className="text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{background: 'var(--background-secondary)'}}>
      <Header />
      
      {/* Admin Header - Minimal style matching the theme */}
      <div style={{background: 'white', borderBottom: '1px solid var(--border-light)', padding: '1.5rem'}}>
        <div className="modern-container">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{color: 'var(--foreground)', letterSpacing: '-0.02em'}}>Admin Dashboard</h1>
              <p className="mt-1 text-sm" style={{color: 'var(--foreground-secondary)'}}>Manage user approvals and view alumni status</p>
            </div>
            <Link href="/dashboard" className="btn-secondary text-sm">
              ← Back to Directory
            </Link>
          </div>
        </div>
      </div>

      <div className="modern-container" style={{paddingTop: '2rem', paddingBottom: '2rem'}}>
        {/* Stats Overview - Clean cards with shadows */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="text-center p-8" style={{
            background: 'white', 
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: 'none',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}>
            <h3 className="text-sm font-semibold mb-3" style={{color: 'var(--foreground-secondary)', letterSpacing: '0.05em'}}>TOTAL ALUMNI</h3>
            <p className="text-4xl font-bold" style={{color: 'var(--primary)', letterSpacing: '-0.02em'}}>{pendingUsers.length + approvedUsers.length}</p>
          </div>
          <div className="text-center p-8" style={{
            background: 'white', 
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: 'none',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}>
            <h3 className="text-sm font-semibold mb-3" style={{color: 'var(--foreground-secondary)', letterSpacing: '0.05em'}}>PENDING APPROVAL</h3>
            <p className="text-4xl font-bold" style={{color: '#f59e0b', letterSpacing: '-0.02em'}}>{pendingUsers.length}</p>
          </div>
          <div className="text-center p-8" style={{
            background: 'white', 
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: 'none',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}>
            <h3 className="text-sm font-semibold mb-3" style={{color: 'var(--foreground-secondary)', letterSpacing: '0.05em'}}>APPROVED</h3>
            <p className="text-4xl font-bold" style={{color: '#10b981', letterSpacing: '-0.02em'}}>{approvedUsers.length}</p>
          </div>
        </div>

        {/* Pending Approvals */}
        <div style={{marginBottom: '3rem'}}>
          <h2 className="text-2xl font-semibold mb-4" style={{color: 'var(--foreground)'}}>
            Pending Approvals ({pendingUsers.length})
          </h2>
          
          {pendingUsers.length === 0 ? (
            <div className="text-center p-12" style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              border: 'none'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981, #34d399)',
                margin: '0 auto 1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{color: 'var(--foreground)'}}>All caught up!</h3>
              <p style={{color: 'var(--foreground-secondary)', fontSize: '0.95rem'}}>No pending approvals at the moment</p>
            </div>
          ) : (
            <div className="overflow-x-auto" style={{background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)'}}>
              <table style={{width: '100%', borderCollapse: 'collapse', minWidth: '700px'}}>
                <thead>
                  <tr style={{borderBottom: '1px solid var(--border-light)'}}>
                    <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: 'var(--foreground-tertiary)', textTransform: 'uppercase'}}>Alumni</th>
                    <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: 'var(--foreground-tertiary)', textTransform: 'uppercase'}}>Email</th>
                    <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: 'var(--foreground-tertiary)', textTransform: 'uppercase'}}>Mobile</th>
                    <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: 'var(--foreground-tertiary)', textTransform: 'uppercase'}}>Batch</th>
                    <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: 'var(--foreground-tertiary)', textTransform: 'uppercase'}}>Applied</th>
                    <th style={{padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: 'var(--foreground-tertiary)', textTransform: 'uppercase'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map((alumni, index) => (
                    <tr key={alumni.id} style={{borderBottom: index < pendingUsers.length - 1 ? '1px solid var(--border-light)' : 'none'}}>
                      <td style={{padding: '1rem'}}>
                        <div className="flex items-center gap-3">
                          <div className="rounded-full flex items-center justify-center overflow-hidden" style={{
                            width: '36px',
                            height: '36px',
                            minWidth: '36px',
                            minHeight: '36px',
                            background: alumni.photo_url ? 'transparent' : 'var(--background-tertiary)',
                            color: 'var(--foreground-secondary)',
                            flexShrink: 0
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
                              <span className="text-sm font-medium">{alumni.full_name.charAt(0)}</span>
                            )}
                          </div>
                          <span className="font-medium" style={{color: 'var(--foreground)'}}>{alumni.full_name}</span>
                        </div>
                      </td>
                      <td style={{padding: '1rem', color: 'var(--foreground-secondary)', fontSize: '0.875rem'}}>{alumni.email}</td>
                      <td style={{padding: '1rem', color: 'var(--foreground-secondary)', fontSize: '0.875rem'}}>
                        {alumni.phone ? (
                          <a
                            href={`https://wa.me/${alumni.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: '#25d366',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                            title="Open WhatsApp"
                          >
                            {alumni.phone}
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.892 3.485"/>
                            </svg>
                          </a>
                        ) : (
                          <span style={{color: 'var(--foreground-tertiary)', fontStyle: 'italic'}}>Not provided</span>
                        )}
                      </td>
                      <td style={{padding: '1rem', color: 'var(--foreground-secondary)', fontSize: '0.875rem'}}>{alumni.batch_start}-{alumni.batch_end}</td>
                      <td style={{padding: '1rem', color: 'var(--foreground-tertiary)', fontSize: '0.875rem'}}>{new Date(alumni.created_at).toLocaleDateString()}</td>
                      <td style={{padding: '1rem'}}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleApprove(alumni.id)}
                            disabled={processingId === alumni.id}
                            className="btn-primary"
                            style={{padding: '0.375rem 0.75rem', fontSize: '0.875rem'}}
                          >
                            {processingId === alumni.id ? (
                              <div className="loading" style={{width: '1rem', height: '1rem'}}></div>
                            ) : (
                              'Approve'
                            )}
                          </button>
                          <button
                            onClick={() => handleReject(alumni.id)}
                            disabled={processingId === alumni.id}
                            style={{
                              padding: '0.375rem 0.75rem',
                              fontSize: '0.875rem',
                              background: 'transparent',
                              color: 'var(--error)',
                              border: '1px solid var(--error)',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = 'rgba(255, 59, 48, 0.1)'
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'transparent'
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* All Approved Alumni */}
        <div>
          <h2 className="text-2xl font-semibold mb-4" style={{color: 'var(--foreground)'}}>
            All Approved Alumni ({approvedUsers.length})
          </h2>
          
          {approvedUsers.length === 0 ? (
            <div className="text-center p-8" style={{
              background: 'white',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)'
            }}>
              <p style={{color: 'var(--foreground-secondary)'}}>No approved alumni yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto" style={{background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)'}}>
              <table style={{width: '100%', borderCollapse: 'collapse', minWidth: '800px'}}>
                <thead>
                  <tr style={{borderBottom: '1px solid var(--border-light)', background: 'var(--background-tertiary)'}}>
                    <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: 'var(--foreground-tertiary)', textTransform: 'uppercase'}}>Alumni</th>
                    <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: 'var(--foreground-tertiary)', textTransform: 'uppercase'}}>Email</th>
                    <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: 'var(--foreground-tertiary)', textTransform: 'uppercase'}}>Mobile</th>
                    <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: 'var(--foreground-tertiary)', textTransform: 'uppercase'}}>Batch</th>
                    <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: 'var(--foreground-tertiary)', textTransform: 'uppercase'}}>Location</th>
                    <th style={{padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: 'var(--foreground-tertiary)', textTransform: 'uppercase'}}>Approved</th>
                    <th style={{padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', color: 'var(--foreground-tertiary)', textTransform: 'uppercase'}}>Profile</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedUsers.map((alumni, index) => (
                    <tr key={alumni.id} style={{borderBottom: index < approvedUsers.length - 1 ? '1px solid var(--border-light)' : 'none'}}>
                      <td style={{padding: '1rem'}}>
                        <div className="flex items-center gap-3">
                          <div className="rounded-full flex items-center justify-center overflow-hidden" style={{
                            width: '36px',
                            height: '36px',
                            minWidth: '36px',
                            minHeight: '36px',
                            background: alumni.photo_url ? 'transparent' : 'var(--background-tertiary)',
                            color: 'var(--foreground-secondary)',
                            flexShrink: 0
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
                              <span className="text-sm font-medium">{alumni.full_name.charAt(0)}</span>
                            )}
                          </div>
                          <span className="font-medium" style={{color: 'var(--foreground)'}}>{alumni.full_name}</span>
                        </div>
                      </td>
                      <td style={{padding: '1rem', color: 'var(--foreground-secondary)', fontSize: '0.875rem'}}>{alumni.email}</td>
                      <td style={{padding: '1rem', color: 'var(--foreground-secondary)', fontSize: '0.875rem'}}>
                        {alumni.phone ? (
                          <a
                            href={`https://wa.me/${alumni.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: '#25d366',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                            title="Open WhatsApp"
                          >
                            {alumni.phone}
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.892 3.485"/>
                            </svg>
                          </a>
                        ) : (
                          <span style={{color: 'var(--foreground-tertiary)', fontStyle: 'italic'}}>Not provided</span>
                        )}
                      </td>
                      <td style={{padding: '1rem', color: 'var(--foreground-secondary)', fontSize: '0.875rem'}}>{alumni.batch_start}-{alumni.batch_end}</td>
                      <td style={{padding: '1rem', color: 'var(--foreground-secondary)', fontSize: '0.875rem'}}>
                        {alumni.city || alumni.state ? `${alumni.city || ''} ${alumni.state || ''}`.trim() : 'Not specified'}
                      </td>
                      <td style={{padding: '1rem', color: 'var(--foreground-tertiary)', fontSize: '0.875rem'}}>
                        {alumni.approved_at ? new Date(alumni.approved_at).toLocaleDateString() : 'Auto-approved'}
                      </td>
                      <td style={{padding: '1rem', textAlign: 'center'}}>
                        <Link 
                          href={`/profile/${alumni.user_id}`} 
                          className="inline-flex items-center gap-1" 
                          style={{color: 'var(--primary)', fontSize: '0.875rem', textDecoration: 'none'}}
                        >
                          View
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}