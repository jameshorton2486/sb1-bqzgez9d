// Update the startRecording function in EnhancedAudioProcessor.tsx
const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 44100,
        channelCount: 1
      } 
    });

    await setupAudioAnalysis(stream);

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'
    });
    
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      try {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mediaRecorder.mimeType 
        });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);

        setIsProcessing(true);
        onStatusChange?.('Processing audio...');
        
        const arrayBuffer = await audioBlob.arrayBuffer();
        console.log('Audio data size:', arrayBuffer.byteLength);
        
        const enhancedAudio = await enhanceAudio(arrayBuffer, enhancementOptions);
        console.log('Enhanced audio size:', enhancedAudio.byteLength);
        
        onStatusChange?.('Enhancement complete');
        onAudioReady(enhancedAudio);
      } catch (error) {
        console.error('Audio processing error:', error);
        onError(error instanceof Error ? error : new Error('Audio processing failed'));
      } finally {
        setIsProcessing(false);
      }
    };

    mediaRecorder.start(1000);
    setIsRecording(true);
    onStatusChange?.('Recording...');

    timerRef.current = window.setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  } catch (error) {
    console.error('Recording error:', error);
    onError(error instanceof Error ? error : new Error('Failed to start recording'));
  }
};