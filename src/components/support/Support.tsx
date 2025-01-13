import React from 'react';
import { 
  HelpCircle, MessageSquare, Book, Video,
  Phone, Mail, ExternalLink, Search
} from 'lucide-react';

export function Support() {
  const supportCategories = [
    {
      title: "Getting Started",
      icon: Book,
      description: "Learn the basics of using our platform",
      articles: [
        "Platform Overview",
        "Setting Up Your Account",
        "First Deposition Guide"
      ]
    },
    {
      title: "Technical Support",
      icon: HelpCircle,
      description: "Resolve technical issues and get help",
      articles: [
        "System Requirements",
        "Troubleshooting Guide",
        "Common Issues"
      ]
    },
    {
      title: "Training Resources",
      icon: Video,
      description: "Access training videos and tutorials",
      articles: [
        "Video Tutorials",
        "Best Practices",
        "Tips & Tricks"
      ]
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Support Center</h1>
        <p className="mt-2 text-gray-600">
          Find help and resources to make the most of our platform
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for help..."
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Quick Contact */}
      <div className="mb-8">
        <div className="bg-blue-50 rounded-lg p-6">
          <h2 className="text-lg font-medium text-blue-900 mb-4">Need Immediate Assistance?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
              <Phone className="h-5 w-5 text-blue-600 mr-3" />
              <span>Call Support</span>
            </button>
            <button className="flex items-center p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
              <MessageSquare className="h-5 w-5 text-blue-600 mr-3" />
              <span>Live Chat</span>
            </button>
            <button className="flex items-center p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
              <Mail className="h-5 w-5 text-blue-600 mr-3" />
              <span>Email Support</span>
            </button>
          </div>
        </div>
      </div>

      {/* Help Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {supportCategories.map((category, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <category.icon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900">{category.title}</h3>
            </div>
            <p className="text-gray-600 mb-4">{category.description}</p>
            <ul className="space-y-2">
              {category.articles.map((article, idx) => (
                <li key={idx}>
                  <button className="flex items-center text-blue-600 hover:text-blue-700">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    <span className="text-sm">{article}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* FAQs */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              question: "How do I schedule a deposition?",
              answer: "You can schedule a deposition by navigating to the Calendar section and clicking the 'New Event' button. Follow the guided process to set up your deposition."
            },
            {
              question: "What are the system requirements?",
              answer: "Our platform works best with modern browsers like Chrome, Firefox, or Safari. You'll need a stable internet connection and updated browser version."
            },
            {
              question: "How do I share exhibits during a deposition?",
              answer: "During a deposition, use the 'Share Exhibit' button in the control panel. You can upload documents and control who can view them."
            }
          ].map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-medium text-gray-900 mb-2">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}