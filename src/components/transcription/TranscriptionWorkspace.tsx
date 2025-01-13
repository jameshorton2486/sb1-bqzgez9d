// Update the handleAudioReady function in TranscriptionWorkspace.tsx
const handleAudioReady = useCallback(async (audioBuffer: ArrayBuffer) => {
  try {
    setIsProcessing(true);
    setStatus('Transcribing audio...');

    const blob = new Blob([audioBuffer], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);

    console.log('Audio blob size:', blob.size);
    console.log('Audio type:', blob.type);

    const file = new File([blob], 'recording.wav', { 
      type: 'audio/wav',
      lastModified: Date.now()
    });

    const result = await transcribeAudio(file, transcriptionOptions);
    console.log('Transcription result:', result);

    setTranscriptionResult(result);
    onTranscriptionComplete?.(result);
    setStatus('Transcription complete');
  } catch (error) {
    console.error('Transcription error:', error);
    setStatus('Transcription failed');
    onError?.(error instanceof Error ? error : new Error('Transcription failed'));
  } finally {
    setIsProcessing(false);
  }
}, [transcriptionOptions, onTranscriptionComplete, onError]);