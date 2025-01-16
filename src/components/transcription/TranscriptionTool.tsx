import React, { useState, useCallback } from 'react';
import { transcribeAudio } from '../../lib/whisper';
import type { TranscriptionResult, TranscriptionOptions } from '../../lib/whisper';
import { AudioProcessor } from './AudioProcessor';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface TranscriptionToolProps {
  onTranscriptionComplete?: (result: TranscriptionResult) => void;
  onError?: (error: Error) => void;
}

export function TranscriptionTool({ onTranscriptionComplete, onError }: TranscriptionToolProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');

  const handleAudioReady = useCallback(async (audioBuffer: ArrayBuffer) => {
    try {
      setIsProcessing(true);
      setStatus('Transcribing audio...');

      const options: TranscriptionOptions = {
        language: 'en',
        task: 'transcribe',
        diarization: true,
        timestamps: true
      };

      const blob = new Blob([audioBuffer], { type: 'audio/wav' });
      const file = new File([blob], 'recording.wav', { type: 'audio/wav' });
      
      const result = await transcribeAudio(file, options);
      onTranscriptionComplete?.(result);
      setStatus('Transcription complete');
    } catch (error) {
      setStatus('Transcription failed');
      onError?.(error instanceof Error ? error : new Error('Transcription failed'));
    } finally {
      setIsProcessing(false);
    }
  }, [onTranscriptionComplete, onError]);

  const handleError = useCallback((error: Error) => {
    setStatus('Error processing audio');
    onError?.(error);
  }, [onError]);

  return (
    <div className="relative">
      <AudioProcessor
        onAudioReady={handleAudioReady}
        onError={handleError}
        onStatusChange={setStatus}
      />

      {isProcessing && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">{status}</p>
          </div>
        </div>
      )}
    </div>
  );
}