import { Deepgram } from '@deepgram/sdk';
import { logger } from './logger';
import { ApiError } from './errors';

const DEEPGRAM_API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY;

if (!DEEPGRAM_API_KEY) {
  throw new ApiError('Missing Deepgram API key - please set VITE_DEEPGRAM_API_KEY in your environment', 'DEEPGRAM_CONFIG_ERROR');
}

const deepgram = new Deepgram(DEEPGRAM_API_KEY);

const handleDeepgramError = (error: unknown): never => {
  logger.error(
    'Deepgram API error',
    'deepgram.ts',
    'handleDeepgramError',
    error instanceof Error ? error : new Error('Unknown error'),
    { originalError: error }
  );
  throw new ApiError(
    error instanceof Error ? error.message : 'Failed to process audio',
    'DEEPGRAM_API_ERROR'
  );
};

export interface AudioEnhancementOptions {
  noiseReduction?: number; // 0-1 scale
  speechEnhancement?: number; // 0-1 scale
  dereverberation?: boolean;
  volumeNormalization?: number; // Target LUFS level
}

export async function enhanceAudio(
  audioBuffer: ArrayBuffer,
  options: AudioEnhancementOptions = {}
): Promise<ArrayBuffer> {
  try {
    logger.info(
      'Starting audio enhancement',
      'deepgram.ts',
      'enhanceAudio',
      { options, bufferSize: audioBuffer.byteLength }
    );

    const source = {
      buffer: audioBuffer,
      mimetype: 'audio/wav',
    };

    const response = await deepgram.transcription.preRecorded(source, {
      smart_format: true,
      diarize: true,
      utterances: true,
      punctuate: true,
      enhance: true,
      denoise: options.noiseReduction !== undefined,
      noise_reduction_amount: options.noiseReduction || 0.5,
      speech_enhancement: options.speechEnhancement || 0.5,
      dereverberate: options.dereverberation || false,
      ...options
    });

    logger.info(
      'Audio enhancement completed',
      'deepgram.ts',
      'enhanceAudio',
      { 
        originalSize: audioBuffer.byteLength,
        enhancedSize: response.metadata?.enhanced_audio?.byteLength
      }
    );

    return response.metadata?.enhanced_audio || audioBuffer;
  } catch (error) {
    return handleDeepgramError(error);
  }
}

export async function transcribeAudio(audioFile: File, options = {}) {
  try {
    logger.info(
      'Starting audio transcription',
      'deepgram.ts',
      'transcribeAudio',
      { 
        fileName: audioFile.name,
        fileSize: audioFile.size,
        fileType: audioFile.type,
        options 
      }
    );

    const source = {
      buffer: await audioFile.arrayBuffer(),
      mimetype: audioFile.type,
    };

    const response = await deepgram.transcription.preRecorded(source, {
      smart_format: true,
      diarize: true,
      utterances: true,
      punctuate: true,
      ...options
    });

    logger.info(
      'Audio transcription completed',
      'deepgram.ts',
      'transcribeAudio',
      { 
        duration: response.metadata?.duration,
        confidence: response.metadata?.confidence
      }
    );

    return response;
  } catch (error) {
    return handleDeepgramError(error);
  }
}

export type { TranscriptionResult } from '@deepgram/sdk';