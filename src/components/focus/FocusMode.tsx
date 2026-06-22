const startFocusMusic = useCallback(() => {
  if (mode !== 'focus') return

  // Fixed variable name case mismatch here:
  const randomTrack = focusTracks[Math.floor(Math.random() * focusTracks.length)]

  if (audioRef.current) {
    audioRef.current.pause()
  }

  const audio = new Audio(randomTrack)
  audio.loop = true
  audio.volume = 0.25
  audio.muted = muted

  audio.play().catch(() => {})
  audioRef.current = audio
}, [mode, muted])