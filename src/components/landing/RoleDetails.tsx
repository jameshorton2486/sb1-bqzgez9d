import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Gavel, Mic, Video, Edit3, 
  CheckCircle, Shield, Clock, Users,
  Laptop, FileText, Settings, BookOpen,
  Wand2, Headphones, Database, Award
} from 'lucide-react';

const roleData = {
  court_reporter: {
    title: "Court Reporter",
    icon: Mic,
    description: "Empower your court reporting practice with cutting-edge AI technology and professional tools designed specifically for certified court reporters. Our platform streamlines your workflow while maintaining the highest standards of accuracy and professionalism.",
    features: [
      {
        icon: Wand2,
        title: "AI-Enhanced Transcription",
        description: "Advanced AI assistance for faster, more accurate transcripts with custom dictionary support and real-time suggestions."
      },
      {
        icon: Laptop,
        title: "Real-time Editing Suite",
        description: "Professional-grade editing interface with instant formatting, auto-punctuation, and speaker identification."
      },
      {
        icon: Database,
        title: "Custom Dictionary Management",
        description: "Build and maintain comprehensive case-specific dictionaries with automatic term learning."
      },
      {
        icon: Headphones,
        title: "Audio Enhancement",
        description: "Professional audio processing tools for crystal-clear playback and enhanced accuracy."
      }
    ],
    workflows: [
      {
        title: "Pre-Deposition Setup",
        steps: [
          "Review case materials and create custom dictionary entries",
          "Set up audio equipment and test recording quality",
          "Configure real-time streaming settings if required",
          "Verify all participants and their roles"
        ]
      },
      {
        title: "During Deposition",
        steps: [
          "Utilize real-time transcription with AI assistance",
          "Mark exhibits and important testimony",
          "Monitor audio quality and adjust as needed",
          "Track speaker identification and timestamps"
        ]
      },
      {
        title: "Post-Deposition Processing",
        steps: [
          "Review and edit transcript with AI suggestions",
          "Process and enhance audio recordings",
          "Generate formatted transcripts in multiple formats",
          "Secure delivery to authorized parties"
        ]
      }
    ],
    responsibilities: [
      "Capture accurate, verbatim records of legal proceedings",
      "Maintain professional certification and credentials",
      "Ensure confidentiality of sensitive information",
      "Manage and organize case-specific terminology",
      "Deliver certified transcripts within deadlines",
      "Coordinate with legal teams and witnesses"
    ],
    permissions: [
      "Access to professional transcription tools",
      "Custom dictionary management",
      "Audio processing and enhancement",
      "Real-time streaming capabilities",
      "Secure file storage and sharing",
      "Certificate generation and management"
    ]
  },
  // Add other roles here...
};

export function RoleDetails() {
  const { role } = useParams<{ role: keyof typeof roleData }>();
  const navigate = useNavigate();
  const data = role && roleData[role];

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Role not found</h1>
          <Link to="/" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  const Icon = data.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center mb-8">
            <Link to="/" className="text-white/80 hover:text-white mr-4">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <Icon className="h-8 w-8 mr-3" />
            <h1 className="text-3xl font-bold">{data.title}</h1>
          </div>
          <p className="text-xl text-blue-100 max-w-3xl">{data.description}</p>
          <div className="mt-8 flex space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Create Account
            </button>
            <button
              onClick={() => navigate('/login')}
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Features */}
            <section className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Tools</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {data.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <feature.icon className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Workflows */}
            <section className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Workflow Integration</h2>
              <div className="space-y-8">
                {data.workflows.map((workflow, index) => (
                  <div key={index} className="border-b border-gray-200 last:border-0 pb-8 last:pb-0">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">{workflow.title}</h3>
                    <ol className="space-y-4">
                      {workflow.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start">
                          <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium mr-3">
                            {stepIndex + 1}
                          </span>
                          <span className="text-gray-600">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Certification Requirements */}
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Professional Requirements</h2>
              <ul className="space-y-3">
                {data.responsibilities.map((responsibility, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{responsibility}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Platform Access */}
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Access</h2>
              <ul className="space-y-3">
                {data.permissions.map((permission, index) => (
                  <li key={index} className="flex items-start">
                    <Shield className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-600">{permission}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Get Started */}
            <section className="bg-blue-50 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
              <p className="text-gray-600 mb-6">
                Join thousands of professional court reporters using our platform to streamline their work.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Start Free Trial
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}