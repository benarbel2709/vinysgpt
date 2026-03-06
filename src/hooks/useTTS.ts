import { useState, useRef, useCallback } from "react";

/**
 * Pick the best available voice for the given language.
 * Prefers voices labelled "Natural" / "Premium" / "Enhanced".
 */
function pickVoice(voices: SpeechSynthesisVoice[], lang: string): SpeechSynthesisVoice | undefined {
  const candidates = voices.filter(v => v.lang.startsWith(lang));
  const natural = candidates.find(v => /natural/i.test(v.name));
  if (natural) return natural;
  const premium = candidates.find(v => /premium|enhanced/i.test(v.name));
  if (premium) return premium;
  return candidates[0] || voices[0];
}

/**
 * Singleton-style TTS hook using the browser's built-in Web Speech API.
 * No external API key required.
 */
export function useTTS() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const utteranceRef = useRef<boolean>(false);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    utteranceRef.current = false;
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  const speak = useCallback(
    (text: string) => {
      stop();

      setIsLoading(true);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.92;
      utterance.pitch = 1.0;
      utterance.volume = isMuted ? 0 : 1;

      const applyVoice = () => {
        const voices = speechSynthesis.getVoices();
        const best = pickVoice(voices, "en");
        if (best) utterance.voice = best;
      };

      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        applyVoice();
      } else {
        speechSynthesis.addEventListener("voiceschanged", applyVoice, { once: true });
      }

      utterance.onstart = () => {
        utteranceRef.current = true;
        setIsPlaying(true);
        setIsLoading(false);
      };
      utterance.onend = () => {
        utteranceRef.current = false;
        setIsPlaying(false);
      };
      utterance.onerror = () => {
        utteranceRef.current = false;
        setIsPlaying(false);
        setIsLoading(false);
      };

      speechSynthesis.speak(utterance);
    },
    [stop, isMuted]
  );

  const setMuted = useCallback((muted: boolean) => {
    setIsMuted(muted);
  }, []);

  return { speak, stop, isPlaying, isLoading, isMuted, setMuted };
}
