import React, { useState, useCallback } from 'react';
import { 
  Upload, Mic, Settings, Save, Download, 
  AlertCircle, FileAudio, Volume2, Waveform,
  CheckCircle, Clock, Users, Shield
} from 'lucide-react';
import { AudioProcessor } from './AudioProcessor';
import { AudioAnalyzer } from './AudioAnalyzer';
import { transcribeAudio } from '../../lib/deepgram';
import type { TranscriptionResult } from '../../lib/deepgram';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import { PageHeader } from '../common/PageHeader';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface TranscriptionSegment {
  text: string;
  confidence: number;
  speaker?: string;
  timestamp: string;
}

export function CourtReporterTools() {
  const { isCourtReporter, loading } = useRoleAccess();
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);
  const [lowConfidenceWords, setLowConfidenceWords] = useState<string[]>([]);
  const [status, setStatus] = useState<string>('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/webm', 'video/webm'];
      if (!validTypes.includes(selectedFile.type)) {
        setStatus('Please select a valid audio/video file');
        return;
      }

      // Validate file size (500MB limit)
      if (selectedFile.size > 500 * 1024 * 1024) {
        setStatus('File size must be less than 500MB');
        return;
      }

      setFile(selectedFile);
      setAudioUrl(URL.createObjectURL(selectedFile));
      setStatus('');
    }
  };

  const handleAudioReady = useCallback(async (audioBuffer: ArrayBuffer) => {
    try {
      setIsProcessing(true);
      setStatus('Processing audio...');

      const blob = new Blob([audioBuffer], { type: 'audio/wav' });
      const file = new File([blob], 'recording.wav', { type: 'audio/wav' });

      const result = await transcribeAudio(file, {
        model: 'nova-2',
        smartFormat: true,
        diarization: true,
        punctuation: true,
        utterances: true,
        languageDetection: true
      });

      setTranscriptionResult(result);

      // Identify low confidence words
      const lowConfidence = result.words
        .filter(word => word.confidence < 0.85)
        .map(word => word.word);
      setLowConfidenceWords(lowConfidence);

      setStatus('Transcription complete');
    } catch (error) {
      console.error('Transcription error:', error);
      setStatus('Error processing audio');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleDownload = (format: 'txt' | 'docx' | 'json') => {
    if (!transcriptionResult) return;

    // Implementation for download functionality
    // This would be handled by your export utility
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isCourtReporter) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-800 mb-2">Access Restricted</h2>
          <p className="text-red-600">
            This tool is only available to court reporters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Court Reporter Tools"
        description="Professional transcription tools with AI-powered features"
        icon={FileAudio}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audio Processing Section */}
        <div className="space-y-6">
          {/* File Upload */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center">
              <input
                type="file"
                id="audioFile"
                accept="audio/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="mb-4">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Upload Audio/Video
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Supported formats: WAV, MP3, WebM
              </p>
              <label
                htmlFor="audioFile"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
              >
                Select File
              </label>
              {file && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {file.name}
                </p>
              )}
            </div>
          </div>

          {/* Audio Processor */}
          <AudioProcessor
            onAudioReady={handleAudioReady}
            onError={(error) => setStatus(error.message)}
          />

          {/* Audio Analysis */}
          {audioUrl && (
            <AudioAnalyzer
              audioUrl={audioUrl}
              onAnalysisComplete={(data) => {
                console.log('Audio analysis:', data);
              }}
            />
          )}
        </div>

        {/* Transcription Results */}
        <div className="space-y-6">
          {/* Status and Controls */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">{status}</span>
              </div>
              {transcriptionResult && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDownload('txt')}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    TXT
                  </button>
                  <button
                    onClick={() => handleDownload('docx')}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    DOCX
                  </button>
                </div>
              )}
            </div>

            {isProcessing && (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
                <span className="ml-3 text-gray-600">Processing audio...</span>
              </div>
            )}
          </div>

          {/* Transcription Output */}
          {transcriptionResult && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Transcription Results
              </h3>
              <div className="space-y-4">
                {transcriptionResult.words.map((word, index) => (
                  <span
                    key={`${index}-${word.start}`}
                    className={`inline-block ${
                      word.confidence < 0.85 ? 'bg-yellow-100' : ''
                    }`}
                    title={`Confidence: ${Math.round(word.confidence * 100)}%`}
                  >
                    {word.punctuated_word || word.word}{' '}
                  </span>
                ))}
              </div>

              {/* Low Confidence Words */}
              {lowConfidenceWords.length > 0 && (
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">
                    Words to Review
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {lowConfidenceWords.map((word, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quality Metrics */}
          {transcriptionResult && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Quality Metrics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Overall Confidence
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(transcriptionResult.confidence * 100)}%
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Users className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Speakers Detected
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {transcriptionResult.speakers?.length || 1}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}