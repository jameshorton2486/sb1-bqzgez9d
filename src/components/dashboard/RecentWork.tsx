import React from 'react';
import { FileText, Download, Share2, Clock } from 'lucide-react';

export function RecentWork() {
  const recentTranscripts = [
    {
      id: 1,
      title: "Johnson vs Smith Corp - Initial Hearing",
      completion: 100,
      deadline: "2024-02-20",
      status: "completed",
      accuracy: 99.5,
    },
    {
      id: 2,
      title: "Davis Estate Deposition",
      completion: 85,
      deadline: "2024-02-22",
      status: "in_progress",
      accuracy: 98.2,
    },
    {
      id: 3,
      title: "Tech Corp Patent Dispute",
      completion: 60,
      deadline: "2024-02-25",
      status: "in_progress",
      accuracy: 97.8,
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Work</h2>
        
        <div className="space-y-4">
          {recentTranscripts.map((transcript) => (
            <div key={transcript.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">{transcript.title}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  transcript.status === 'completed' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {transcript.status === 'completed' ? 'Completed' : 'In Progress'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-2" />
                  Due: {transcript.deadline}
                </div>
                <div className="flex items-center text-gray-600">
                  Accuracy: {transcript.accuracy}%
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </button>
                <button className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800">
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </button>
                <button className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800">
                  <FileText className="h-4 w-4 mr-1" />
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}