import React from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, AlertCircle, Clock, Book } from 'lucide-react';

export function StateRequirementsPage() {
  const { state } = useParams<{ state: string }>();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Court Reporter Requirements for {state?.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Certification Requirements */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
            <h2 className="text-xl font-semibold">Certification Requirements</h2>
          </div>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start">
              <span className="h-5 w-5 text-green-500 mr-2">•</span>
              High school diploma or equivalent
            </li>
            <li className="flex items-start">
              <span className="h-5 w-5 text-green-500 mr-2">•</span>
              Graduate from an approved court reporting program
            </li>
            <li className="flex items-start">
              <span className="h-5 w-5 text-green-500 mr-2">•</span>
              Pass state certification exam
            </li>
          </ul>
        </div>

        {/* Continuing Education */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Book className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">Continuing Education</h2>
          </div>
          <div className="space-y-3 text-gray-600">
            <p>Required Hours: 30 hours every 2 years</p>
            <p>Must include:</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>10 hours of technology training</li>
              <li>5 hours of ethics</li>
              <li>15 hours of general credits</li>
            </ul>
          </div>
        </div>

        {/* Important Deadlines */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Clock className="h-6 w-6 text-orange-600 mr-2" />
            <h2 className="text-xl font-semibold">Important Deadlines</h2>
          </div>
          <ul className="space-y-3 text-gray-600">
            <li>Renewal Period: Every 2 years</li>
            <li>CE Completion Deadline: December 31st</li>
            <li>License Renewal: January 31st</li>
          </ul>
        </div>

        {/* Special Requirements */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-6 w-6 text-purple-600 mr-2" />
            <h2 className="text-xl font-semibold">Special Requirements</h2>
          </div>
          <ul className="space-y-3 text-gray-600">
            <li>Professional liability insurance required</li>
            <li>Notary public certification recommended</li>
            <li>Background check required for initial certification</li>
          </ul>
        </div>
      </div>
    </div>
  );
}