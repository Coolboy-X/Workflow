import React, { useState, useEffect, useCallback } from 'react';
import { RedemptionCode, GroundingSource, SourcesUpdateCallback } from './types';
import { fetchCodes, CODE_CACHE_DURATION_MS } from './services/codeService';
import CodeCard from './components/CodeCard';
import Toast from './components/Toast';
import BannerSection from './components/BannerSection';
import RefreshTimer from './components/RefreshTimer';
import ProgressBar from './components/ProgressBar';
import { GenshinStarIcon } from './components/icons';
import SourceLogos from './components/SourceLogos';

const codeLoadingMessages = [
  'Contacting the Knights of Favonius library...',
  'Dispatching scouts to official HoYoVerse channels...',
  'Cross-referencing sources for active codes...',
  'Filtering out expired and regional codes...',
  'Finalizing intelligence report...',
];

const App: React.FC = () => {
  const [codes, setCodes] = useState<RedemptionCode[]>([]);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [activeView, setActiveView] = useState<'codes' | 'banners'>('codes');
  const [codesLastUpdatedAt, setCodesLastUpdatedAt] = useState<string | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [liveSources, setLiveSources] = useState<GroundingSource[]>([]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const handleCodeExpired = useCallback((expiredCode: string) => {
    setCodes(currentCodes => currentCodes.filter(c => c.code !== expiredCode));
  }, []);

  const loadCodes = useCallback(async () => {
    setIsLoading(true);
    setLoadingMessageIndex(0);
    setSources([]);
    setLiveSources([]);
    
    const handleSourcesUpdate: SourcesUpdateCallback = (updatedSources) => {
        setLiveSources(updatedSources);
    };

    try {
      const { codes: rawCodes, sources: fetchedSources, lastUpdatedAt } = await fetchCodes(handleSourcesUpdate);
      setCodesLastUpdatedAt(lastUpdatedAt);
      const now = new Date();

      const uniqueCodes = new Map<string, RedemptionCode>();
      rawCodes.forEach(code => {
        if (!uniqueCodes.has(code.code)) {
          uniqueCodes.set(code.code, code);
        }
      });
      
      const validCodes = Array.from(uniqueCodes.values())
        .filter(code => {
          const isNotExpired = new Date(code.expiry) > now;
          const isForAsia = code.regions.includes('Asia');
          return isNotExpired && isForAsia;
        })
        .sort((a, b) => new Date(b.expiry).getTime() - new Date(a.expiry).getTime());

      setCodes(validCodes);
      setSources(fetchedSources);
    } catch (error) {
      console.error("Failed to load codes:", error);
      showToast('Error loading codes.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if(activeView === 'codes') {
        loadCodes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCodes(currentCodes => {
        const now = new Date();
        const stillValidCodes = currentCodes.filter(c => new Date(c.expiry) > now);
        if (stillValidCodes.length < currentCodes.length) {
          return stillValidCodes;
        }
        return currentCodes; // No change, return same array to prevent re-render
      });
    }, 30 * 1000); // Check every 30 seconds

    return () => clearInterval(intervalId);
  }, []);
  
  useEffect(() => {
    // FIX: Replaced NodeJS.Timeout with ReturnType<typeof setInterval> for browser compatibility.
    let messageIntervalId: ReturnType<typeof setInterval> | undefined;
    if (isLoading && activeView === 'codes') {
        messageIntervalId = setInterval(() => {
            setLoadingMessageIndex(prevIndex => (prevIndex + 1) % codeLoadingMessages.length);
        }, 2500);
    }
    return () => clearInterval(messageIntervalId);
  }, [isLoading, activeView]);

  useEffect(() => {
    // FIX: Replaced NodeJS.Timeout with ReturnType<typeof setInterval> for browser compatibility.
    let progressInterval: ReturnType<typeof setInterval> | undefined;
    if (isLoading && activeView === 'codes') {
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
  }, [isLoading, activeView]);

  const renderCodesSection = () => (
    <>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center max-w-2xl mx-auto space-y-4">
          <ProgressBar progress={progress} />
          <p className="text-genshin-gold-light/80 transition-opacity duration-500 ease-in-out">
            {codeLoadingMessages[loadingMessageIndex]}
          </p>
          <SourceLogos sources={liveSources} />
        </div>
      ) : codes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {codes.map(code => (
            <CodeCard key={code.code} codeData={code} onCopy={showToast} onExpire={handleCodeExpired} />
          ))}
        </div>
      ) : (
        <div className="text-center text-genshin-gold-light bg-teyvat-blue/80 border border-genshin-gold/50 p-8 rounded-lg max-w-md mx-auto">
          <h2 className="text-2xl font-serif text-white mb-2">No active codes found for Asia.</h2>
          <p>Looks like Paimon ate all the codes. Check back later!</p>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen font-sans p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-6">
        <div className="flex justify-center items-center gap-4">
          <GenshinStarIcon className="w-10 h-10 text-genshin-gold" />
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-genshin-gold-light" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            Genshin Code Compass
          </h1>
          <GenshinStarIcon className="w-10 h-10 text-genshin-gold" />
        </div>
        <p className="mt-2 text-genshin-gold-light/80">Your daily source for the latest Genshin Impact codes, powered by AI.</p>
      </header>

      <div className="flex justify-center my-8 bg-teyvat-blue/50 border border-genshin-gold/30 rounded-full p-1 max-w-md mx-auto backdrop-blur-sm">
        <button
          onClick={() => setActiveView('codes')}
          className={`w-1/2 py-2 px-4 rounded-full text-sm font-bold transition-colors ${
            activeView === 'codes' ? 'bg-genshin-gold text-teyvat-blue-dark shadow-md' : 'text-genshin-gold-light/70 hover:bg-genshin-gold/10'
          }`}
        >
          Redemption Codes
        </button>
        <button
          onClick={() => setActiveView('banners')}
          className={`w-1/2 py-2 px-4 rounded-full text-sm font-bold transition-colors ${
            activeView === 'banners' ? 'bg-genshin-gold text-teyvat-blue-dark shadow-md' : 'text-genshin-gold-light/70 hover:bg-genshin-gold/10'
          }`}
        >
          Upcoming Banners
        </button>
      </div>
      
      <main>
        {activeView === 'codes' && (
            <RefreshTimer 
                lastUpdatedAt={codesLastUpdatedAt}
                cacheDurationMs={CODE_CACHE_DURATION_MS}
            />
        )}
        {activeView === 'codes' ? renderCodesSection() : <BannerSection />}
      </main>

      {activeView === 'codes' && sources.length > 0 && !isLoading && (
        <section className="mt-12 max-w-4xl mx-auto">
          <h2 className="text-xl font-serif text-center text-genshin-gold mb-4">Data Sources</h2>
          <ul className="bg-teyvat-blue/70 border border-genshin-gold/30 backdrop-blur-sm p-4 rounded-lg text-sm space-y-2">
            {sources.map((source, index) => (
              <li key={index} className="truncate">
                <a 
                  href={source.web.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-200 hover:underline"
                  title={source.web.uri}
                >
                  {source.web.title || new URL(source.web.uri).hostname}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="text-center mt-12 text-genshin-gold/50 text-sm">
          <p>This is a fan-made project and is not affiliated with HoYoverse.</p>
      </footer>

      <Toast message={toastMessage} show={!!toastMessage} />
    </div>
  );
};

export default App;
