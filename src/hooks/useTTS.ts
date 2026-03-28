import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * TTS hook using ElevenLabs via the Supabase edge function.
 * Includes a circuit breaker: after 3 consecutive 401/403 errors,
 * permanently stops all TTS requests for the session.
 */
export function useTTS() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const failCountRef = useRef(0);
  const permanentlyFailedRef = useRef(false);

  const stop = useCallback(() => {
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.currentTime = 0;
      URL.revokeObjectURL(a.src);
      audioRef.current = null;
    }
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  const speak = useCallback(
    async (text: string) => {
      stop();

      // Circuit breaker: don't attempt if permanently failed or muted
      if (isMuted || !text || permanentlyFailedRef.current) return;

      setIsLoading(true);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tts`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ text }),
          }
        );

        if (!response.ok) {
          // Circuit breaker for auth errors
          if (response.status === 401 || response.status === 403) {
            failCountRef.current += 1;
            if (failCountRef.current >= 3) {
              console.warn("TTS circuit breaker tripped: 3 consecutive auth failures. Disabling TTS for this session.");
              permanentlyFailedRef.current = true;
            }
          }
          console.error("TTS error:", response.status);
          setIsLoading(false);
          return;
        }

        // Reset fail count on success
        failCountRef.current = 0;

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onplay = () => {
          setIsPlaying(true);
          setIsLoading(false);
        };
        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(url);
          audioRef.current = null;
        };
        audio.onerror = () => {
          setIsPlaying(false);
          setIsLoading(false);
          URL.revokeObjectURL(url);
          audioRef.current = null;
        };

        await audio.play();
      } catch (err) {
        console.error("TTS fetch error:", err);
        setIsLoading(false);
      }
    },
    [stop, isMuted]
  );

  const setMuted = useCallback((muted: boolean) => {
    if (muted) stop();
    setIsMuted(muted);
  }, [stop]);

  return { speak, stop, isPlaying, isLoading, isMuted, setMuted };
}
