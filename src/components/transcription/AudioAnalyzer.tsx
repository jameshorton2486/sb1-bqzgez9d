import React, { useEffect, useRef, useState } from 'react';
import { BarChart2, Volume2, Waveform, Activity } from 'lucide-react';

interface AudioAnalyzerProps {
  audioUrl: string;
  onAnalysisComplete?: (data: AudioAnalysisData) => void;
}

interface AudioAnalysisData {
  volumeLevel: number;
  peakFrequency: number;
  snr: number; // Signal-to-noise ratio
  clarity: number;
}

export function AudioAnalyzer({ audioUrl, onAnalysisComplete }: AudioAnalyzerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext>();
  const analyserRef = useRef<AnalyserNode>();
  const [analysisData, setAnalysisData] = useState<AudioAnalysisData>({
    volumeLevel: 0,
    peakFrequency: 0,
    snr: 0,
    clarity: 0
  });

  useEffect(() => {
    if (!audioUrl) return;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const audio = new Audio(audioUrl);
    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    function draw() {
      requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      canvasCtx.fillStyle = 'rgb(25, 25, 25)';
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;

        const gradient = canvasCtx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#3B82F6');
        gradient.addColorStop(1, '#1E40AF');

        canvasCtx.fillStyle = gradient;
        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }

      // Calculate audio metrics
      const volumeLevel = calculateVolumeLevel(dataArray);
      const peakFrequency = calculatePeakFrequency(dataArray, audioContext.sampleRate);
      const snr = calculateSNR(dataArray);
      const clarity = calculateClarity(dataArray);

      setAnalysisData({
        volumeLevel,
        peakFrequency,
        snr,
        clarity
      });

      if (onAnalysisComplete) {
        onAnalysisComplete({
          volumeLevel,
          peakFrequency,
          snr,
          clarity
        });
      }
    }

    draw();

    return () => {
      audioContext.close();
    };
  }, [audioUrl]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Audio Analysis</h3>
      
      <canvas 
        ref={canvasRef} 
        width="800" 
        height="200" 
        className="w-full bg-gray-900 rounded-lg mb-4"
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center mb-2">
            <Volume2 className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Volume Level</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(analysisData.volumeLevel)}%
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center mb-2">
            <Waveform className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Peak Frequency</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(analysisData.peakFrequency)} Hz
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center mb-2">
            <Activity className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Signal-to-Noise</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {analysisData.snr.toFixed(1)} dB
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center mb-2">
            <BarChart2 className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-gray-700">Clarity Score</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(analysisData.clarity)}%
          </div>
        </div>
      </div>
    </div>
  );
}

// Audio analysis utility functions
function calculateVolumeLevel(dataArray: Uint8Array): number {
  const sum = dataArray.reduce((acc, val) => acc + val, 0);
  return (sum / dataArray.length) * (100 / 255);
}

function calculatePeakFrequency(dataArray: Uint8Array, sampleRate: number): number {
  const maxIndex = dataArray.indexOf(Math.max(...dataArray));
  return (maxIndex * sampleRate) / (dataArray.length * 2);
}

function calculateSNR(dataArray: Uint8Array): number {
  const signal = Math.max(...dataArray);
  const noise = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
  return 20 * Math.log10(signal / (noise || 1));
}

function calculateClarity(dataArray: Uint8Array): number {
  const threshold = 128;
  const clearSignals = dataArray.filter(val => val > threshold).length;
  return (clearSignals / dataArray.length) * 100;
}