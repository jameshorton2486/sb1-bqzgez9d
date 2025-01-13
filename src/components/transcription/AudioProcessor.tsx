import React, { useState, useEffect, useCallback } from 'react';
import { enhanceAudio } from '../../lib/deepgram';

export function AudioProcessor({ onAudioReady, onError }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Initialize AudioContext lazily
  useEffect(() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    setAudioContext(ctx);
    return () => {
      ctx.close();
    };
  }, []);

  const processAudio = useCallback(async (audioData: ArrayBuffer) => {
    if (!audioContext) return;
    
    try {
      setIsProcessing(true);
      const enhancedAudio = await enhanceAudio(audioData);
      onAudioReady(enhancedAudio);
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Audio processing failed'));
    } finally {
      setIsProcessing(false);
    }
  }, [audioContext, onAudioReady, onError]);

  // Rest of component implementation...
}