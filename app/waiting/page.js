'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import PhotoUpload from '@/components/PhotoUpload'

export default function WaitingPage() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const router = useRouter()

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    bio: ''
  })

  useEffect(() => {
    checkUserAndProfile()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const checkUserAndProfile = async () => {
    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Check if user is in alumni_profiles (approved)
      const { data: approvedProfile } = await supabase
        .from('alumni_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (approvedProfile) {
        // User is approved, redirect to dashboard
        router.push('/dashboard')
        return
      }

      // Fetch pending profile
      const { data: pendingProfile, error: profileError } = await supabase
        .from('pending_approval')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileError || !pendingProfile) {
        console.error('No pending profile found:', profileError)
        router.push('/signup')
        return
      }

      setProfile(pendingProfile)
      setFormData({
        fullName: pendingProfile.full_name || '',
        phone: pendingProfile.phone || '',
        bio: pendingProfile.bio || ''
      })
    } catch (error) {
      console.error('Error checking user:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('pending_approval')
        .update({
          full_name: formData.fullName.trim(),
          phone: formData.phone.trim(),
          bio: formData.bio.trim()
        })
        .eq('user_id', user.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Profile updated successfully!' })

      // Refresh profile data
      await checkUserAndProfile()
    } catch (error) {
      console.error('Error saving profile:', error)
      setMessage({ type: 'error', text: 'Failed to save profile. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'var(--background-secondary)'}}>
        <div className="text-center animate-fadeIn">
          <div className="loading-lg mx-auto mb-4"></div>
          <p className="text-lg" style={{color: 'var(--foreground)'}}>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{background: 'var(--background-secondary)'}}>
      {/* Simple Header */}
      <div style={{background: 'white', borderBottom: '1px solid var(--border-light)', padding: '1rem'}}>
        <div className="modern-container flex items-center justify-between">
          <h1 className="text-xl font-bold" style={{color: 'var(--foreground)'}}>JNV Pandoh Alumni Network</h1>
          <button
            onClick={handleLogout}
            className="btn-secondary text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="modern-container" style={{paddingTop: '3rem', paddingBottom: '3rem'}}>
        {/* Message - Shows above grid on all screens */}
        {message && (
          <div className="mb-6 animate-fadeIn" style={{
            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`,
            borderRadius: 'var(--radius-sm)',
            padding: '1rem',
            maxWidth: '1200px',
            margin: '0 auto 2rem auto'
          }}>
            <p style={{color: message.type === 'success' ? '#10b981' : '#ef4444', textAlign: 'center'}}>
              {message.text}
            </p>
          </div>
        )}

        {/* Responsive Grid Container */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '2rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}
        className="waiting-grid">
          {/* LEFT: Waiting Message Box */}
          <div style={{
            background: 'linear-gradient(135deg, #fff5e6, #ffe6cc)',
            border: '2px solid #ff9500',
            borderRadius: 'var(--radius-lg)',
            padding: '2.5rem',
            textAlign: 'center',
            height: 'fit-content'
          }}>
            <div className="mx-auto mb-4" style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#ff9500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem'
            }}>
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h2 className="text-3xl font-bold mb-3" style={{color: '#b36800'}}>
              Waiting for Approval
            </h2>
            <p className="text-lg mb-2" style={{color: '#805500'}}>
              Thank you for signing up!
            </p>
            <p style={{color: '#805500', fontSize: '1rem'}}>
              We've received your application and will review it within 24 hours.
              You'll receive an email once your account is approved.
            </p>
          </div>

          {/* RIGHT: Profile Edit Form */}
          <div style={{background: 'white', borderRadius: 'var(--radius-lg)', padding: '2rem'}}>
            <h3 className="text-2xl font-bold mb-6" style={{color: 'var(--foreground)'}}>
              Complete Your Profile
            </h3>
            <p className="mb-6" style={{color: 'var(--foreground-secondary)'}}>
              While you wait, you can complete your profile details below.
            </p>

            <div className="space-y-6">
              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--foreground-secondary)'}}>
                  Profile Photo
                </label>
                <PhotoUpload
                  userId={user?.id}
                  currentPhotoUrl={profile?.photo_url}
                  onPhotoChange={checkUserAndProfile}
                  tableName="pending_approval"
                />
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium mb-2" style={{color: 'var(--foreground-secondary)'}}>
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  className="input w-full"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--foreground-secondary)'}}>
                  Email
                </label>
                <input
                  type="email"
                  className="input w-full"
                  value={profile?.email || ''}
                  disabled
                  style={{background: 'var(--background-tertiary)', cursor: 'not-allowed'}}
                />
                <p className="text-xs mt-1" style={{color: 'var(--foreground-tertiary)'}}>Email cannot be changed</p>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2" style={{color: 'var(--foreground-secondary)'}}>
                  Mobile Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="input w-full"
                  placeholder="e.g., +91 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              {/* Roll Number (Read-only) */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--foreground-secondary)'}}>
                  Roll Number
                </label>
                <input
                  type="text"
                  className="input w-full"
                  value={profile?.roll_no || ''}
                  disabled
                  style={{background: 'var(--background-tertiary)', cursor: 'not-allowed'}}
                />
              </div>

              {/* Batch (Read-only) */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--foreground-secondary)'}}>
                  Batch
                </label>
                <input
                  type="text"
                  className="input w-full"
                  value={profile ? `${profile.batch_start} - ${profile.batch_end}` : ''}
                  disabled
                  style={{background: 'var(--background-tertiary)', cursor: 'not-allowed'}}
                />
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium mb-2" style={{color: 'var(--foreground-secondary)'}}>
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  className="input w-full"
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={handleChange}
                  style={{minHeight: '100px'}}
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="flex items-center justify-center">
                    <div className="loading mr-3"></div>
                    Saving...
                  </div>
                ) : (
                  'Save Profile'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
