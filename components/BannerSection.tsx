import React, { useState, useEffect, useCallback } from 'react';
import { UpcomingBanner, GroundingSource, SourcesUpdateCallback } from '../types';
import { fetchBanners, BANNER_CACHE_DURATION_MS } from '../services/codeService';
import PhaseBannerCard from './BannerCard';
import RefreshTimer from './RefreshTimer';
import ProgressBar from './ProgressBar';
import SourceLogos from './SourceLogos';

const bannerLoadingMessages = [
    'Scrying for future banners...',
    'Consulting official HoYoverse announcements...',
    'Ignoring whispers of leaks and rumors...',
    'Verifying character details...',
    'Preparing the banner overview...',
];

const BannerSection: React.FC = () => {
  const [banners, setBanners] = useState<UpcomingBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [liveSources, setLiveSources] = useState<GroundingSource[]>([]);

  const loadBanners = useCallback(async () => {
    setIsLoading(true);
    setLoadingMessageIndex(0);
    setLiveSources([]);
    
    const handleSourcesUpdate: SourcesUpdateCallback = (updatedSources) => {
        setLiveSources(updatedSources);
    };

    try {
      const { banners: fetchedBanners, lastUpdatedAt: fetchedLastUpdatedAt } = await fetchBanners(handleSourcesUpdate);
      setBanners(fetchedBanners);
      setLastUpdatedAt(fetchedLastUpdatedAt);
    } catch (error) {
      console.error("Failed to load banners:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  useEffect(() => {
    // FIX: Replaced NodeJS.Timeout with ReturnType<typeof setInterval> for browser compatibility.
    let messageIntervalId: ReturnType<typeof setInterval> | undefined;
    if (isLoading) {
        messageIntervalId = setInterval(() => {
            setLoadingMessageIndex(prevIndex => (prevIndex + 1) % bannerLoadingMessages.length);
        }, 2500);
    }
    return () => clearInterval(messageIntervalId);
  }, [isLoading]);

  useEffect(() => {
    // FIX: Replaced NodeJS.Timeout with ReturnType<typeof setInterval> for browser compatibility.
    let progressInterval: ReturnType<typeof setInterval> | undefined;
    if (isLoading) {
        setProgress(0);
        progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 95) {
                    clearInterval(progressInterval!);
                    return prev;
                }
                const increment = prev > 80 ? Math.random() * 2 : Math.random() * 10;
                return Math.min(95, prev + increment);
            });
        }, 600);
    } else {
        setProgress(100);
    }
    return () => clearInterval(progressInterval);
  }, [isLoading]);

  const currentVersion = banners.length > 0 ? banners[0].version : null;
  const bannerStatus = banners.length > 0 ? banners[0].status : 'upcoming';

  const groupedBanners = banners.reduce((acc, banner) => {
    const phase = banner.phase.toString();
    if (!acc[phase]) {
      acc[phase] = [];
    }
    acc[phase].push(banner);
    return acc;
  }, {} as Record<string, UpcomingBanner[]>);

  Object.values(groupedBanners).forEach(phaseCharacters => {
    phaseCharacters.sort((a, b) => b.rarity - a.rarity);
  });

  const renderContent = () => {
    if (isLoading) {
        return (
          <div className="flex flex-col items-center justify-center max-w-2xl mx-auto space-y-4 mt-12">
            <ProgressBar progress={progress} />
            <p className="text-genshin-gold-light/80 transition-opacity duration-500 ease-in-out">
              {bannerLoadingMessages[loadingMessageIndex]}
            </p>
            <SourceLogos sources={liveSources} />
          </div>
        );
    }

    if (banners.length === 0) {
        return (
            <div className="text-center text-genshin-gold-light bg-teyvat-blue/80 border border-genshin-gold/50 p-8 rounded-lg max-w-md mx-auto">
                <h2 className="text-2xl font-serif text-white mb-2">No Official Banner Info Found.</h2>
                <p>The stars are currently hidden. Check back after the next official announcement!</p>
            </div>
        );
    }

    return (
        <>
            <div className="text-center mb-6">
                <h2 className="text-3xl font-serif text-genshin-gold mb-2">
                {currentVersion ? `${bannerStatus === 'active' ? 'Currently Active' : 'Upcoming'} Banners: Version ${currentVersion}` : 'Character Banners'}
                </h2>
                <p className="text-genshin-gold-light/60 text-sm">
                    {bannerStatus === 'active' 
                        ? 'Information for the current in-game banners.' 
                        : 'Information from official HoYoverse announcements. Subject to change.'}
                </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {Object.entries(groupedBanners)
                    .sort(([phaseA], [phaseB]) => parseInt(phaseA) - parseInt(phaseB))
                    .map(([phase, characters]) => (
                    <PhaseBannerCard 
                        key={phase} 
                        phase={phase} 
                        version={currentVersion || ''} 
                        characters={characters} 
                    />
                ))}
            </div>
        </>
    );
  }

  return (
    <section>
      <RefreshTimer 
        lastUpdatedAt={lastUpdatedAt}
        cacheDurationMs={BANNER_CACHE_DURATION_MS}
      />
      {renderContent()}
    </section>
  );
};

export default BannerSection;
