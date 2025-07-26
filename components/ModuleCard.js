import Link from 'next/link';
import { useState } from 'react';
import { moduleData } from '../lib/moduleData';

export default function ModuleCard({ moduleNumber, locked, userPaid }) {
  const [imageError, setImageError] = useState(false);
  const module = moduleData.find(m => m.id === moduleNumber);
  
  if (!module) return null;

  return (
    <div className={`relative rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${
      locked ? 'bg-gray-800 opacity-75' : 'bg-gradient-to-br from-blue-900 to-purple-900 hover:scale-105'
    }`}>
      {/* Module Image/Thumbnail */}
      <div className="relative h-32 bg-gradient-to-r from-blue-600 to-purple-600">
        {!imageError && (
          <img 
            src={module.thumbnail}
            alt={module.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-2xl font-bold mb-1">Module {moduleNumber}</div>
            <div className="text-sm opacity-90">{module.duration}</div>
          </div>
        </div>
        {locked && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Module Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
          {module.title}
        </h3>
        <p className="text-blue-200 text-sm mb-3 line-clamp-2">
          {module.description}
        </p>
        
        {/* Tools */}
        <div className="flex flex-wrap gap-1 mb-3">
          {module.tools.slice(0, 2).map((tool, idx) => (
            <span key={idx} className="px-2 py-1 bg-blue-600 bg-opacity-50 text-blue-100 text-xs rounded">
              {tool}
            </span>
          ))}
          {module.tools.length > 2 && (
            <span className="px-2 py-1 bg-gray-600 bg-opacity-50 text-gray-300 text-xs rounded">
              +{module.tools.length - 2} more
            </span>
          )}
        </div>

        {/* Earnings */}
        <div className="text-green-400 text-sm font-semibold mb-3">
          💰 {module.earnings}
        </div>

        {/* Action Button */}
        {locked ? (
          <div className="text-center">
            <span className="text-gray-400 text-sm">🔒 Purchase to Unlock</span>
          </div>
        ) : (
          <Link href={`/module/${moduleNumber}`}>
            <a className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-center py-2 px-4 rounded-lg font-semibold transition-all duration-300">
              Start Module
            </a>
          </Link>
        )}
      </div>
    </div>
  );
}