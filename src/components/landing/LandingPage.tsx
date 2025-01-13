import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, Clock, DollarSign, Users, 
  Gavel, Mic, Video, Edit3,
  CheckCircle, Award, Lock, FileText,
  Wand2, Laptop, Database, Headphones,
  Zap, BookOpen, CloudLightning, ChevronRight
} from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-bold text-white tracking-tight">
                Professional Legal
                <span className="block text-blue-400">Deposition Platform</span>
              </h1>
              <p className="mt-6 text-xl text-gray-300 leading-relaxed max-w-2xl">
                Transform your legal practice with AI-powered court reporting, 99.9% accurate transcription, and intelligent scheduling. Join thousands of legal professionals streamlining their workflow.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                >
                  Start Free Trial
                </Link>
                <Link
                  to="/demo"
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-base font-medium rounded-lg text-white hover:bg-white/10 transition-colors duration-200"
                >
                  Request Demo
                </Link>
              </div>
              <div className="mt-8 flex items-center justify-center lg:justify-start space-x-8">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-green-400" />
                  <span className="ml-2 text-gray-300">HIPAA Compliant</span>
                </div>
                <div className="flex items-center">
                  <Lock className="h-5 w-5 text-green-400" />
                  <span className="ml-2 text-gray-300">Bank-Level Security</span>
                </div>
              </div>
            </div>
            
            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 transform hover:scale-105 transition-transform duration-200">
                <Wand2 className="h-8 w-8 text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold text-white">AI-Enhanced Transcription</h3>
                <p className="mt-2 text-gray-300">Real-time transcription with advanced speaker identification</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 transform hover:scale-105 transition-transform duration-200">
                <Video className="h-8 w-8 text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold text-white">Remote Depositions</h3>
                <p className="mt-2 text-gray-300">Secure video conferencing with exhibit sharing</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 transform hover:scale-105 transition-transform duration-200">
                <Database className="h-8 w-8 text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold text-white">Smart Storage</h3>
                <p className="mt-2 text-gray-300">Automated backup and intelligent organization</p>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 transform hover:scale-105 transition-transform duration-200">
                <Clock className="h-8 w-8 text-blue-400 mb-4" />
                <h3 className="text-lg font-semibold text-white">Scheduling</h3>
                <p className="mt-2 text-gray-300">Intelligent calendar management</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-base text-gray-600 uppercase tracking-wide">Trusted by leading legal professionals</p>
            <div className="mt-8 grid grid-cols-2 gap-8 md:grid-cols-6 lg:grid-cols-5">
              {/* Replace with actual client logos */}
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="col-span-1 flex justify-center md:col-span-2 lg:col-span-1">
                  <div className="h-12 w-32 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Role-Specific Solutions */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Solutions for Every Role</h2>
            <p className="mt-4 text-xl text-gray-600">
              Tailored features for each member of your legal team
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {[
              {
                icon: Gavel,
                title: "Attorneys",
                description: "Streamline your deposition workflow with real-time access and collaboration tools.",
                link: "/roles/attorney"
              },
              {
                icon: Mic,
                title: "Court Reporters",
                description: "Professional tools for accurate transcription and efficient delivery.",
                link: "/roles/court_reporter"
              },
              {
                icon: Video,
                title: "Videographers",
                description: "Integrated video recording and synchronization capabilities.",
                link: "/roles/videographer"
              }
            ].map((role, index) => (
              <Link
                key={index}
                to={role.link}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-lg transition-shadow"
              >
                <role.icon className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900">{role.title}</h3>
                <p className="mt-2 text-gray-600">{role.description}</p>
                <div className="mt-4 flex items-center text-blue-600">
                  Learn more
                  <ChevronRight className="h-5 w-5 ml-2" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}