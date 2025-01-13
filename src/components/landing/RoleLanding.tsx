import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Gavel, Mic, Video, Edit3, Users, 
  Shield, Clock, DollarSign, CheckCircle,
  BookOpen, Award, Lock
} from 'lucide-react';

interface RoleFeature {
  icon: React.ElementType;
  title: string;
  description: string;
}

interface RoleProps {
  role: 'attorney' | 'court_reporter' | 'scopist' | 'videographer' | 'admin';
  title: string;
  description: string;
  features: RoleFeature[];
  benefits: string[];
  pricing: {
    monthly: number;
    annual: number;
  };
}

const roleData: Record<string, RoleProps> = {
  attorney: {
    role: 'attorney',
    title: 'Attorney Portal',
    description: 'Streamline your deposition workflow with advanced case management and real-time collaboration tools.',
    features: [
      {
        icon: Shield,
        title: 'Secure Case Management',
        description: 'Organize and access case materials with bank-level security'
      },
      {
        icon: Clock,
        title: 'Real-Time Access',
        description: 'View live transcription and participate in remote depositions'
      },
      {
        icon: Users,
        title: 'Team Collaboration',
        description: 'Share exhibits and notes with your legal team in real-time'
      }
    ],
    benefits: [
      'Instant access to certified transcripts',
      'Secure document sharing and storage',
      'Advanced search and annotation tools',
      'Integrated video conferencing',
      'Custom exhibit management'
    ],
    pricing: {
      monthly: 199,
      annual: 1990
    }
  },
  court_reporter: {
    role: 'court_reporter',
    title: 'Court Reporter Suite',
    description: 'Professional tools designed specifically for certified court reporters, featuring AI-enhanced transcription and real-time editing.',
    features: [
      {
        icon: Mic,
        title: 'AI-Enhanced Transcription',
        description: 'State-of-the-art speech recognition with custom dictionary support'
      },
      {
        icon: Edit3,
        title: 'Real-Time Editing',
        description: 'Professional editing interface with instant formatting'
      },
      {
        icon: Lock,
        title: 'Certification Tools',
        description: 'Digital certification and secure transcript delivery'
      }
    ],
    benefits: [
      'Custom dictionary management',
      'Audio synchronization',
      'Multiple output formats',
      'Automated backup',
      'Client portal integration'
    ],
    pricing: {
      monthly: 149,
      annual: 1490
    }
  },
  // Add other roles similarly
};

export function RoleLanding({ role }: { role: string }) {
  const data = roleData[role];
  if (!data) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
              {data.title}
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              {data.description}
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              <Link
                to="/signup"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Start Free Trial
              </Link>
              <Link
                to="/demo"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Request Demo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {data.features.map((feature, index) => (
              <div
                key={index}
                className="relative p-6 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="absolute top-6 left-6 bg-blue-100 rounded-lg p-3">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="pt-20">
                  <h3 className="text-lg font-medium text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-base text-gray-500">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Benefits & Features
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything you need to streamline your workflow
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
            {data.benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-start"
              >
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <p className="ml-3 text-lg text-gray-600">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Choose the plan that works best for you
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:max-w-4xl lg:mx-auto">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <h3 className="text-xl font-semibold text-gray-900">Monthly</h3>
              <p className="mt-4 text-gray-600">Perfect for getting started</p>
              <p className="mt-8">
                <span className="text-4xl font-bold text-gray-900">
                  ${data.pricing.monthly}
                </span>
                <span className="text-gray-500">/month</span>
              </p>
              <button className="mt-8 w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700">
                Get Started
              </button>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-8 border-blue-200 ring-1 ring-blue-200">
              <h3 className="text-xl font-semibold text-gray-900">Annual</h3>
              <p className="mt-4 text-gray-600">Save 17% with annual billing</p>
              <p className="mt-8">
                <span className="text-4xl font-bold text-gray-900">
                  ${Math.round(data.pricing.annual / 12)}
                </span>
                <span className="text-gray-500">/month</span>
              </p>
              <button className="mt-8 w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700">
                Get Started
              </button>
              <p className="mt-2 text-sm text-gray-500 text-center">
                Billed annually at ${data.pricing.annual}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}