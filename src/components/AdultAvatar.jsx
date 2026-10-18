import React from 'react';

const AdultAvatar = ({ future, size = 200 }) => {
  return (
    <div className="relative flex justify-center items-center">
      <div className="absolute bottom-0 w-32 h-8 bg-black/20 blur-[40px] rounded-full" />
      <div className="relative z-10">
        <svg width={size} height={size + 40} viewBox={`0 0 ${size} ${size + 40}`}>
          <circle cx={size / 2} cy={80 / 2} r={80 / 2} fill={future.color} />
          <circle cx={size / 2 - 10} cy={80 / 2 - 5} r={4} fill="#2C1810" />
          <circle cx={size / 2 + 10} cy={80 / 2 - 5} r={4} fill="#2C1810" />
          <rect
            x={(size - 70) / 2}
            y={80}
            width={70}
            height={120}
            fill={future.color}
            rx={5}
          />
          <rect x={(size - 80) / 2 - 6} y={85} width={6} height={60} fill={future.color} rx={3} />
          <rect x={(size + 80) / 2} y={85} width={6} height={60} fill={future.color} rx={3} />
        </svg>
      </div>
    </div>
  );
};

export default AdultAvatar;
