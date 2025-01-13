import React from 'react';
import { 
  Layout, Grid, Box, Monitor, Smartphone, Calendar, FileText,
  BarChart2, Settings, Bell, Search, User, Shield, AlertCircle,
  Video, Mic, Upload, Download, Folder, Clock, CheckCircle,
  Zap, Database, Lock, Eye, MessageSquare
} from 'lucide-react';

export function WireframeDisplay() {
  const [activeView, setActiveView] = React.useState<'desktop' | 'mobile'>('desktop');
  const [selectedSection, setSelectedSection] = React.useState<'dashboard' | 'deposition' | 'documents' | 'analytics'>('dashboard');

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Controls */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Wireframes</h1>
            <p className="text-gray-600 mt-2">Interactive wireframe demonstration for LegalDepo Pro</p>
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={() => setActiveView('desktop')}
              className={`flex items-center px-4 py-2 rounded-md ${
                activeView === 'desktop' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              <Monitor className="w-5 h-5 mr-2" />
              Desktop
            </button>
            <button
              onClick={() => setActiveView('mobile')}
              className={`flex items-center px-4 py-2 rounded-md ${
                activeView === 'mobile'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              <Smartphone className="w-5 h-5 mr-2" />
              Mobile
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Layout },
            { id: 'deposition', label: 'Deposition', icon: Video },
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'analytics', label: 'Analytics', icon: BarChart2 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedSection(tab.id as any)}
              className={`flex items-center px-4 py-2 rounded-md ${
                selectedSection === tab.id
                  ? 'bg-white shadow text-blue-600'
                  : 'text-gray-600 hover:bg-white hover:shadow'
              }`}
            >
              <tab.icon className="w-5 h-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className={`bg-white rounded-lg shadow-lg p-8 ${
          activeView === 'mobile' ? 'max-w-sm mx-auto' : ''
        }`}>
          {/* Global Header */}
          <div className="border-b pb-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg" />
                <span className="text-xl font-semibold">LegalDepo Pro</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-64 pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <Bell className="h-5 w-5 text-gray-600" />
                </button>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200" />
                  <span className="text-sm font-medium">John Doe</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          {selectedSection === 'dashboard' && (
            <div className="space-y-6">
              {/* Priority Alerts */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <h3 className="font-medium text-red-800">Priority Alerts</h3>
                </div>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center text-sm text-red-700">
                    <Clock className="h-4 w-4 mr-2" />
                    Upcoming deposition in 30 minutes
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 border rounded-lg hover:bg-gray-50 flex items-center">
                  <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                  Schedule Deposition
                </button>
                <button className="p-4 border rounded-lg hover:bg-gray-50 flex items-center">
                  <Upload className="h-5 w-5 text-blue-600 mr-2" />
                  Upload Exhibit
                </button>
                <button className="p-4 border rounded-lg hover:bg-gray-50 flex items-center">
                  <Video className="h-5 w-5 text-blue-600 mr-2" />
                  Join Session
                </button>
                <button className="p-4 border rounded-lg hover:bg-gray-50 flex items-center">
                  <FileText className="h-5 w-5 text-blue-600 mr-2" />
                  Generate Report
                </button>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Completed Depositions</div>
                  <div className="text-2xl font-bold mt-1">24</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Pending Reviews</div>
                  <div className="text-2xl font-bold mt-1">7</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Success Rate</div>
                  <div className="text-2xl font-bold mt-1">98%</div>
                </div>
              </div>
            </div>
          )}

          {/* Deposition Interface */}
          {selectedSection === 'deposition' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Active Deposition</h2>
                  <p className="text-gray-600">Case #12345 - Smith vs. Johnson</p>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg">
                    <Mic className="h-5 w-5 mr-2" />
                    Recording
                  </button>
                  <button className="p-2 rounded-lg border hover:bg-gray-50">
                    <Settings className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Video Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-video bg-gray-800 rounded-lg" />
                <div className="aspect-video bg-gray-800 rounded-lg" />
                <div className="aspect-video bg-gray-800 rounded-lg" />
                <div className="aspect-video bg-gray-800 rounded-lg" />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-4">
                <button className="p-3 rounded-full bg-gray-100 hover:bg-gray-200">
                  <Mic className="h-5 w-5" />
                </button>
                <button className="p-3 rounded-full bg-gray-100 hover:bg-gray-200">
                  <Video className="h-5 w-5" />
                </button>
                <button className="p-3 rounded-full bg-gray-100 hover:bg-gray-200">
                  <MessageSquare className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Document Management */}
          {selectedSection === 'documents' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Document Management</h2>
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg">
                  <Upload className="h-5 w-5 mr-2" />
                  Upload Files
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <Folder className="h-8 w-8 text-blue-600 mb-2" />
                  <h3 className="font-medium">Case Documents</h3>
                  <p className="text-sm text-gray-600">128 files</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <FileText className="h-8 w-8 text-blue-600 mb-2" />
                  <h3 className="font-medium">Transcripts</h3>
                  <p className="text-sm text-gray-600">45 files</p>
                </div>
              </div>

              <div className="border rounded-lg">
                <div className="p-4 border-b bg-gray-50">
                  <h3 className="font-medium">Recent Files</h3>
                </div>
                <div className="divide-y">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <div className="font-medium">Document-{i}.pdf</div>
                          <div className="text-sm text-gray-600">2.4 MB</div>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Download className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Analytics */}
          {selectedSection === 'analytics' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Analytics Dashboard</h2>
                <div className="flex items-center space-x-2">
                  <select className="border rounded-lg px-3 py-2">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                  </select>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">Total Cases</div>
                    <Zap className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold mt-1">1,234</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">Success Rate</div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold mt-1">98.5%</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">Active Users</div>
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold mt-1">456</div>
                </div>
              </div>

              {/* Chart Placeholders */}
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-[4/3] bg-gray-50 rounded-lg p-4">
                  <div className="font-medium mb-2">Case Distribution</div>
                  <div className="h-full flex items-center justify-center text-gray-400">
                    Chart Placeholder
                  </div>
                </div>
                <div className="aspect-[4/3] bg-gray-50 rounded-lg p-4">
                  <div className="font-medium mb-2">Performance Trends</div>
                  <div className="h-full flex items-center justify-center text-gray-400">
                    Chart Placeholder
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Security Features */}
        <div className="mt-8 grid grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <Shield className="h-6 w-6 text-green-600 mb-2" />
            <h3 className="font-medium">Multi-Factor Auth</h3>
            <p className="text-sm text-gray-600">Enhanced security</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <Lock className="h-6 w-6 text-blue-600 mb-2" />
            <h3 className="font-medium">Data Encryption</h3>
            <p className="text-sm text-gray-600">End-to-end protection</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <Database className="h-6 w-6 text-purple-600 mb-2" />
            <h3 className="font-medium">Audit Logging</h3>
            <p className="text-sm text-gray-600">Complete tracking</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm">
            <Eye className="h-6 w-6 text-yellow-600 mb-2" />
            <h3 className="font-medium">Access Control</h3>
            <p className="text-sm text-gray-600">Role-based permissions</p>
          </div>
        </div>
      </div>
    </div>
  );
}