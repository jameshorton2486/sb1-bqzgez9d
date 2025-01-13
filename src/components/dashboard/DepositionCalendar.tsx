import React from 'react';
import { Calendar, Clock, Users, Video } from 'lucide-react';

export function DepositionCalendar() {
  const depositions = [
    {
      id: 1,
      title: "Smith vs. Johnson Corp",
      time: "10:00 AM",
      type: "Remote",
      participants: 6,
      status: "upcoming",
      zoomLink: "https://zoom.us/j/123456789",
    },
    {
      id: 2,
      title: "Davis Estate Hearing",
      time: "2:30 PM",
      type: "Remote",
      participants: 4,
      status: "upcoming",
      zoomLink: "https://zoom.us/j/987654321",
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Today's Depositions</h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            Schedule New
          </button>
        </div>

        <div className="space-y-4">
          {depositions.map((depo) => (
            <div key={depo.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{depo.title}</h3>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {depo.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-2" />
                  {depo.time}
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Users className="h-5 w-5 mr-2" />
                  {depo.participants} Participants
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Video className="h-5 w-5 mr-2" />
                  {depo.type}
                </div>
                
                <a
                  href={depo.zoomLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center"
                >
                  Join Meeting
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}