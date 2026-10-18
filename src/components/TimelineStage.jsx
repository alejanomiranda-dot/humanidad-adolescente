import React, { useState } from 'react';
import { Circle } from 'lucide-react';
import Avatar from './Avatar.jsx';
import { perspectiveKeys } from '../content/shared.js';

const TimelineStage = ({ stage, isActive, onReadingChange }) => {
  const [activeTab, setActiveTab] = useState('achievements');

  return (
    <div hidden={!isActive} id={`stage-${stage.id}`} role="group" aria-labelledby={`stage-title-${stage.id}`}>
      <div className="flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto">
        {/* Avatar */}
        <div className="flex-shrink-0 flex flex-col items-center my-8 lg:my-12">
          <Avatar stage={stage} isActive={isActive} />
          <div className="mt-8 text-center">
            <div className="text-2xl font-bold text-white">{stage.age_label}</div>
            <div className="text-sm text-gray-400 mt-1">{stage.age_real}</div>
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-6">
          <div>
            <h2 id={`stage-title-${stage.id}`} className="text-3xl lg:text-4xl font-bold text-white mb-2">
              {stage.title}
            </h2>
            <div className="mx-auto mt-4 mb-8 w-16 h-[2px] bg-white/20 rounded-full" />
            <p className="text-xl text-gray-300 mt-3">{stage.subtitle}</p>
          </div>

          <p className="text-gray-200 leading-relaxed text-lg max-w-[720px] mt-8">
            {stage.text}
          </p>

          {/* Tabs */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-1 sm:gap-2 border-b border-gray-700" role="group" aria-label={`Perspectivas: ${stage.age_label}`}>
              {perspectiveKeys.map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); onReadingChange(); }}
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
              {stage[activeTab].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-gray-300">
                  <Circle className="w-2 h-2 mt-2 flex-shrink-0 fill-current" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineStage;
