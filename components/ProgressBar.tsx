import React from 'react';

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div className="w-full bg-teyvat-blue-dark/50 rounded-full h-2.5 border border-genshin-gold/30 overflow-hidden">
      <div
        className="bg-gradient-to-r from-genshin-gold-light to-genshin-gold h-2 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
