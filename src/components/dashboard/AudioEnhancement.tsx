import React, { useState } from 'react';
import { 
  Sliders, Volume2, VolumeX, Waves, Wind,
  FileAudio, Users, Activity, BarChart2,
  AlertCircle, Save, Download, RefreshCw,
  Settings, Lock
} from 'lucide-react';

export function AudioEnhancement() {
  const [settings, setSettings] = useState({
    // Format Settings
    sampleRate: 16000,
    channels: 1,
    bitDepth: 16,
    
    // Noise Management
    noiseReduction: 50,
    noiseThreshold: -40,
    
    // Enhancement Settings
    normalization: -14,
    highPassFilter: 100,
    lowPassFilter: 8000,
    compression: 2,
    speechBoost: 3,
    
    // Quality Control
    confidenceThreshold: 70,
    segmentLength: 45
  });

  const [processingStats, setProcessingStats] = useState({
    originalDuration: '45:22',
    processedDuration: '45:22',
    overallConfidence: 89,
    speakerCount: 3,
    segments: 42,
    flaggedSegments: 2
  });

  const handleSettingChange = (setting: string, value: number) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Audio Enhancement</h2>
          <p className="text-sm text-gray-500">Professional-grade audio processing for legal depositions</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Process Audio
          </button>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Processing Controls */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
              <FileAudio className="h-4 w-4 mr-2" />
              Format Standardization
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Sample Rate</label>
                <select 
                  className="w-full rounded-md border-gray-300 text-sm"
                  value={settings.sampleRate}
                  onChange={(e) => handleSettingChange('sampleRate', parseInt(e.target.value))}
                >
                  <option value="16000">16 kHz</option>
                  <option value="44100">44.1 kHz</option>
                  <option value="48000">48 kHz</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Channels</label>
                <select 
                  className="w-full rounded-md border-gray-300 text-sm"
                  value={settings.channels}
                  onChange={(e) => handleSettingChange('channels', parseInt(e.target.value))}
                >
                  <option value="1">Mono</option>
                  <option value="2">Stereo</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Bit Depth</label>
                <select 
                  className="w-full rounded-md border-gray-300 text-sm"
                  value={settings.bitDepth}
                  onChange={(e) => handleSettingChange('bitDepth', parseInt(e.target.value))}
                >
                  <option value="16">16-bit</option>
                  <option value="24">24-bit</option>
                  <option value="32">32-bit</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
              <Volume2 className="h-4 w-4 mr-2" />
              Noise Management
            </h3>
            <div className="space-y-4">
              <div>
                <label className="flex items-center text-xs text-gray-500 mb-1">
                  Noise Reduction Sensitivity
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.noiseReduction}
                  onChange={(e) => handleSettingChange('noiseReduction', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Gentle</span>
                  <span>{settings.noiseReduction}%</span>
                  <span>Aggressive</span>
                </div>
              </div>
              <div>
                <label className="flex items-center text-xs text-gray-500 mb-1">
                  Noise Floor Threshold
                </label>
                <input
                  type="range"
                  min="-60"
                  max="-20"
                  value={settings.noiseThreshold}
                  onChange={(e) => handleSettingChange('noiseThreshold', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{settings.noiseThreshold} dB</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
              <Waves className="h-4 w-4 mr-2" />
              Audio Enhancement
            </h3>
            <div className="space-y-4">
              <div>
                <label className="flex items-center text-xs text-gray-500 mb-1">
                  Volume Normalization (LUFS)
                </label>
                <input
                  type="range"
                  min="-24"
                  max="-9"
                  value={settings.normalization}
                  onChange={(e) => handleSettingChange('normalization', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{settings.normalization} LUFS</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center text-xs text-gray-500 mb-1">
                    High-Pass Filter
                  </label>
                  <input
                    type="number"
                    value={settings.highPassFilter}
                    onChange={(e) => handleSettingChange('highPassFilter', parseInt(e.target.value))}
                    className="w-full rounded-md border-gray-300 text-sm"
                    min="20"
                    max="500"
                  />
                  <span className="text-xs text-gray-500">Hz</span>
                </div>
                <div>
                  <label className="flex items-center text-xs text-gray-500 mb-1">
                    Low-Pass Filter
                  </label>
                  <input
                    type="number"
                    value={settings.lowPassFilter}
                    onChange={(e) => handleSettingChange('lowPassFilter', parseInt(e.target.value))}
                    className="w-full rounded-md border-gray-300 text-sm"
                    min="4000"
                    max="20000"
                  />
                  <span className="text-xs text-gray-500">Hz</span>
                </div>
              </div>
              <div>
                <label className="flex items-center text-xs text-gray-500 mb-1">
                  Speech Boost
                </label>
                <input
                  type="range"
                  min="0"
                  max="6"
                  value={settings.speechBoost}
                  onChange={(e) => handleSettingChange('speechBoost', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0 dB</span>
                  <span>+{settings.speechBoost} dB</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quality Metrics and Processing Results */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Processing Statistics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-md">
                <div className="text-xs text-gray-500">Original Duration</div>
                <div className="text-lg font-semibold">{processingStats.originalDuration}</div>
              </div>
              <div className="bg-white p-3 rounded-md">
                <div className="text-xs text-gray-500">Processed Duration</div>
                <div className="text-lg font-semibold">{processingStats.processedDuration}</div>
              </div>
              <div className="bg-white p-3 rounded-md">
                <div className="text-xs text-gray-500">Overall Confidence</div>
                <div className="text-lg font-semibold text-green-600">
                  {processingStats.overallConfidence}%
                </div>
              </div>
              <div className="bg-white p-3 rounded-md">
                <div className="text-xs text-gray-500">Speaker Count</div>
                <div className="text-lg font-semibold">{processingStats.speakerCount}</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Speaker Timeline
            </h3>
            <div className="space-y-2">
              {[
                { time: "00:00 - 15:12", speaker: "Attorney Smith", confidence: 95 },
                { time: "15:13 - 25:45", speaker: "Witness Johnson", confidence: 92 },
                { time: "25:46 - 45:22", speaker: "Attorney Davis", confidence: 88 }
              ].map((segment, index) => (
                <div key={index} className="bg-white p-2 rounded-md flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{segment.speaker}</div>
                    <div className="text-xs text-gray-500">{segment.time}</div>
                  </div>
                  <div className={`text-sm ${
                    segment.confidence >= 90 ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {segment.confidence}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
              <Lock className="h-4 w-4 mr-2" />
              Chain of Custody
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Original Hash:</span>
                <span className="font-mono text-xs">e7c9a1...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Processed Hash:</span>
                <span className="font-mono text-xs">f8d0b2...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Timestamp:</span>
                <span>2024-01-15 14:30:22 UTC</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button className="flex items-center px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Download Original
            </button>
            <button className="flex items-center px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700">
              <Download className="h-4 w-4 mr-2" />
              Download Enhanced
            </button>
          </div>
        </div>
      </div>

      {/* Presets */}
      <div className="mt-6 pt-6 border-t">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Quick Presets</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
            Court Room
          </button>
          <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
            Remote Deposition
          </button>
          <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
            Multiple Speakers
          </button>
          <button className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
            High Background Noise
          </button>
        </div>
      </div>
    </div>
  );
}