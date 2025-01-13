import { Deepgram } from '@deepgram/sdk';

const DEEPGRAM_API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY;

if (!DEEPGRAM_API_KEY) {
  throw new Error('Missing Deepgram API key - please set VITE_DEEPGRAM_API_KEY in your environment');
}

const deepgram = new Deepgram(DEEPGRAM_API_KEY);

// Add error handling wrapper
const handleDeepgramError = (error: any): never => {
  console.error('Deepgram API error:', error);
  throw new Error(error?.message || 'Failed to process audio');
};

export async function transcribeAudio(audioFile: File, options = {}) {
  try {
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

    return response;
  } catch (error) {
    return handleDeepgramError(error);
  }
}