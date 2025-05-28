'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function PhotoUpload({ currentPhotoUrl, userId, onPhotoUploaded }) {
  // State to manage the upload process and preview
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(currentPhotoUrl)
  const [error, setError] = useState(null)

  // Handle file selection and upload
  const handleFileSelect = async (event) => {
    try {
      setError(null)
      
      // Get the selected file
      const file = event.target.files?.[0]
      if (!file) return

      // Validate file type - we only want images
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)')
        return
      }

      // Validate file size - let's limit to 5MB for reasonable loading times
      const maxSize = 5 * 1024 * 1024 // 5MB in bytes
      if (file.size > maxSize) {
        setError('Image size should be less than 5MB')
        return
      }

      // Create a preview URL for immediate feedback
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)

      setUploading(true)

      // Generate a unique filename using timestamp and user ID
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('alumni-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      // Get the public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('alumni-photos')
        .getPublicUrl(filePath)

      // Update the user's profile with the new photo URL
      const { error: updateError } = await supabase
        .from('alumni_profiles')
        .update({ 
          photo_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (updateError) {
        throw updateError
      }

      // Notify parent component of successful upload
      if (onPhotoUploaded) {
        onPhotoUploaded(publicUrl)
      }

      // Clean up the preview URL
      URL.revokeObjectURL(objectUrl)
      
    } catch (error) {
      console.error('Error uploading photo:', error)
      setError('Failed to upload photo. Please try again.')
      setPreviewUrl(currentPhotoUrl) // Revert to original on error
    } finally {
      setUploading(false)
    }
  }

  // Handle removing the current photo
  const handleRemovePhoto = async () => {
    try {
      setUploading(true)
      setError(null)

      // Update profile to remove photo URL
      const { error: updateError } = await supabase
        .from('alumni_profiles')
        .update({ 
          photo_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (updateError) {
        throw updateError
      }

      setPreviewUrl(null)
      
      // Notify parent component
      if (onPhotoUploaded) {
        onPhotoUploaded(null)
      }

    } catch (error) {
      console.error('Error removing photo:', error)
      setError('Failed to remove photo. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Photo preview and upload area */}
      <div className="flex items-center space-x-6">
        {/* Current photo or placeholder */}
        <div className="relative">
          <div className="rounded-full overflow-hidden flex items-center justify-center" style={{width: '120px', height: '120px', background: 'var(--background-tertiary)', border: '3px solid var(--border-light)'}}>
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className="w-14 h-14" style={{color: 'var(--foreground-light)'}} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          
          {/* Loading overlay */}
          {uploading && (
            <div className="absolute inset-0 rounded-full flex items-center justify-center" style={{background: 'rgba(255, 255, 255, 0.9)'}}>
              <div className="loading"></div>
            </div>
          )}
        </div>

        {/* Upload controls */}
        <div className="space-y-2">
          <label className="block">
            <span className="sr-only">Choose profile photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={uploading}
              className="block w-full text-sm cursor-pointer
                file:mr-4 file:py-2.5 file:px-5
                file:rounded-full file:border-0
                file:text-sm file:font-medium
                file:cursor-pointer
                file:transition-all file:duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                file:bg-blue-50 file:text-blue-600 file:hover:bg-blue-100"
              style={{
                color: 'var(--foreground-secondary)'
              }}
            />
          </label>
          
          {previewUrl && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              disabled={uploading}
              className="text-sm disabled:opacity-50 transition-colors font-medium"
              style={{color: 'var(--error)'}}
            >
              Remove photo
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm" style={{color: 'var(--error)', marginTop: '0.5rem'}}>{error}</p>
      )}

      {/* Help text */}
      <p className="text-sm" style={{color: 'var(--foreground-tertiary)', marginTop: '0.5rem'}}>
        Recommended: Square image, at least 200x200px, less than 5MB
      </p>
    </div>
  )
}