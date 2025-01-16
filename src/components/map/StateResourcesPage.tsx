import React from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Link, Download, ExternalLink } from 'lucide-react';

export function StateResourcesPage() {
  const { state } = useParams<{ state: string }>();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Legal Resources for {state?.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Forms & Documents */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <FileText className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">Forms & Documents</h2>
          </div>
          <ul className="space-y-3">
            <li>
              <a href="#" className="flex items-center text-blue-600 hover:text-blue-800">
                <Download className="h-4 w-4 mr-2" />
                Court Reporter Application
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center text-blue-600 hover:text-blue-800">
                <Download className="h-4 w-4 mr-2" />
                Certification Renewal Form
              </a>
            </li>
          </ul>
        </div>

        {/* Useful Links */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <Link className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">Useful Links</h2>
          </div>
          <ul className="space-y-3">
            <li>
              <a href="#" className="flex items-center text-blue-600 hover:text-blue-800">
                <ExternalLink className="h-4 w-4 mr-2" />
                State Court Website
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center text-blue-600 hover:text-blue-800">
                <ExternalLink className="h-4 w-4 mr-2" />
                Court Reporter Association
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <FileText className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">Contact Information</h2>
          </div>
          <div className="space-y-3 text-gray-600">
            <p>State Board of Court Reporting</p>
            <p>Phone: (555) 123-4567</p>
            <p>Email: board@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}