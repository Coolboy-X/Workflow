import React from 'react';
import { ModernDropdown } from './ModernDropdown';
import { SparklesIcon } from './icons';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  narration: string;
  setNarration: (narration: string) => void;
  duration: string;
  setDuration: (duration: string) => void;
  characterCount: string;
  setCharacterCount: (count: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const narrations = ['First Person', 'Second Person', 'Third Person'];
const durations = ['30 seconds', '35 seconds', '40 seconds', '45 seconds', '50 seconds', '60 seconds'];
const characterCounts = ['Any', '1', '2', '3', '4+'];


export const PromptInput: React.FC<PromptInputProps> = ({ 
  prompt, setPrompt, 
  narration, setNarration, 
  duration, setDuration,
  characterCount, setCharacterCount,
  onSubmit, isLoading 
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="relative flex flex-col gap-5 bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-slate-700">
        <div className="absolute -inset-px rounded-2xl border border-transparent bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 transition-opacity duration-500 group-hover:opacity-50" aria-hidden="true"></div>
      
      <div>
        <label htmlFor="story-prompt" className="text-lg font-semibold text-slate-200 mb-2 block">
          Your Story Idea
        </label>
        <div className="relative">
          <textarea
            id="story-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., A robot who discovers music for the first time."
            className="w-full h-28 p-4 bg-transparent border-2 border-slate-700 rounded-lg text-slate-200 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 resize-none placeholder:text-slate-500"
            disabled={isLoading}
          />
          <p className="absolute bottom-2 right-3 text-xs text-slate-500">
            ⌘+Enter to submit
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-400 mb-1 block">
            Narration
          </label>
          <ModernDropdown
            label="Narration"
            options={narrations}
            selected={narration}
            onChange={(newSelection) => setNarration(newSelection as string)}
            multiple={false}
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-400 mb-1 block">
            Duration
          </label>
          <ModernDropdown
            label="Duration"
            options={durations}
            selected={duration}
            onChange={(newSelection) => setDuration(newSelection as string)}
            multiple={false}
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-400 mb-1 block">
            Characters
          </label>
          <ModernDropdown
            label="Characters"
            options={characterCounts}
            selected={characterCount}
            onChange={(newSelection) => setCharacterCount(newSelection as string)}
            multiple={false}
            disabled={isLoading}
          />
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={isLoading || !prompt.trim()}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-lg hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-1 disabled:transform-none shadow-lg hover:shadow-indigo-500/50 mt-2"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          <>
            <SparklesIcon className="w-5 h-5" />
            Generate Story
          </>
        )}
      </button>
    </div>
  );
};