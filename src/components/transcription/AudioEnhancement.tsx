import React, { useState } from 'react';
import { 
  Sliders, Volume2, VolumeX, Waves, Wind,
  FileAudio, Users, Activity, BarChart2,
  AlertCircle, Save, Download, RefreshCw,
  Settings, Lock
} from 'lucide-react';
import type { AudioEnhancementOptions, AudioMetrics } from '../../lib/audioEnhancement';

interface AudioEnhancementProps {
  onEnhancementComplete?: (enhancedAudio: ArrayBuffer) => void;
  onError?: (error: Error) => void;
}

export function AudioEnhancement({ onEnhancementComplete, onError }: AudioEnhancementProps) {
  const [settings, setSettings] = useState<AudioEnhancementOptions>({
    noiseReduction: 0.5,
    speechEnhancement: 0.5,
    dereverberation: true,
    volumeNormalization: -14
  });

  const [metrics, setMetrics] = useState<AudioMetrics>({
    snr: 0,
    rms: 0,
    peakDb: 0,
    crestFactor: 0,
    clarity: 0
  });

  const handleSettingChange = (setting: keyof AudioEnhancementOptions, value: number | boolean) => {
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
        {/* Enhancement Controls */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
              <Waves className="h-4 w-4 mr-2" />
              Noise Reduction
            </h3>
            <div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.noiseReduction}
                onChange={(e) => handleSettingChange('noiseReduction', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Gentle</span>
                <span>{Math.round(settings.noiseReduction * 100)}%</span>
                <span>Aggressive</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
              <Volume2 className="h-4 w-4 mr-2" />
              Speech Enhancement
            </h3>
            <div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.speechEnhancement}
                onChange={(e) => handleSettingChange('speechEnhancement', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Subtle</span>
                <span>{Math.round(settings.speechEnhancement * 100)}%</span>
                <span>Strong</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
              <Wind className="h-4 w-4 mr-2" />
              Additional Processing
            </h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.dereverberation}
                  onChange={(e) => handleSettingChange('dereverberation', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">Dereverberation</span>
              </label>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Volume Normalization (LUFS)</label>
                <input
                  type="number"
                  value={settings.volumeNormalization}
                  onChange={(e) => handleSettingChange('volumeNormalization', parseFloat(e.target.value))}
                  className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Audio Metrics */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Audio Metrics
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-md">
                <div className="text-xs text-gray-500">Signal-to-Noise</div>
                <div className="text-lg font-semibold">{metrics.snr.toFixed(1)} dB</div>
              </div>
              <div className="bg-white p-3 rounded-md">
                <div className="text-xs text-gray-500">Peak Level</div>
                <div className="text-lg font-semibold">{metrics.peakDb.toFixed(1)} dB</div>
              </div>
              <div className="bg-white p-3 rounded-md">
                <div className="text-xs text-gray-500">Clarity Score</div>
                <div className="text-lg font-semibold">{Math.round(metrics.clarity)}%</div>
              </div>
              <div className="bg-white p-3 rounded-md">
                <div className="text-xs text-gray-500">Crest Factor</div>
                <div className="text-lg font-semibold">{metrics.crestFactor.toFixed(1)}</div>
              </div>
            </div>
          </div>

          {/* Processing Chain */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Processing Chain</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-600">
                  <Wind className="h-4 w-4 mr-2" />
                  Noise Reduction
                </div>
                <span className="text-green-600">Active</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-600">
                  <Volume2 className="h-4 w-4 mr-2" />
                  Speech Enhancement
                </div>
                <span className="text-green-600">Active</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-600">
                  <Waves className="h-4 w-4 mr-2" />
                  Dereverberation
                </div>
                <span className="text-green-600">Active</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
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
    </div>
  );
}