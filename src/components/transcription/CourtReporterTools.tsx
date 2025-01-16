import React, { useState, useCallback } from 'react';
import { transcribeAudio } from '../../lib/whisper';
import type { TranscriptionResult } from '../../lib/whisper';
import { TranscriptionTool } from './TranscriptionTool';
import { AudioEnhancement } from './AudioEnhancement';
import { TranscriptionWorkspace } from './TranscriptionWorkspace';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import { PageHeader } from '../common/PageHeader';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { FileAudio, AlertCircle } from 'lucide-react';

export function CourtReporterTools() {
  const { isCourtReporter, loading } = useRoleAccess();
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const handleTranscriptionComplete = useCallback((result: TranscriptionResult) => {
    setTranscriptionResult(result);
    setError(null);
  }, []);

  const handleError = useCallback((error: Error) => {
    setError(error);
    setTranscriptionResult(null);
  }, []);

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
        <div className="space-y-6">
          <TranscriptionTool
            onTranscriptionComplete={handleTranscriptionComplete}
            onError={handleError}
          />
          <AudioEnhancement />
        </div>

        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error.message}</div>
                </div>
              </div>
            </div>
          )}

          {transcriptionResult && (
            <TranscriptionWorkspace
              transcriptionResult={transcriptionResult}
              onError={handleError}
            />
          )}
        </div>
      </div>
    </div>
  );
}