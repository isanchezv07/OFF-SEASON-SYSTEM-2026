import { useRef, useEffect } from 'react';

/**
 * Custom hook for managing audio playback
 * @param src - Path to the audio file
 * @param volume - Volume level (0 to 1)
 * @returns Object with play function and audio element ref
 */
export function useAudio(src: string, volume: number = 1) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Create audio element if it doesn't exist
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.volume = volume;
    }
    
    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [src, volume]);
  
  const play = () => {
    if (audioRef.current) {
      // Reset to beginning if already playing
      audioRef.current.currentTime = 0;
      // Play the audio
      audioRef.current.play().catch(err => {
        console.warn('Audio play failed:', err);
      });
    }
  };
  
  return { play, audioRef };
}