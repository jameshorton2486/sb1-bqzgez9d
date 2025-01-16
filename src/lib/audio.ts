import { enhanceAudio } from './whisper';
import type { AudioEnhancementOptions } from './whisper';

// Re-export the enhanceAudio function and types
export { enhanceAudio, type AudioEnhancementOptions };

// Audio processing utility functions
export function calculateVolumeLevel(dataArray: Uint8Array): number {
  const sum = dataArray.reduce((acc, val) => acc + val, 0);
  return (sum / dataArray.length) * (100 / 255);
}

export function calculatePeakFrequency(dataArray: Uint8Array, sampleRate: number): number {
  const maxIndex = dataArray.indexOf(Math.max(...dataArray));
  return (maxIndex * sampleRate) / (dataArray.length * 2);
}

export function calculateSNR(dataArray: Uint8Array): number {
  const signal = Math.max(...dataArray);
  const noise = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
  return 20 * Math.log10(signal / (noise || 1));
}

export function calculateClarity(dataArray: Uint8Array): number {
  const threshold = 128;
  const clearSignals = dataArray.filter(val => val > threshold).length;
  return (clearSignals / dataArray.length) * 100;
}

// Audio analysis types
export interface AudioMetrics {
  volumeLevel: number;
  peakFrequency: number;
  snr: number;
  clarity: number;
}

// Audio worklet processor code
export function createAudioWorkletProcessor(): string {
  return `
    class AudioProcessor extends AudioWorkletProcessor {
      constructor() {
        super();
        this.bufferSize = 2048;
        this.buffer = new Float32Array(this.bufferSize);
        this.bufferIndex = 0;
      }

      process(inputs, outputs, parameters) {
        const input = inputs[0];
        const output = outputs[0];

        for (let channel = 0; channel < input.length; channel++) {
          const inputChannel = input[channel];
          const outputChannel = output[channel];

          for (let i = 0; i < inputChannel.length; i++) {
            outputChannel[i] = this.processFrame(inputChannel[i]);
          }
        }

        return true;
      }

      processFrame(sample) {
        // Add real-time processing logic here
        return sample;
      }
    }

    registerProcessor('audio-processor', AudioProcessor);
  `;
}

// Audio analysis function
export async function analyzeAudio(audioBuffer: ArrayBuffer): Promise<AudioMetrics> {
  const audioContext = new AudioContext();
  const audioData = await audioContext.decodeAudioData(audioBuffer);
  const channelData = audioData.getChannelData(0);
  const dataArray = new Uint8Array(channelData.length);

  // Convert Float32Array to Uint8Array for analysis
  for (let i = 0; i < channelData.length; i++) {
    dataArray[i] = (channelData[i] + 1) * 128;
  }

  return {
    volumeLevel: calculateVolumeLevel(dataArray),
    peakFrequency: calculatePeakFrequency(dataArray, audioData.sampleRate),
    snr: calculateSNR(dataArray),
    clarity: calculateClarity(dataArray)
  };
}