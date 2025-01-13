import React from 'react';
import { 
  BookOpen, FileText, Video, Download, 
  ExternalLink, Search, Filter, Clock
} from 'lucide-react';

export function Resources() {
  const categories = [
    { id: 'all', label: 'All Resources' },
    { id: 'guides', label: 'User Guides' },
    { id: 'training', label: 'Training Videos' },
    { id: 'templates', label: 'Templates' },
    { id: 'legal', label: 'Legal Documents' }
  ];

  const resources = [
    {
      id: 1,
      title: "Getting Started Guide",
      type: "guide",
      description: "Complete walkthrough of the platform's core features",
      category: "guides",
      lastUpdated: "2024-01-15"
    },
    {
      id: 2,
      title: "Deposition Best Practices",
      type: "video",
      description: "Expert tips for conducting remote depositions",
      category: "training",
      duration: "15 mins"
    },
    {
      id: 3,
      title: "Standard Deposition Template",
      type: "template",
      description: "Pre-formatted template for legal depositions",
      category: "templates",
      format: "DOCX"
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
        <p className="mt-2 text-gray-600">
          Access guides, training materials, and templates to help you work more efficiently
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search resources..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
        <button className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50">
          <Filter className="h-5 w-5 mr-2" />
          Filters
        </button>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {categories.map(category => (
            <button
              key={category.id}
              className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 whitespace-nowrap"
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map(resource => (
          <div key={resource.id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between">
              <div className="p-2 bg-blue-100 rounded-lg">
                {resource.type === 'guide' && <BookOpen className="h-6 w-6 text-blue-600" />}
                {resource.type === 'video' && <Video className="h-6 w-6 text-blue-600" />}
                {resource.type === 'template' && <FileText className="h-6 w-6 text-blue-600" />}
              </div>
              <button className="text-gray-400 hover:text-gray-500">
                <ExternalLink className="h-5 w-5" />
              </button>
            </div>
            
            <h3 className="mt-4 text-lg font-medium text-gray-900">{resource.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{resource.description}</p>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                {resource.lastUpdated || resource.duration || resource.format}
              </div>
              <button className="flex items-center text-blue-600 hover:text-blue-700">
                <Download className="h-4 w-4 mr-1" />
                <span className="text-sm">Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}