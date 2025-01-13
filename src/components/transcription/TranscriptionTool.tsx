import React, { useState, useRef } from 'react';
import { 
  Upload, Settings, FileAudio, Users, Wand2, 
  Save, Download, AlertCircle, CheckCircle, 
  Play, Pause, Volume2, VolumeX, Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { transcribeAudio } from '../../lib/deepgram';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { PageHeader } from '../common/PageHeader';
import { EmptyState } from '../common/EmptyState';

interface TranscriptionSettings {
  diarization: boolean;
  smartFormat: boolean;
  utterances: boolean;
  punctuation: boolean;
  profanityFilter: boolean;
  languageDetection: boolean;
  keywords: string[];
}

interface TranscriptionResult {
  text: string;
  confidence: number;
  words: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
    speaker?: number;
  }>;
  speakers?: Array<{
    id: number;
    name?: string;
  }>;
}

export function TranscriptionTool() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<TranscriptionSettings>({
    diarization: true,
    smartFormat: true,
    utterances: true,
    punctuation: true,
    profanityFilter: false,
    languageDetection: true,
    keywords: []
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a'];
      if (!validTypes.includes(selectedFile.type)) {
        setError('Please select a valid audio file (MP3, WAV, M4A, or MP4)');
        return;
      }

      // Validate file size (max 500MB)
      if (selectedFile.size > 500 * 1024 * 1024) {
        setError('File size must be less than 500MB');
        return;
      }

      setFile(selectedFile);
      setAudioUrl(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const handleTranscribe = async () => {
    if (!file) {
      setError('Please select a file to transcribe');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await transcribeAudio(file, settings);
      setResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during transcription');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSettingChange = (setting: keyof TranscriptionSettings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleDownload = (format: 'txt' | 'docx' | 'json') => {
    if (!result) return;

    // Implementation for download functionality
    // This would be handled by your export utility
  };

  if (!['court_reporter', 'scopist'].includes(user?.role || '')) {
    return (
      <div className="p-6">
        <EmptyState
          icon={AlertCircle}
          title="Access Restricted"
          description="This tool is only available to Court Reporters and Scopists."
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Audio Transcription"
        description="Convert audio recordings to accurate legal transcripts"
        icon={FileAudio}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* File Upload and Settings */}
        <div className="lg:col-span-1 space-y-6">
          {/* File Upload */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".mp3,.wav,.m4a,.mp4"
                className="hidden"
              />
              <div className="mb-4">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Upload Audio File
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Drag and drop or click to select an audio file
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Select File
              </button>
              {file && (
                <div className="mt-4 text-sm text-gray-600">
                  Selected: {file.name}
                </div>
              )}
            </div>
          </div>

          {/* Transcription Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Transcription Settings
            </h3>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.diarization}
                  onChange={() => handleSettingChange('diarization')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Speaker Diarization</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.smartFormat}
                  onChange={() => handleSettingChange('smartFormat')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Smart Formatting</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.utterances}
                  onChange={() => handleSettingChange('utterances')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Utterance Detection</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.punctuation}
                  onChange={() => handleSettingChange('punctuation')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Automatic Punctuation</span>
              </label>
            </div>
          </div>
        </div>

        {/* Transcription Area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            ) : isProcessing ? (
              <div className="text-center py-12">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-sm text-gray-600">Processing audio file...</p>
              </div>
            ) : result ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-600">
                      Transcription complete ({Math.round(result.confidence * 100)}% confidence)
                    </span>
                  </div>
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
                </div>

                <div className="border rounded-lg p-4 max-h-[600px] overflow-y-auto">
                  {result.words.map((word, index) => (
                    <span
                      key={index}
                      className={`inline-block ${
                        word.confidence < 0.8 ? 'bg-yellow-100' : ''
                      }`}
                      title={`Confidence: ${Math.round(word.confidence * 100)}%`}
                    >
                      {word.word}{' '}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <EmptyState
                  icon={FileAudio}
                  title="No Transcription Yet"
                  description="Upload an audio file and click 'Start Transcription' to begin"
                  action={
                    <button
                      onClick={handleTranscribe}
                      disabled={!file}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Wand2 className="h-5 w-5 mr-2" />
                      Start Transcription
                    </button>
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}