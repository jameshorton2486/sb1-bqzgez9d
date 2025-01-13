import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, Users, FileText, Video, Settings, 
  HelpCircle, Shield, Book, Calendar, MessageSquare,
  Briefcase, Scale, Award, Database, Lock
} from 'lucide-react';

interface SitemapSection {
  title: string;
  icon: React.ElementType;
  links: {
    title: string;
    path: string;
    description?: string;
  }[];
}

const sitemapData: SitemapSection[] = [
  {
    title: 'Main Navigation',
    icon: Home,
    links: [
      { title: 'Home', path: '/', description: 'Return to homepage' },
      { title: 'Dashboard', path: '/dashboard', description: 'Access your personalized dashboard' },
      { title: 'Calendar', path: '/calendar', description: 'View and manage depositions' },
      { title: 'Messages', path: '/messages', description: 'Communication center' }
    ]
  },
  {
    title: 'Role-Specific Pages',
    icon: Users,
    links: [
      { title: 'Attorneys', path: '/roles/attorney', description: 'Attorney portal and resources' },
      { title: 'Court Reporters', path: '/roles/court_reporter', description: 'Court reporter tools and features' },
      { title: 'Videographers', path: '/roles/videographer', description: 'Video management tools' },
      { title: 'Scopists', path: '/roles/scopist', description: 'Transcript editing tools' }
    ]
  },
  {
    title: 'Resources',
    icon: Book,
    links: [
      { title: 'Training Center', path: '/training', description: 'Educational materials and guides' },
      { title: 'Documentation', path: '/docs', description: 'Platform documentation' },
      { title: 'Best Practices', path: '/best-practices', description: 'Industry guidelines' },
      { title: 'Downloads', path: '/downloads', description: 'Software and templates' }
    ]
  },
  {
    title: 'Support',
    icon: HelpCircle,
    links: [
      { title: 'Help Center', path: '/help', description: 'Get assistance' },
      { title: 'Contact Support', path: '/support', description: 'Reach our support team' },
      { title: 'FAQs', path: '/faqs', description: 'Frequently asked questions' },
      { title: 'System Status', path: '/status', description: 'Platform status updates' }
    ]
  },
  {
    title: 'Legal & Compliance',
    icon: Scale,
    links: [
      { title: 'Terms of Service', path: '/terms', description: 'Terms and conditions' },
      { title: 'Privacy Policy', path: '/privacy', description: 'Data privacy information' },
      { title: 'Security', path: '/security', description: 'Security measures' },
      { title: 'Compliance', path: '/compliance', description: 'Regulatory compliance' }
    ]
  }
];

export function Sitemap() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Site Map</h1>
          <p className="mt-4 text-lg text-gray-600">
            Complete overview of LegalDepo Pro's structure and navigation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sitemapData.map((section, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <section.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="ml-3 text-xl font-semibold text-gray-900">
                  {section.title}
                </h2>
              </div>
              <ul className="space-y-4">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      to={link.path}
                      className="group block p-3 rounded-lg hover:bg-gray-50"
                    >
                      <div className="font-medium text-gray-900 group-hover:text-blue-600">
                        {link.title}
                      </div>
                      {link.description && (
                        <div className="mt-1 text-sm text-gray-500">
                          {link.description}
                        </div>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Calendar, title: 'Schedule Deposition', path: '/calendar' },
              { icon: Video, title: 'Join Session', path: '/sessions' },
              { icon: FileText, title: 'View Transcripts', path: '/transcripts' },
              { icon: Database, title: 'Manage Exhibits', path: '/exhibits' },
              { icon: Lock, title: 'Security Settings', path: '/settings/security' },
              { icon: Award, title: 'Certifications', path: '/certifications' },
              { icon: MessageSquare, title: 'Support Chat', path: '/support/chat' },
              { icon: Briefcase, title: 'Case Management', path: '/cases' }
            ].map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="flex items-center p-3 rounded-lg hover:bg-gray-50"
              >
                <item.icon className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-sm font-medium text-gray-700">
                  {item.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}