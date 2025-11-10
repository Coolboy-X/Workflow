import React, { useState } from 'react';
import { Story } from '../types';
import { ClipboardIcon, ClipboardCheckIcon, BookmarkIcon, BookmarkSolidIcon, ClockIcon } from './icons';

interface StoryDisplayProps {
  story: Story;
  onSave?: (story: Story) => void;
  isSaved?: boolean;
}

export const StoryDisplay: React.FC<StoryDisplayProps> = ({ story, onSave, isSaved }) => {
  const [copied, setCopied] = useState(false);

  const copyStoryAndShowFeedback = () => {
    if (copied) return;
    
    const fullStory = `Title: ${story.title}\n\nStyle Instruction:\n${story.styleInstruction}\n\n---\n\n[SCRIPT]\n${story.script}`;
    navigator.clipboard.writeText(fullStory).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div 
      className="relative bg-slate-800/50 backdrop-blur-lg rounded-2xl shadow-lg p-6 sm:p-8 border border-slate-700 animate-fade-in-up"
    >
       <div className="absolute -inset-px rounded-2xl border border-transparent bg-gradient-to-r from-purple-600 to-indigo-600 opacity-20 pointer-events-none" aria-hidden="true"></div>
      
      <div className="absolute top-4 right-4 flex gap-2">
        {onSave && (
          <button
            onClick={() => onSave(story)}
            disabled={isSaved}
            className="p-2 bg-slate-700/50 rounded-full hover:bg-slate-600 transition-colors disabled:cursor-not-allowed"
            title={isSaved ? 'Story Saved' : 'Save Story'}
          >
            {isSaved ? (
              <BookmarkSolidIcon className="w-6 h-6 text-indigo-400" />
            ) : (
              <BookmarkIcon className="w-6 h-6 text-slate-400" />
            )}
          </button>
        )}
        <button
          onClick={copyStoryAndShowFeedback}
          className="p-2 bg-slate-700/50 rounded-full hover:bg-slate-600 transition-colors"
          title="Copy to clipboard"
        >
          {copied ? (
            <ClipboardCheckIcon className="w-6 h-6 text-green-400" />
          ) : (
            <ClipboardIcon className="w-6 h-6 text-slate-400" />
          )}
        </button>
      </div>

      <div className="space-y-8 select-text">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 mb-2 pr-24">
            🎬 {story.title}
          </h2>
          <div className="flex items-center gap-2 mt-3">
            <div className="inline-flex items-center gap-1.5 bg-slate-700/50 text-indigo-300 text-xs font-medium px-2.5 py-1 rounded-full border border-slate-700">
                <ClockIcon className="w-3.5 h-3.5" />
                <span>{story.duration} script</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-200 mb-2">
            Style Instruction
          </h3>
          <blockquote className="text-slate-300 italic bg-slate-800/70 border-l-4 border-indigo-500 p-4 rounded-r-lg">
            {story.styleInstruction}
          </blockquote>
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-200 mb-3">
            Characters ({story.characters.length})
          </h3>
          {story.characters.length > 0 ? (
            <div className="space-y-3">
              {story.characters.map((character, index) => (
                <div key={character.name} className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 animate-fade-in-down-sm">
                  <p className="text-slate-300">
                    <span className="font-semibold text-purple-300">{character.name}</span>
                    <span className="text-slate-400 ml-2">
                      ({index === 0 ? 'Main Character' : character.description})
                    </span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
              <p className="text-slate-400 italic text-sm">No specific characters were identified in this narrative.</p>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-200 mb-2">
            Script
          </h3>
          <blockquote className="text-slate-200 leading-relaxed whitespace-pre-wrap font-serif bg-slate-900/50 border-l-4 border-purple-500 p-4 rounded-r-lg">
            {story.script}
          </blockquote>
        </div>
      </div>
    </div>
  );
};