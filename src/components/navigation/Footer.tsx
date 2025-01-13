import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Info, FileText, Shield, HelpCircle, BookOpen, 
  Activity, Map, Accessibility, Scale
} from 'lucide-react';

export function Footer() {
  const footerSections = [
    {
      title: 'Company',
      items: [
        { label: 'About Us', path: '/about', icon: Info },
        { label: 'Terms of Service', path: '/terms', icon: FileText },
        { label: 'Privacy Policy', path: '/privacy', icon: Shield }
      ]
    },
    {
      title: 'Support',
      items: [
        { label: 'Help Center', path: '/help', icon: HelpCircle },
        { label: 'Training Center', path: '/training', icon: BookOpen },
        { label: 'System Status', path: '/status', icon: Activity }
      ]
    },
    {
      title: 'Resources',
      items: [
        { label: 'Site Map', path: '/sitemap', icon: Map },
        { label: 'Accessibility', path: '/accessibility', icon: Accessibility },
        { label: 'Legal Notices', path: '/legal', icon: Scale }
      ]
    }
  ];

  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className="flex items-center text-gray-300 hover:text-white transition-colors"
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} LegalDepo Pro. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <Link to="/contact" className="text-gray-400 hover:text-white">
                Contact
              </Link>
              <Link to="/faq" className="text-gray-400 hover:text-white">
                FAQ
              </Link>
              <a 
                href="https://status.legaldepo.pro" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                System Status
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}