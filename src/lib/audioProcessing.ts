import { AudioEnhancementOptions } from './deepgram';

export interface AudioMetrics {
  snr: number;          // Signal-to-noise ratio
  rms: number;          // Root mean square (volume)
  peakDb: number;       // Peak decibel level
  crestFactor: number;  // Peak to RMS ratio
  clarity: number;      // Speech clarity score
}

export async function analyzeAudio(audioBuffer: ArrayBuffer): Promise<AudioMetrics> {
  const audioContext = new AudioContext();
  const audioData = await audioContext.decodeAudioData(audioBuffer);
  const channelData = audioData.getChannelData(0);

  // Calculate RMS (volume)
  const rms = Math.sqrt(channelData.reduce((acc, val) => acc + val * val, 0) / channelData.length);

  // Calculate peak level
  const peak = Math.max(...channelData.map(Math.abs));
  const peakDb = 20 * Math.log10(peak);

  // Calculate crest factor (peak to RMS ratio)
  const crestFactor = peak / rms;

  // Calculate SNR using noise floor estimation
  const noiseFloor = estimateNoiseFloor(channelData);
  const signalPower = rms * rms;
  const noisePower = noiseFloor * noiseFloor;
  const snr = 10 * Math.log10(signalPower / noisePower);

  // Calculate clarity score
  const clarity = calculateClarity(channelData);

  return {
    snr,
    rms,
    peakDb,
    crestFactor,
    clarity
  };
}

function estimateNoiseFloor(samples: Float32Array): number {
  // Sort samples by magnitude and take the lowest 10% as noise
  const sortedMagnitudes = Array.from(samples).map(Math.abs).sort((a, b) => a - b);
  const noiseSegment = sortedMagnitudes.slice(0, Math.floor(samples.length * 0.1));
  return noiseSegment.reduce((a, b) => a + b, 0) / noiseSegment.length;
}

function calculateClarity(samples: Float32Array): number {
  // Calculate clarity based on signal dynamics and consistency
  const windowSize = 1024;
  let clarityScore = 0;
  
  for (let i = 0; i < samples.length - windowSize; i += windowSize) {
    const window = samples.slice(i, i + windowSize);
    const windowRms = Math.sqrt(window.reduce((acc, val) => acc + val * val, 0) / windowSize);
    const windowPeak = Math.max(...window.map(Math.abs));
    const dynamicRange = windowPeak / windowRms;
    
    clarityScore += dynamicRange > 3 ? 1 : 0;
  }
  
  return (clarityScore / (samples.length / windowSize)) * 100;
}

export async function enhanceAudio(
  audioBuffer: ArrayBuffer,
  options: AudioEnhancementOptions
): Promise<ArrayBuffer> {
  const audioContext = new AudioContext();
  const audioData = await audioContext.decodeAudioData(audioBuffer);
  const offlineContext = new OfflineAudioContext(
    audioData.numberOfChannels,
    audioData.length,
    audioData.sampleRate
  );

  // Create processing nodes
  const source = offlineContext.createBufferSource();
  source.buffer = audioData;

  // Noise reduction
  const noiseReducer = offlineContext.createDynamicsCompressor();
  noiseReducer.threshold.value = -50;
  noiseReducer.knee.value = 40;
  noiseReducer.ratio.value = 12;
  noiseReducer.attack.value = 0;
  noiseReducer.release.value = 0.25;

  // Speech enhancement
  const highPassFilter = offlineContext.createBiquadFilter();
  highPassFilter.type = 'highpass';
  highPassFilter.frequency.value = 80;
  highPassFilter.Q.value = 0.7;

  const lowPassFilter = offlineContext.createBiquadFilter();
  lowPassFilter.type = 'lowpass';
  lowPassFilter.frequency.value = 12000;
  lowPassFilter.Q.value = 0.7;

  // Volume normalization
  const gainNode = offlineContext.createGain();
  gainNode.gain.value = options.volumeNormalization || 1.0;

  // Connect nodes
  source.connect(highPassFilter);
  highPassFilter.connect(lowPassFilter);
  lowPassFilter.connect(noiseReducer);
  noiseReducer.connect(gainNode);
  gainNode.connect(offlineContext.destination);

  // Process audio
  source.start(0);
  const renderedBuffer = await offlineContext.startRendering();

  // Convert back to ArrayBuffer
  const enhancedChannelData = renderedBuffer.getChannelData(0);
  return enhancedChannelData.buffer;
}

export function createAudioWorkletProcessor() {
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
            // Apply real-time processing
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