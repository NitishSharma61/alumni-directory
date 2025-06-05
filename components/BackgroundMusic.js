'use client'

import { useState, useEffect, useRef } from 'react'

export default function BackgroundMusic({ autoPlay = false }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)
  const [hasInteracted, setHasInteracted] = useState(false)

  useEffect(() => {
    // Listen for any user interaction to enable audio context
    const handleInteraction = () => {
      setHasInteracted(true)
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
    }

    document.addEventListener('click', handleInteraction)
    document.addEventListener('touchstart', handleInteraction)

    return () => {
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3 // Default 30% volume
    }
  }, [])

  const toggleMusic = async () => {
    if (!hasInteracted) return

    if (isPlaying) {
      audioRef.current?.pause()
      setIsPlaying(false)
    } else {
      try {
        await audioRef.current?.play()
        setIsPlaying(true)
      } catch (err) {
        console.error('Failed to play audio:', err)
      }
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        loop
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        style={{ display: 'none' }}
      >
        <source src="/music/background.mp3" type="audio/mpeg" />
      </audio>

      <button
        onClick={toggleMusic}
        style={{
          background: 'transparent',
          border: 'none',
          padding: '0.5rem',
          cursor: hasInteracted ? 'pointer' : 'not-allowed',
          opacity: hasInteracted ? 1 : 0.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          transition: 'all 0.2s ease',
          marginRight: '0.5rem'
        }}
        onMouseEnter={(e) => {
          if (hasInteracted) {
            e.currentTarget.style.background = 'var(--background-secondary)'
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
        }}
        title={isPlaying ? 'Turn off music' : 'Turn on music'}
      >
        {isPlaying ? (
          // Speaker ON icon
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-secondary)" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        ) : (
          // Speaker OFF icon
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-tertiary)" strokeWidth="2">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        )}
      </button>
    </>
  )
}