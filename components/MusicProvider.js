'use client'

import { createContext, useContext, useState, useEffect, useRef } from 'react'

const MusicContext = createContext()

export function useMusicContext() {
  const context = useContext(MusicContext)
  if (!context) {
    throw new Error('useMusicContext must be used within MusicProvider')
  }
  return context
}

export function MusicProvider({ children }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    // Create audio element
    const audio = new Audio('/music/background.mp3')
    audio.loop = true
    audio.volume = 0.3
    audioRef.current = audio

    // Set up event listeners
    audio.addEventListener('play', () => setIsPlaying(true))
    audio.addEventListener('pause', () => setIsPlaying(false))
    audio.addEventListener('loadeddata', () => setIsLoaded(true))

    // Check if music should be playing from localStorage
    const musicEnabled = localStorage.getItem('alumniMusicEnabled')
    if (musicEnabled === 'true') {
      // Don't autoplay immediately, wait for user interaction
      setIsPlaying(false)
    }

    return () => {
      audio.pause()
      audio.removeEventListener('play', () => setIsPlaying(true))
      audio.removeEventListener('pause', () => setIsPlaying(false))
      audio.removeEventListener('loadeddata', () => setIsLoaded(true))
    }
  }, [])

  const playMusic = async () => {
    if (!audioRef.current || !isLoaded) return
    
    try {
      await audioRef.current.play()
      localStorage.setItem('alumniMusicEnabled', 'true')
      setIsPlaying(true)
    } catch (err) {
      console.error('Failed to play audio:', err)
    }
  }

  const pauseMusic = () => {
    if (!audioRef.current) return
    
    audioRef.current.pause()
    localStorage.setItem('alumniMusicEnabled', 'false')
    setIsPlaying(false)
  }

  const toggleMusic = async () => {
    if (isPlaying) {
      pauseMusic()
    } else {
      await playMusic()
    }
  }

  return (
    <MusicContext.Provider value={{ isPlaying, playMusic, pauseMusic, toggleMusic, isLoaded }}>
      {children}
    </MusicContext.Provider>
  )
}