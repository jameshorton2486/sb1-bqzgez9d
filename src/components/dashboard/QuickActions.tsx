import React from 'react';
import { Play, Upload, Wand2, HelpCircle, Book } from 'lucide-react';

export function QuickActions() {
  const actions = [
    {
      icon: Play,
      title: "New Transcription",
      description: "Start a new transcription session",
      color: "bg-green-600",
    },
    {
      icon: Upload,
      title: "Upload Audio",
      description: "Import audio files for transcription",
      color: "bg-blue-600",
    },
    {
      icon: Wand2,
      title: "AI Enhancement",
      description: "Improve transcription quality",
      color: "bg-purple-600",
    },
    {
      icon: HelpCircle,
      title: "Get Support",
      description: "Contact technical support",
      color: "bg-orange-600",
    },
    {
      icon: Book,
      title: "Resources",
      description: "Access training materials",
      color: "bg-teal-600",
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        
        <div className="grid grid-cols-1 gap-4">
          {actions.map((action, index) => (
            <button
              key={index}
              className="flex items-center p-4 rounded-lg border hover:shadow-md transition-shadow"
            >
              <div className={`${action.color} p-3 rounded-lg`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 text-left">
                <h3 className="text-lg font-medium text-gray-900">{action.title}</h3>
                <p className="text-sm text-gray-500">{action.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}