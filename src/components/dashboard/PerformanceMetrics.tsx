import React from 'react';
import { BarChart2, TrendingUp, Clock, ThumbsUp } from 'lucide-react';

export function PerformanceMetrics() {
  const metrics = {
    accuracy: 98.5,
    wpm: 180,
    completionRate: 95,
    satisfaction: 4.8
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance Metrics</h2>
        
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <BarChart2 className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Accuracy Rate</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">{metrics.accuracy}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 rounded-full h-2" 
                style={{ width: `${metrics.accuracy}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Words per Minute</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">{metrics.wpm} WPM</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 rounded-full h-2" 
                style={{ width: `${(metrics.wpm / 200) * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Completion Rate</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">{metrics.completionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-yellow-600 rounded-full h-2" 
                style={{ width: `${metrics.completionRate}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <ThumbsUp className="h-5 w-5 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Client Satisfaction</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">{metrics.satisfaction}/5.0</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 rounded-full h-2" 
                style={{ width: `${(metrics.satisfaction / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}