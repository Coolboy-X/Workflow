import React from 'react';
import { GroundingSource } from '../types';

interface SourceLogosProps {
  sources: GroundingSource[];
}

const SourceLogos: React.FC<SourceLogosProps> = ({ sources }) => {
  if (sources.length === 0) {
    return null;
  }

  const getHostname = (uri: string): string => {
    try {
      return new URL(uri).hostname;
    } catch (e) {
      console.warn(`Invalid URI for hostname extraction: ${uri}`);
      return '';
    }
  };

  return (
    <div className="w-full text-center mt-4 p-4 bg-teyvat-blue/50 rounded-lg border border-genshin-gold/20">
      <p className="font-serif text-genshin-gold text-sm mb-3">Searching sources...</p>
      <div className="flex flex-wrap justify-center items-center gap-3 h-auto max-h-24 overflow-y-auto py-1">
        {sources.map((source, index) => {
          const hostname = getHostname(source.web.uri);
          if (!hostname) return null;
          
          const logoUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;

          return (
            <a
              key={source.web.uri + index}
              href={source.web.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
              title={source.web.title || hostname}
            >
              <img
                src={logoUrl}
                alt={hostname}
                className="w-8 h-8 bg-white/10 rounded-full object-contain p-1 border-2 border-transparent group-hover:border-genshin-gold transition-all"
                onError={(e) => {
                  const parentElement = (e.target as HTMLImageElement).parentElement;
                  if (parentElement) {
                    parentElement.style.display = 'none';
                  }
                }}
              />
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default SourceLogos;
