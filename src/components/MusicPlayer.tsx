import { useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'scorekeeper-music-on';
const VOLUME = 0.15;
const SRC = '/audio/scorekeeper-ambient.mp3';

const MusicPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isOn, setIsOn] = useState(false);

  useEffect(() => {
    const audio = new Audio(SRC);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = VOLUME;
    audioRef.current = audio;

    // Try resuming previous preference
    if (localStorage.getItem(STORAGE_KEY) === '1') {
      audio.play().then(() => setIsOn(true)).catch(() => setIsOn(false));
    }

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isOn) {
      audio.pause();
      setIsOn(false);
      localStorage.setItem(STORAGE_KEY, '0');
    } else {
      audio.play()
        .then(() => {
          setIsOn(true);
          localStorage.setItem(STORAGE_KEY, '1');
        })
        .catch(() => setIsOn(false));
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isOn}
      aria-label="Toggle background music"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center h-11 w-11 rounded-full bg-background/70 backdrop-blur border border-primary/40 text-primary shadow-lg hover:bg-background/90 hover:border-primary transition-colors"
    >
      {isOn ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="22" y1="9" x2="16" y2="15" />
          <line x1="16" y1="9" x2="22" y2="15" />
        </svg>
      )}
    </button>
  );
};

export default MusicPlayer;
