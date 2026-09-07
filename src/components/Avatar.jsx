import React from 'react';
import { avatarConfigs } from '../content/avatars.js';

const Avatar = ({ stage, isActive }) => {
  const config = avatarConfigs[stage.avatar_key];

  return (
    <div className="relative flex justify-center items-center">
      {/* Shadow */}
      <div className="absolute bottom-0 w-20 sm:w-24 md:w-28 h-6 bg-black/20 blur-[40px] rounded-full" />

      {/* Avatar */}
      <div className={`relative z-10 transition-all duration-700 ${isActive ? 'scale-100 opacity-100 animate-[avatarPop_0.4s_ease-out]' : 'scale-90 opacity-0'}`}>
        <svg width={config.size} height={config.size + 40} viewBox={`0 0 ${config.size} ${config.size + 40}`}>
        {/* Head */}
        <circle
          cx={config.size / 2}
          cy={config.head / 2}
          r={config.head / 2}
          fill={config.color}
          className="transition-all duration-700"
        />
        {/* Eyes */}
        <circle cx={config.size / 2 - 8} cy={config.head / 2 - 5} r={3} fill="#2C1810" />
        <circle cx={config.size / 2 + 8} cy={config.head / 2 - 5} r={3} fill="#2C1810" />
        {/* Body */}
        <rect
          x={(config.size - config.body * 0.6) / 2}
          y={config.head}
          width={config.body * 0.6}
          height={config.body}
          fill={config.color}
          rx={5}
          className="transition-all duration-700"
        />
        {/* Arms */}
        <rect
          x={(config.size - config.body * 0.8) / 2 - 5}
          y={config.head + 5}
          width={5}
          height={config.body * 0.5}
          fill={config.color}
          rx={3}
        />
        <rect
          x={(config.size + config.body * 0.8) / 2}
          y={config.head + 5}
          width={5}
          height={config.body * 0.5}
          fill={config.color}
          rx={3}
        />
      </svg>
      <div className="text-center mt-4 text-sm font-medium text-gray-400">
        {stage.age_human}
      </div>
    </div>
    </div>
  );
};

export default Avatar;
