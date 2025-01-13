import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Users, Video, MapPin, Plus } from 'lucide-react';

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  const events = [
    {
      id: 1,
      title: "Smith vs Johnson Corp - Deposition",
      date: "2024-02-20",
      time: "10:00 AM",
      type: "Remote",
      participants: 6,
      status: "scheduled"
    },
    {
      id: 2,
      title: "Davis Estate Hearing",
      date: "2024-02-22",
      time: "2:30 PM",
      type: "In-Person",
      location: "123 Legal Street",
      participants: 4,
      status: "confirmed"
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="h-5 w-5 mr-2" />
            New Event
          </button>
        </div>
        
        <div className="mt-4 flex items-center space-x-4">
          <button
            onClick={() => setView('month')}
            className={`px-3 py-1 rounded-md ${
              view === 'month' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setView('week')}
            className={`px-3 py-1 rounded-md ${
              view === 'week' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setView('day')}
            className={`px-3 py-1 rounded-md ${
              view === 'day' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
            }`}
          >
            Day
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {/* Calendar Grid */}
        <div className="p-4">
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="bg-white p-2 h-32 border border-gray-100">
                <div className="text-sm text-gray-400">{i + 1}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="border-t">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h2>
            <div className="space-y-4">
              {events.map(event => (
                <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CalendarIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{event.title}</h3>
                      <div className="mt-1 space-y-1">
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          {event.date} at {event.time}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="h-4 w-4 mr-1" />
                          {event.participants} Participants
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          {event.type === 'Remote' ? (
                            <Video className="h-4 w-4 mr-1" />
                          ) : (
                            <MapPin className="h-4 w-4 mr-1" />
                          )}
                          {event.type}
                          {event.location && ` - ${event.location}`}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    event.status === 'confirmed' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}