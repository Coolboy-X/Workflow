import React, { useEffect } from 'react';
import { RedemptionCode } from '../types';
import { useCountdown } from '../hooks/useCountdown';
import { formatExpiry } from '../utils/dateUtils';
import { CopyIcon, ExternalLinkIcon, GiftIcon } from './icons';

interface CodeCardProps {
  codeData: RedemptionCode;
  onCopy: (message: string) => void;
  onExpire: (code: string) => void;
}

const CodeCard: React.FC<CodeCardProps> = ({ codeData, onCopy, onExpire }) => {
  const { code, rewards, regions, expiry } = codeData;
  const timeLeft = useCountdown(expiry);
  const isExpiringSoon = timeLeft && timeLeft.days < 3;
  const isExpired = !timeLeft;

  useEffect(() => {
    if (isExpired) {
      onExpire(code);
    }
  }, [isExpired, onExpire, code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    onCopy(`Copied "${code}" to clipboard!`);
  };

  const handleRedeem = () => {
    window.open(`https://genshin.hoyoverse.com/en/gift?code=${code}`, '_blank');
  };

  const renderExpiryInfo = () => {
    if (isExpired) {
      return <p className="font-semibold text-gray-500">Expired</p>;
    }

    // For codes expiring soon ("limited codes")
    if (isExpiringSoon && timeLeft) {
      const expiryStatus = `${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m`;
      return (
        <div>
          <p className="text-lg font-semibold text-red-400">{expiryStatus}</p>
          <p className="text-xs text-genshin-gold-light/60 mt-1">
            Expires on {formatExpiry(expiry)}
          </p>
        </div>
      );
    }

    // For "active codes" not expiring soon
    return (
      <div>
        <p className="text-lg font-semibold text-green-400">Active</p>
        {/* The specific expiry date is hidden for active codes to declutter the UI */}
      </div>
    );
  };
  
  // Don't render anything if the code has expired.
  // The useEffect hook will have already triggered the parent to remove it.
  if (isExpired) {
    return null;
  }

  return (
    <div className="relative bg-teyvat-blue/70 border border-genshin-gold/30 rounded-lg shadow-lg flex flex-col transition-all duration-300 hover:shadow-genshin-gold/20 hover:border-genshin-gold/60 backdrop-blur-sm">
      <div className="p-5 flex-grow">
        <div className="mb-4">
          <p className="text-genshin-gold-light/70 text-sm mb-1 font-serif">Redemption Code</p>
          <div className="flex items-center justify-between gap-2 p-3 bg-teyvat-blue-dark/50 rounded-md border border-genshin-gold/20">
            <span className="text-lg font-bold tracking-widest text-genshin-gold-light select-all">{code}</span>
            <button onClick={handleCopy} className="p-2 text-genshin-gold/70 hover:text-genshin-gold-light rounded-full hover:bg-genshin-gold/20 transition-colors" title="Copy code">
              <CopyIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 text-genshin-gold-light/70 text-sm mb-1 font-serif">
            <GiftIcon className="w-4 h-4" />
            <span>Rewards</span>
          </div>
          <p className="text-genshin-gold-light">{rewards}</p>
        </div>
        
        <div className="mb-5">
          <p className="text-genshin-gold-light/70 text-sm mb-2 font-serif">Regions</p>
          <div className="flex flex-wrap gap-2">
            {regions.map(region => (
              <span key={region} className="text-xs font-semibold bg-teyvat-blue-dark/60 text-genshin-gold-light px-2.5 py-1 rounded-full border border-genshin-gold/30">{region}</span>
            ))}
          </div>
        </div>

        <div className="border-t border-genshin-gold/20 pt-4">
          <p className="text-genshin-gold-light/70 text-sm mb-1 font-serif">{isExpiringSoon ? 'Expires In' : 'Status'}</p>
          {renderExpiryInfo()}
        </div>
      </div>
      
      <div className="bg-black/20 p-3 rounded-b-lg mt-auto">
        <button 
          onClick={handleRedeem} 
          disabled={isExpired}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-md hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-teyvat-blue focus:ring-blue-400 disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <ExternalLinkIcon className="w-5 h-5" />
          Redeem Now
        </button>
      </div>
    </div>
  );
};

export default CodeCard;