import React, { useState } from 'react';
import { 
  Download, FileText, FileJson, Video, 
  FileSpreadsheet, FileCode, FilePdf, Settings 
} from 'lucide-react';
import type { TranscriptionResult } from '../../lib/deepgram';
import { exportTranscript, ExportOptions } from '../../lib/export';

interface ExportPanelProps {
  result: TranscriptionResult;
  onExportStart?: () => void;
  onExportComplete?: () => void;
  onError?: (error: Error) => void;
}

export function ExportPanel({ 
  result, 
  onExportStart, 
  onExportComplete, 
  onError 
}: ExportPanelProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'docx',
    includeMetadata: true,
    includeSpeakers: true,
    includeTimestamps: true,
    styleOptions: {
      fontSize: 12,
      fontFamily: 'Calibri',
      lineSpacing: 1.15,
      pageSize: 'Letter',
      margins: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20
      }
    }
  });

  const handleExport = async (format: ExportOptions['format']) => {
    try {
      onExportStart?.();
      await exportTranscript(result, { ...exportOptions, format });
      onExportComplete?.();
    } catch (error) {
      console.error('Export error:', error);
      onError?.(error instanceof Error ? error : new Error('Export failed'));
    }
  };

  const exportFormats = [
    { format: 'docx', label: 'Word', icon: FileText },
    { format: 'pdf', label: 'PDF', icon: FilePdf },
    { format: 'txt', label: 'Text', icon: FileText },
    { format: 'json', label: 'JSON', icon: FileJson },
    { format: 'srt', label: 'SRT', icon: Video },
    { format: 'vtt', label: 'VTT', icon: Video },
    { format: 'csv', label: 'CSV', icon: FileSpreadsheet },
    { format: 'html', label: 'HTML', icon: FileCode }
  ] as const;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Export Transcript</h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-full hover:bg-gray-100"
          title="Export Settings"
        >
          <Settings className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {showSettings && (
        <div className="mb-6 space-y-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportOptions.includeMetadata}
                onChange={(e) => setExportOptions(prev => ({
                  ...prev,
                  includeMetadata: e.target.checked
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Include Metadata</span>
            </label>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportOptions.includeSpeakers}
                onChange={(e) => setExportOptions(prev => ({
                  ...prev,
                  includeSpeakers: e.target.checked
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Include Speakers</span>
            </label>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportOptions.includeTimestamps}
                onChange={(e) => setExportOptions(prev => ({
                  ...prev,
                  includeTimestamps: e.target.checked
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Include Timestamps</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Font Size
            </label>
            <input
              type="number"
              value={exportOptions.styleOptions?.fontSize}
              onChange={(e) => setExportOptions(prev => ({
                ...prev,
                styleOptions: {
                  ...prev.styleOptions,
                  fontSize: parseInt(e.target.value)
                }
              }))}
              className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              min="8"
              max="72"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Page Size
            </label>
            <select
              value={exportOptions.styleOptions?.pageSize}
              onChange={(e) => setExportOptions(prev => ({
                ...prev,
                styleOptions: {
                  ...prev.styleOptions,
                  pageSize: e.target.value as 'A4' | 'Letter'
                }
              }))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="Letter">Letter</option>
              <option value="A4">A4</option>
            </select>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {exportFormats.map(({ format, label, icon: Icon }) => (
          <button
            key={format}
            onClick={() => handleExport(format)}
            className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50"
          >
            <Icon className="h-6 w-6 text-gray-600 mb-2" />
            <span className="text-sm font-medium text-gray-900">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}