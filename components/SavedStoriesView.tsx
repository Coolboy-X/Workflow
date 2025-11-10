import React, { useState } from 'react';
import { Story } from '../types';
import { StoryDisplay } from './StoryDisplay';
import { TrashIcon, BookOpenIcon } from './icons';
import { ConfirmationModal } from './ConfirmationModal';

interface SavedStoriesViewProps {
  stories: Story[];
  onDelete: (storyId: string) => void;
}

export const SavedStoriesView: React.FC<SavedStoriesViewProps> = ({ stories, onDelete }) => {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [storyToDelete, setStoryToDelete] = useState<Story | null>(null);
  
  const handleDeleteClick = (e: React.MouseEvent, story: Story) => {
    e.stopPropagation(); // Prevent the list item's onClick from firing
    setStoryToDelete(story);
  };
  
  const handleConfirmDelete = () => {
    if (storyToDelete) {
      onDelete(storyToDelete.id);
      setStoryToDelete(null); // Close the modal
    }
  };

  if (selectedStory) {
    return (
      <div className="animate-fade-in">
        <button
          onClick={() => setSelectedStory(null)}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700/50 border border-slate-700 rounded-lg text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Saved Stories
        </button>
        <StoryDisplay story={selectedStory} isSaved={true} />
      </div>
    );
  }

  return (
    <>
      <div className="animate-fade-in-up">
        {stories.length === 0 ? (
          <div className="text-center text-slate-500 flex flex-col items-center justify-center h-full py-16">
            <BookOpenIcon className="w-20 h-20 mb-4 opacity-30" />
            <p className="text-2xl font-medium">Your saved stories will appear here.</p>
            <p className="text-slate-600">Generate a story and click the bookmark icon to save it!</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {stories.map(story => (
              <li 
                key={story.id}
                onClick={() => setSelectedStory(story)}
                className="relative bg-slate-800/50 p-4 rounded-xl flex justify-between items-center group hover:bg-slate-800/80 transition-all duration-300 cursor-pointer border border-slate-700/50 hover:border-indigo-500/50 shadow-md hover:shadow-indigo-500/20"
              >
                <div className="w-full flex justify-between items-center">
                  <div className="flex-grow overflow-hidden pr-4">
                    <p className="text-lg font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors truncate">{story.title}</p>
                    <p className="text-sm text-slate-400 truncate italic mt-1">"{story.styleInstruction}"</p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteClick(e, story)}
                    className="p-2 rounded-full hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"
                    title="Delete story"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <ConfirmationModal
        isOpen={!!storyToDelete}
        onClose={() => setStoryToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Story"
        message={`Are you sure you want to permanently delete "${storyToDelete?.title}"? This action cannot be undone.`}
      />
    </>
  );
};
