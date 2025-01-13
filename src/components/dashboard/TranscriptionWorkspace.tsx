import React, { useState } from 'react';
import { 
  Mic, Edit3, AlertCircle, Play, Pause, 
  Volume2, VolumeX, Settings, Save, Download,
  ZoomIn, ZoomOut, RotateCcw, FastForward,
  ShieldAlert
} from 'lucide-react';
import { useRoleAccess } from '../../hooks/useRoleAccess';

export function TranscriptionWorkspace() {
  const { isCourtReporter, loading } = useRoleAccess();
  const [isRecording, setIsRecording] = useState(false);
  const [audioEnhancementEnabled, setAudioEnhancementEnabled] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!isCourtReporter) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col items-center justify-center h-64">
          <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600 text-center">
            The transcription workspace is only accessible to court reporters.
            Please contact your administrator if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  // Rest of your existing component code...
  const transcriptSegments = [
    {
      id: 1,
      timestamp: "10:15:32 AM",
      speaker: "John Smith",
      content: "Could you please state your name and occupation for the record?",
      confidence: 99,
      flags: [],
    },
    {
      id: 2,
      timestamp: "10:15:45 AM",
      speaker: "Jane Doe",
      content: "My name is Jane Doe, and I'm a senior software engineer at Tech Corp.",
      confidence: 95,
      flags: ["possible_name"],
    }
  ];

  const audioControls = [
    { icon: Play, label: "Play/Pause" },
    { icon: RotateCcw, label: "Rewind 5s" },
    { icon: FastForward, label: "Forward 5s" },
    { icon: Volume2, label: "Volume" },
    { icon: ZoomIn, label: "Zoom Waveform" }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Active Transcription</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isRecording
                  ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                  : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
              }`}
            >
              <div className="flex items-center">
                <Mic className="h-5 w-5 mr-2" />
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </div>
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <Save className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Audio Controls */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-4">
              {audioControls.map((control, index) => (
                <button
                  key={index}
                  className="p-2 hover:bg-gray-200 rounded-full"
                  title={control.label}
                >
                  <control.icon className="h-5 w-5 text-gray-700" />
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                className="rounded-md border-gray-300 text-sm"
              >
                <option value="0.5">0.5x</option>
                <option value="1.0">1.0x</option>
                <option value="1.5">1.5x</option>
                <option value="2.0">2.0x</option>
              </select>
              <button
                onClick={() => setAudioEnhancementEnabled(!audioEnhancementEnabled)}
                className={`p-2 rounded-full ${
                  audioEnhancementEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}
                title="Audio Enhancement"
              >
                {audioEnhancementEnabled ? <Volume2 /> : <VolumeX />}
              </button>
            </div>
          </div>
          
          {/* Audio Waveform Visualization */}
          <div className="h-24 bg-gray-200 rounded-lg mb-4">
            <div className="h-full w-full bg-gradient-to-r from-blue-500/20 to-blue-500/20 bg-[length:20px_100%] animate-pulse">
            </div>
          </div>
        </div>

        {/* Transcription Feed */}
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {transcriptSegments.map((segment) => (
            <div key={segment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2">{segment.timestamp}</span>
                  <span className="font-semibold">{segment.speaker}:</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm ${
                    segment.confidence >= 95 ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {segment.confidence}% Confidence
                  </span>
                  {segment.flags.length > 0 && (
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                  )}
                  <Edit3 className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                </div>
              </div>
              <p className="text-gray-700">{segment.content}</p>
              {segment.flags.length > 0 && (
                <div className="mt-2 text-sm text-yellow-600">
                  Potential proper noun detected - please verify
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                Add Speaker
              </button>
              <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                Insert Timestamp
              </button>
              <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                Mark for Review
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <Settings className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600" />
              <Download className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Transcription Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Confidence Threshold</label>
              <input
                type="range"
                min="0"
                max="100"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-sm text-gray-500">{confidenceThreshold}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}