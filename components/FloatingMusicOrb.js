'use client'

import { useState, useEffect, useRef } from 'react'

export default function FloatingMusicOrb() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    // Show tooltip after 3 seconds to attract attention
    const timer = setTimeout(() => {
      setShowTooltip(true)
      // Hide tooltip after 5 seconds
      setTimeout(() => setShowTooltip(false), 5000)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Check if user previously enabled music
    const musicPreference = localStorage.getItem('loginMusicEnabled')
    if (musicPreference === 'true' && audioRef.current) {
      // Try to autoplay if user previously enabled it
      audioRef.current.play().catch(() => {
        // Autoplay failed, user needs to interact
      })
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3 // 30% volume
    }
  }, [])


  const toggleMusic = async () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      localStorage.setItem('loginMusicEnabled', 'false')
    } else {
      try {
        await audioRef.current.play()
        setIsPlaying(true)
        localStorage.setItem('loginMusicEnabled', 'true')
      } catch (err) {
        console.error('Failed to play audio:', err)
      }
    }
  }

  return (
    <>
      {/* Audio Element */}
      <audio
        ref={audioRef}
        loop
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        style={{ display: 'none' }}
      >
        <source src="/music/background.mp3" type="audio/mpeg" />
      </audio>

      {/* Music Orb */}
      <div
        className="inline-block relative"
        style={{
          animation: 'floatBounce 3s ease-in-out infinite'
        }}
      >
        {/* Tooltip */}
        {(showTooltip || isHovered) && !isPlaying && (
          <div
            className="absolute bg-black/90 text-white text-xs rounded-lg"
            style={{
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginBottom: '8px',
              padding: '8px 12px',
              animation: 'fadeIn 0.3s ease',
              backdropFilter: 'blur(10px)',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              zIndex: 10
            }}
          >
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-black/90"></div>
            🎵 Play Navodaya National Anthem
          </div>
        )}

        {/* Orb Button */}
        <button
          onClick={toggleMusic}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative group"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: isPlaying 
              ? 'linear-gradient(135deg, #0066ff, #3b82f6)' 
              : 'linear-gradient(135deg, #0066ff, #60a5fa)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isPlaying
              ? '0 0 20px rgba(0, 102, 255, 0.6), 0 6px 15px rgba(0, 0, 0, 0.2)'
              : '0 6px 15px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s ease',
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            overflow: 'visible'
          }}
        >
          {/* Pulsating rings when playing */}
          {isPlaying && (
            <>
              <div className="absolute inset-0 rounded-full" style={{
                background: 'inherit',
                animation: 'pulse 2s ease-out infinite',
                opacity: 0.6
              }} />
              <div className="absolute inset-0 rounded-full" style={{
                background: 'inherit',
                animation: 'pulse 2s ease-out infinite 0.5s',
                opacity: 0.4
              }} />
              <div className="absolute inset-0 rounded-full" style={{
                background: 'inherit',
                animation: 'pulse 2s ease-out infinite 1s',
                opacity: 0.2
              }} />
            </>
          )}

          {/* Musical notes floating animation when playing */}
          {isPlaying && (
            <div className="absolute inset-0 pointer-events-none">
              <div style={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                animation: 'floatNote 3s ease-out infinite'
              }}>♪</div>
              <div style={{
                position: 'absolute',
                bottom: '100%',
                left: '30%',
                transform: 'translateX(-50%)',
                animation: 'floatNote 3s ease-out infinite 1s'
              }}>♫</div>
              <div style={{
                position: 'absolute',
                bottom: '100%',
                left: '70%',
                transform: 'translateX(-50%)',
                animation: 'floatNote 3s ease-out infinite 2s'
              }}>♪</div>
            </div>
          )}

          {/* Icon */}
          <div className="relative z-10">
            {isPlaying ? (
              // Pause icon
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              // Play icon
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        </button>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes floatBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        @keyframes floatNote {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(0);
          }
          20% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-60px);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  )
}