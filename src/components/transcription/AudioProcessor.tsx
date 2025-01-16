import React, { useState, useEffect, useCallback } from 'react';
import { enhanceAudio } from '../../lib/audio';
import type { AudioEnhancementOptions } from '../../lib/whisper';

interface AudioProcessorProps {
  onAudioReady: (audioBuffer: ArrayBuffer) => Promise<void>;
  onError: (error: Error) => void;
  onStatusChange?: (status: string) => void;
}

export function AudioProcessor({ onAudioReady, onError, onStatusChange }: AudioProcessorProps) {
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
      onStatusChange?.('Enhancing audio...');

      const enhancementOptions: AudioEnhancementOptions = {
        noiseReduction: 0.5,
        speechEnhancement: 0.5,
        dereverberation: true,
        volumeNormalization: -14
      };

      const enhancedAudio = await enhanceAudio(audioData, enhancementOptions);
      onStatusChange?.('Audio enhancement complete');
      await onAudioReady(enhancedAudio);
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Audio processing failed'));
    } finally {
      setIsProcessing(false);
    }
  }, [audioContext, onAudioReady, onError, onStatusChange]);

  return null; // This is a utility component that doesn't render anything
}