import React from 'react';
import { Bell, Calendar, FileText, AlertCircle } from 'lucide-react';

export function Notifications({ onClose }) {
  const notifications = [
    {
      id: 1,
      type: "upcoming",
      title: "Upcoming Deposition",
      message: "Smith vs. Johnson Corp in 30 minutes",
      time: "10 minutes ago",
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      id: 2,
      type: "system",
      title: "Transcription Complete",
      message: "Davis Estate Hearing transcript is ready for review",
      time: "1 hour ago",
      icon: FileText,
      color: "text-green-600",
    },
    {
      id: 3,
      type: "alert",
      title: "System Update",
      message: "New features available. Click to learn more.",
      time: "2 hours ago",
      icon: AlertCircle,
      color: "text-yellow-600",
    }
  ];

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-1 z-50">
      <div className="px-4 py-2 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close notifications</span>
            <Bell className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
          >
            <div className="flex items-start">
              <div className={`${notification.color} flex-shrink-0`}>
                <notification.icon className="h-6 w-6" />
              </div>
              <div className="ml-3 w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {notification.title}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {notification.message}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {notification.time}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-2 border-t">
        <button
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View all notifications
        </button>
      </div>
    </div>
  );
}