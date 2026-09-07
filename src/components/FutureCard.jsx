import React, { useState } from 'react';
import { Circle } from 'lucide-react';
import AdultAvatar from './AdultAvatar.jsx';
import { perspectiveKeys } from '../content/shared.js';

const FutureCard = ({ future }) => {
  const [activeTab, setActiveTab] = useState('achievements');

  return (
    <div className="min-w-0 transition-all duration-700 opacity-0 translate-y-3 animate-[cardFadeIn_0.7s_ease-out_forwards] bg-gradient-to-b from-gray-800/80 to-gray-900/80 rounded-2xl p-5 sm:p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl hover:shadow-2xl hover:border-gray-600/50 hover:-translate-y-1">
      <div className="flex flex-col items-center mb-8">
        <AdultAvatar future={future} />
        <h3 className="text-2xl font-bold text-white mt-6 mb-2">{future.name}</h3>
        <div className="mx-auto mt-2 mb-4 w-16 h-[2px] bg-white/20 rounded-full" />
        <p className="text-lg text-gray-300 text-center">{future.subtitle}</p>
      </div>

      <p className="text-gray-200 leading-relaxed mb-8 max-w-[720px] mx-auto">
        {future.description}
      </p>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-1 sm:gap-2 border-b border-gray-700" role="group" aria-label={`Perspectivas: ${future.name}`}>
          {perspectiveKeys.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              aria-pressed={activeTab === tab}
              className={`px-3 sm:px-4 py-3 font-medium transition-colors ${
                activeTab === tab
                  ? 'text-white border-b-2 border-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab === 'achievements' && 'Logros'}
              {tab === 'wounds' && 'Heridas'}
              {tab === 'risks' && 'Riesgos'}
            </button>
          ))}
        </div>

        <ul className="space-y-3">
          {future[activeTab].map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 text-gray-300">
              <Circle className="w-2 h-2 mt-2 flex-shrink-0 fill-current" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FutureCard;
