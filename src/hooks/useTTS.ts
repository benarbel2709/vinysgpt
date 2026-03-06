import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Browser SpeechSynthesis fallback — pick the most natural voice available */
function speakWithBrowserTTS(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    speechSynthesis.cancel(); // clear any queued speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.92;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const pickVoice = (voices: SpeechSynthesisVoice[]) => {
      // Prefer voices labelled "Natural" (Edge / Windows 11 high-quality voices)
      const natural = voices.find(v => v.lang.startsWith("en") && /natural/i.test(v.name));
      if (natural) return natural;
      // Then prefer Samantha (macOS / iOS high-quality)
      const samantha = voices.find(v => /samantha/i.test(v.name));
      if (samantha) return samantha;
      // Then any premium/enhanced English female voice
      const premium = voices.find(v =>
        v.lang.startsWith("en") && /premium|enhanced|female|zira|hazel|karen/i.test(v.name)
      );
      if (premium) return premium;
      // Then any en-US voice
      const enUS = voices.find(v => v.lang === "en-US");
      if (enUS) return enUS;
      // Then any English voice
      return voices.find(v => v.lang.startsWith("en")) || voices[0];
    };

    const applyVoice = () => {
      const voices = speechSynthesis.getVoices();
      const best = pickVoice(voices);
      if (best) utterance.voice = best;
    };

    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      applyVoice();
    } else {
      speechSynthesis.addEventListener("voiceschanged", applyVoice, { once: true });
    }

    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e);
    speechSynthesis.speak(utterance);
  });
}

/**
 * Singleton-style TTS hook.
 * Only ONE audio element exists at a time.
 * stop() fully clears audio src to halt network & playback.
 */
export function useTTS() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<boolean>(false);
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    // Abort any in-flight TTS fetch
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    // Stop HTML audio
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        const src = audioRef.current.src;
        audioRef.current.removeAttribute("src");
        audioRef.current.load(); // release network
        if (src.startsWith("blob:")) URL.revokeObjectURL(src);
      } catch { /* ignore */ }
      audioRef.current = null;
    }
    // Stop browser speech synthesis
    if (utteranceRef.current) {
      speechSynthesis.cancel();
      utteranceRef.current = false;
    }
    setIsPlaying(false);
    setIsLoading(false);
  }, []);

  const speak = useCallback(
    async (text: string) => {
      // ALWAYS stop previous audio first
      stop();

      setIsLoading(true);

      // Create abort controller for this request
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        // Get the current user's session token for authenticated TTS
        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;
        if (!accessToken) {
          throw new Error("Not authenticated");
        }

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tts`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ text }),
            signal: controller.signal,
          }
        );

        if (!response.ok) throw new Error(`TTS request failed: ${response.status}`);

        const audioBlob = await response.blob();

        // Check if we were stopped/aborted while waiting
        if (controller.signal.aborted) return;

        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.muted = isMuted;

        audio.onplay = () => { setIsPlaying(true); setIsLoading(false); };
        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
        };
        audio.onerror = () => {
          setIsPlaying(false);
          setIsLoading(false);
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
        };

        audioRef.current = audio;
        await audio.play();
      } catch (error: any) {
        if (error?.name === "AbortError") return; // intentional abort
        console.warn("TTS failed, falling back to browser TTS:", error);
        try {
          utteranceRef.current = true;
          setIsPlaying(true);
          setIsLoading(false);
          await speakWithBrowserTTS(text);
        } catch { /* silent */ }
        finally {
          utteranceRef.current = false;
          setIsPlaying(false);
        }
      }
    },
    [stop, isMuted]
  );

  const setMuted = useCallback((muted: boolean) => {
    setIsMuted(muted);
    if (audioRef.current) {
      audioRef.current.muted = muted;
    }
  }, []);

  return { speak, stop, isPlaying, isLoading, isMuted, setMuted };
}
