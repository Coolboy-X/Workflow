import React from 'react';
import { UpcomingBanner } from '../types';
import { GenshinStarIcon } from './icons';

interface PhaseBannerCardProps {
  phase: string;
  version: string;
  characters: UpcomingBanner[];
}

const CharacterDetail: React.FC<{ char: UpcomingBanner }> = ({ char }) => (
    <div className={`p-4 rounded-lg border ${char.rarity === 5 ? 'bg-gradient-to-br from-genshin-gold/20 to-teyvat-blue/10 border-genshin-gold/40' : 'bg-teyvat-blue-dark/50 border-genshin-gold/20'}`}>
        <div className="flex justify-between items-center">
            <h3 className={`font-serif font-bold truncate ${char.rarity === 5 ? 'text-2xl text-white' : 'text-lg text-genshin-gold-light'}`}>
                {char.name}
            </h3>
            <div className={`flex items-center ${char.rarity === 5 ? 'text-yellow-400' : 'text-purple-400'}`}>
                {Array.from({ length: char.rarity }).map((_, i) => <GenshinStarIcon key={i} className="w-4 h-4" />)}
            </div>
        </div>
        <div className="flex items-center justify-start gap-6 text-sm text-genshin-gold-light/80 mt-2">
            <span>{char.element}</span>
            <span>{char.weapon}</span>
        </div>
    </div>
);


const PhaseBannerCard: React.FC<PhaseBannerCardProps> = ({ phase, version, characters }) => {
  const fiveStars = characters.filter(c => c.rarity === 5);
  const fourStars = characters.filter(c => c.rarity === 4);

  return (
    <div className="bg-teyvat-blue/70 border border-genshin-gold/30 rounded-lg shadow-lg flex flex-col transition-all duration-300 backdrop-blur-sm overflow-hidden">
      <header className="p-4 bg-black/20 border-b border-genshin-gold/20">
        <h2 className="text-2xl font-serif text-genshin-gold text-center">Version {version} - Phase {phase}</h2>
      </header>

      <div className="p-4 flex-grow space-y-6">
        {fiveStars.length > 0 && (
          <div>
            <h4 className="font-serif text-lg text-genshin-gold-light/90 text-center mb-3">Featured 5-Star Character{fiveStars.length > 1 ? 's' : ''}</h4>
            <div className="space-y-4">
              {fiveStars.map(char => (
                <CharacterDetail key={char.name} char={char} />
              ))}
            </div>
          </div>
        )}

        {fourStars.length > 0 && (
          <div>
             <h4 className="font-serif text-lg text-genshin-gold-light/90 text-center mb-3 border-t border-genshin-gold/20 pt-6">Featured 4-Star Characters</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fourStars.map(char => (
                <CharacterDetail key={char.name} char={char} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhaseBannerCard;