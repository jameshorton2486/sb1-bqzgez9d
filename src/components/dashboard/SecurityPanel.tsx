import React from 'react';
import { Shield, Key, Clock, FileText } from 'lucide-react';

export function SecurityPanel() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Security & Compliance</h2>
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-green-500" />
          <span className="text-sm text-green-600">HIPAA Compliant</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center mb-2">
              <Key className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-sm font-medium text-gray-700">Encryption Status</h3>
            </div>
            <p className="text-sm text-gray-600">256-bit End-to-End Encryption Active</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center mb-2">
              <Clock className="h-5 w-5 text-blue-600 mr-2" />
              <h3 className="text-sm font-medium text-gray-700">Session Timeout</h3>
            </div>
            <p className="text-sm text-gray-600">15 minutes of inactivity</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Recent Security Events</h3>
          <div className="space-y-3">
            {[
              { time: '10:15 AM', event: 'New login from approved device' },
              { time: '09:30 AM', event: 'Backup completed successfully' },
              { time: '09:00 AM', event: 'Security scan completed' }
            ].map((event, index) => (
              <div key={index} className="flex items-center text-sm">
                <span className="text-gray-500 w-20">{event.time}</span>
                <span className="text-gray-700">{event.event}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Document Security</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <FileText className="h-4 w-4 text-gray-400 mr-2" />
                <span>Auto-backup enabled</span>
              </div>
              <span className="text-green-600">Active</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <FileText className="h-4 w-4 text-gray-400 mr-2" />
                <span>Version control</span>
              </div>
              <span className="text-green-600">Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}