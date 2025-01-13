import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Calendar, Clock, Bell, Mic, FileText, BarChart2, Settings,
  Upload, HelpCircle, Book, Menu, Wifi, User, LogOut
} from 'lucide-react';
import { DepositionCalendar } from './DepositionCalendar';
import { TranscriptionTool } from '../transcription/TranscriptionTool';
import { SecurityPanel } from './SecurityPanel';
import { RecentWork } from './RecentWork';
import { PerformanceMetrics } from './PerformanceMetrics';
import { QuickActions } from './QuickActions';
import { Notifications } from './Notifications';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'transcription' | 'documents' | 'analytics' | 'settings' | 'support'>('calendar');

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'calendar':
        return (
          <>
            <div className="col-span-12 xl:col-span-8">
              <DepositionCalendar />
            </div>
            <div className="col-span-12 xl:col-span-4">
              <QuickActions />
            </div>
          </>
        );
      case 'transcription':
        return (
          <div className="col-span-12">
            <TranscriptionTool />
          </div>
        );
      case 'documents':
        return (
          <div className="col-span-12">
            <RecentWork />
          </div>
        );
      case 'analytics':
        return (
          <div className="col-span-12">
            <PerformanceMetrics />
          </div>
        );
      case 'settings':
        return (
          <div className="col-span-12">
            <SecurityPanel />
          </div>
        );
      case 'support':
        return (
          <div className="col-span-12 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Support Center</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900">Need Help?</h3>
                <p className="text-blue-700">Our support team is available 24/7 to assist you.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="p-4 border rounded-lg hover:bg-gray-50 flex items-center">
                  <Book className="h-5 w-5 text-blue-600 mr-2" />
                  Documentation
                </button>
                <button className="p-4 border rounded-lg hover:bg-gray-50 flex items-center">
                  <HelpCircle className="h-5 w-5 text-blue-600 mr-2" />
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm fixed w-full z-10">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="ml-4 text-xl font-semibold text-gray-900">LegalDepo Pro</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center text-green-500">
                <Wifi className="h-5 w-5" />
                <span className="ml-1 text-sm">Connected</span>
              </div>

              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
              </button>

              <div className="flex items-center">
                <img
                  className="h-8 w-8 rounded-full"
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || '')}&background=0D8ABC&color=fff`}
                  alt="Profile"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">{user?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {showNotifications && (
          <Notifications onClose={() => setShowNotifications(false)} />
        )}
      </header>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 bg-gray-800 w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out z-20`}>
        <nav className="mt-16 px-2 space-y-1">
          <SidebarLink 
            icon={Calendar} 
            text="Calendar" 
            active={activeTab === 'calendar'} 
            onClick={() => setActiveTab('calendar')}
          />
          <SidebarLink 
            icon={Mic} 
            text="Transcription" 
            active={activeTab === 'transcription'}
            onClick={() => setActiveTab('transcription')}
          />
          <SidebarLink 
            icon={FileText} 
            text="Documents" 
            active={activeTab === 'documents'}
            onClick={() => setActiveTab('documents')}
          />
          <SidebarLink 
            icon={BarChart2} 
            text="Analytics" 
            active={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
          />
          <SidebarLink 
            icon={Settings} 
            text="Settings" 
            active={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
          />
          <SidebarLink 
            icon={HelpCircle} 
            text="Support" 
            active={activeTab === 'support'}
            onClick={() => setActiveTab('support')}
          />
          <div className="pt-4 mt-4 border-t border-gray-700">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
            >
              <LogOut className="mr-3 h-6 w-6" />
              Sign Out
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`pt-16 ${sidebarOpen ? 'ml-64' : ''} transition-margin duration-200 ease-in-out`}>
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-12 gap-6">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ icon: Icon, text, active = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
        active
          ? 'bg-gray-900 text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
    >
      <Icon className="mr-3 h-6 w-6" />
      {text}
    </button>
  );
}