import { Whisper } from 'whisper-node';
import { logger } from './logger';
import { ApiError } from './errors';

// Initialize Whisper with base model for optimal performance/accuracy balance
const WHISPER_MODEL = 'base';

export interface TranscriptionOptions {
  language?: string;
  task?: 'transcribe' | 'translate';
  initialPrompt?: string;
  diarization?: boolean;
  timestamps?: boolean;
}

export interface TranscriptionResult {
  text: string;
  confidence: number;
  language: string;
  words: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
    speaker?: string;
  }>;
}

export interface AudioEnhancementOptions {
  noiseReduction?: number;
  speechEnhancement?: number;
  dereverberation?: boolean;
  volumeNormalization?: number;
}

const whisper = new Whisper(WHISPER_MODEL);

const handleWhisperError = (error: unknown): never => {
  logger.error(
    'Whisper API error',
    'whisper.ts',
    'handleWhisperError',
    error instanceof Error ? error : new Error('Unknown error'),
    { originalError: error }
  );
  throw new ApiError(
    error instanceof Error ? error.message : 'Failed to process audio',
    'WHISPER_API_ERROR'
  );
};

export async function transcribeAudio(
  audioFile: File,
  options: TranscriptionOptions = {}
): Promise<TranscriptionResult> {
  try {
    logger.info(
      'Starting audio transcription',
      'whisper.ts',
      'transcribeAudio',
      { 
        fileName: audioFile.name,
        fileSize: audioFile.size,
        fileType: audioFile.type,
        options 
      }
    );

    const arrayBuffer = await audioFile.arrayBuffer();
    const rawResult = await whisper.transcribe(arrayBuffer, {
      language: options.language,
      task: options.task || 'transcribe',
      initial_prompt: options.initialPrompt
    });

    // Transform Whisper output to match expected interface
    const result: TranscriptionResult = {
      text: rawResult.text,
      confidence: rawResult.segments.reduce((acc, seg) => acc + seg.confidence, 0) / rawResult.segments.length,
      language: rawResult.language,
      words: rawResult.segments.flatMap(segment => {
        // Split segment text into words and distribute timing/confidence
        const words = segment.text.trim().split(/\s+/);
        const wordDuration = (segment.end - segment.start) / words.length;
        
        return words.map((word, index) => ({
          word,
          start: segment.start + (index * wordDuration),
          end: segment.start + ((index + 1) * wordDuration),
          confidence: segment.confidence,
          speaker: segment.speaker
        }));
      })
    };

    logger.info(
      'Audio transcription completed',
      'whisper.ts',
      'transcribeAudio',
      { 
        duration: result.words.length > 0 ? result.words[result.words.length - 1].end : 0,
        confidence: result.confidence,
        wordCount: result.words.length
      }
    );

    return result;
  } catch (error) {
    return handleWhisperError(error);
  }
}

export async function enhanceAudio(
  audioBuffer: ArrayBuffer,
  options: AudioEnhancementOptions = {}
): Promise<ArrayBuffer> {
  try {
    logger.info(
      'Starting audio enhancement',
      'whisper.ts',
      'enhanceAudio',
      { options, bufferSize: audioBuffer.byteLength }
    );

    const audioContext = new AudioContext();
    const audioSource = audioContext.createBufferSource();
    const enhancedBuffer = await audioContext.decodeAudioData(audioBuffer);

    // Create audio processing nodes
    const gainNode = audioContext.createGain();
    const compressor = audioContext.createDynamicsCompressor();
    const filter = audioContext.createBiquadFilter();

    // Configure nodes based on options
    if (options.noiseReduction) {
      compressor.threshold.value = -50;
      compressor.knee.value = 40;
      compressor.ratio.value = options.noiseReduction * 20;
      compressor.attack.value = 0;
      compressor.release.value = 0.25;
    }

    if (options.speechEnhancement) {
      filter.type = 'bandpass';
      filter.frequency.value = 1000;
      filter.Q.value = options.speechEnhancement * 5;
    }

    if (options.volumeNormalization) {
      gainNode.gain.value = options.volumeNormalization;
    }

    // Connect nodes
    audioSource.buffer = enhancedBuffer;
    audioSource.connect(filter);
    filter.connect(compressor);
    compressor.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Process audio
    const offlineContext = new OfflineAudioContext(
      enhancedBuffer.numberOfChannels,
      enhancedBuffer.length,
      enhancedBuffer.sampleRate
    );

    const renderedBuffer = await offlineContext.startRendering();
    const enhancedAudioBuffer = renderedBuffer.getChannelData(0).buffer;

    logger.info(
      'Audio enhancement completed',
      'whisper.ts',
      'enhanceAudio',
      { 
        originalSize: audioBuffer.byteLength,
        enhancedSize: enhancedAudioBuffer.byteLength
      }
    );

    return enhancedAudioBuffer;
  } catch (error) {
    return handleWhisperError(error);
  }
}

export async function handleStreamingTranscription(
  audioStream: ReadableStream,
  options: TranscriptionOptions = {}
): Promise<AsyncGenerator<TranscriptionResult>> {
  const CHUNK_SIZE = 4096; // 4KB chunks
  const reader = audioStream.getReader();
  const chunks: Uint8Array[] = [];

  async function* generateTranscriptions(): AsyncGenerator<TranscriptionResult> {
    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        chunks.push(value);
        
        // Process in chunks
        if (chunks.length * CHUNK_SIZE >= 32768) { // 32KB batches
          const audioData = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
          let offset = 0;
          for (const chunk of chunks) {
            audioData.set(chunk, offset);
            offset += chunk.length;
          }
          
          const result = await transcribeAudio(
            new File([audioData], 'stream.wav', { type: 'audio/wav' }),
            options
          );
          
          yield result;
          chunks.length = 0; // Clear processed chunks
        }
      }
      
      // Process any remaining audio
      if (chunks.length > 0) {
        const audioData = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
        let offset = 0;
        for (const chunk of chunks) {
          audioData.set(chunk, offset);
          offset += chunk.length;
        }
        
        const result = await transcribeAudio(
          new File([audioData], 'stream.wav', { type: 'audio/wav' }),
          options
        );
        
        yield result;
      }
    } catch (error) {
      handleWhisperError(error);
    } finally {
      reader.releaseLock();
    }
  }

  return generateTranscriptions();
}