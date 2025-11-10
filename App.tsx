
import React, { useState, useCallback, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection, getDocs, setDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { Story } from './types';
import { generateStory } from './services/geminiService';
import { PromptInput } from './components/PromptInput';
import { StoryDisplay } from './components/StoryDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { SavedStoriesView } from './components/SavedStoriesView';
import { SparklesIcon, BookOpenIcon, ArrowLeftIcon } from './components/icons';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDrO7Lb1aaiFacHK639lpTDxRy9Gofi8Q8",
  authDomain: "story-maker-f3625.firebaseapp.com",
  projectId: "story-maker-f3625",
  storageBucket: "story-maker-f3625.firebasestorage.app",
  messagingSenderId: "506820107025",
  appId: "1:506820107025:web:9051ec4f3a81a828614ab0",
  measurementId: "G-QBKLLP6QCJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, { experimentalForceLongPolling: true });
const storiesCollectionRef = collection(db, 'stories');


const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [narration, setNarration] = useState<string>('First Person');
  const [duration, setDuration] = useState<string>('40 seconds');
  const [characterCount, setCharacterCount] = useState<string>('Any');
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [savedStories, setSavedStories] = useState<Story[]>([]);
  const [view, setView] = useState<'generator' | 'saved' | 'generated'>('generator');

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const q = query(storiesCollectionRef, orderBy('createdAt', 'desc'));
        const data = await getDocs(q);
        const storiesFromDb = data.docs.map((doc) => doc.data() as Story);
        setSavedStories(storiesFromDb);
      } catch (err) {
        console.error("Failed to load saved stories from Firestore", err);
        setError("Failed to load saved stories. Please check your connection and configuration.");
      }
    };
    fetchStories();
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setStory(null);

    try {
      const result = await generateStory(prompt, narration, duration, characterCount);
      setStory(result);
      setView('generated');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setView('generator'); // Stay on generator view if there's an error
    } finally {
      setIsLoading(false);
    }
  }, [prompt, narration, duration, characterCount, isLoading]);

  const handleSaveStory = async (storyToSave: Story) => {
    if (!savedStories.some(s => s.id === storyToSave.id)) {
      try {
        await setDoc(doc(db, "stories", storyToSave.id), storyToSave);
        setSavedStories(prevStories => [storyToSave, ...prevStories].sort((a,b) => b.createdAt - a.createdAt));
      } catch (err) {
        console.error("Error saving story to Firestore:", err);
        setError("Could not save the story. Please try again.");
      }
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    try {
      await deleteDoc(doc(db, "stories", storyId));
      setSavedStories(prevStories => prevStories.filter(s => s.id !== storyId));
    } catch (err) {
      console.error("Error deleting story from Firestore:", err);
      setError("Could not delete the story. Please try again.");
    }
  };
  
  const isStorySaved = (storyId: string) => {
    return savedStories.some(s => s.id === storyId);
  }
  
  const handleBackToGenerator = () => {
    setError(null);
    setView('generator');
  }

  const renderMainContent = () => {
    if (view === 'saved') {
      return <SavedStoriesView stories={savedStories} onDelete={handleDeleteStory} />;
    }
    
    if (view === 'generated' && story) {
      return (
        <div className="animate-fade-in">
          <button
            onClick={handleBackToGenerator}
            className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700/50 border border-slate-700 rounded-lg text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Generator
          </button>
          <StoryDisplay 
            story={story}
            onSave={handleSaveStory}
            isSaved={isStorySaved(story.id)}
          />
        </div>
      );
    }
    
    // Default to 'generator' view
    return (
      <main className="flex-grow flex flex-col">
        <div className="sticky top-6 z-10">
          <PromptInput
            prompt={prompt}
            setPrompt={setPrompt}
            narration={narration}
            setNarration={setNarration}
            duration={duration}
            setDuration={setDuration}
            characterCount={characterCount}
            setCharacterCount={setCharacterCount}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>

        <div className="mt-10 flex-grow">
          {isLoading && <LoadingSpinner />}
          {error && <ErrorMessage message={error} />}
        </div>
      </main>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-5xl mx-auto flex flex-col flex-grow">
        <header className="text-center mb-8 animate-fade-in-down">
          <div className="flex items-center justify-center gap-3">
            <BookOpenIcon className="w-10 h-10 text-indigo-400" />
            {/* FIX: Complete truncated h1 tag and parent elements */}
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
              Story Maker AI
            </h1>
          </div>
          <p className="mt-3 text-lg text-slate-400">Generate viral YouTube Short scripts from a simple idea.</p>
           <nav className="mt-8 mb-4 flex justify-center gap-4">
            <button
              onClick={() => { setView('generator'); setError(null); }}
              className={`px-5 py-2 text-sm font-medium rounded-md transition-colors ${
                view === 'generator' || view === 'generated'
                  ? 'bg-slate-700/80 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <SparklesIcon className="w-4 h-4 mr-2 inline-block" />
              Generator
            </button>
            <button
              onClick={() => setView('saved')}
              className={`px-5 py-2 text-sm font-medium rounded-md transition-colors ${
                view === 'saved'
                  ? 'bg-slate-700/80 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <BookOpenIcon className="w-4 h-4 mr-2 inline-block" />
              Saved Stories ({savedStories.length})
            </button>
          </nav>
        </header>

        {renderMainContent()}
      </div>
    </div>
  );
};

// FIX: Add default export for App component
export default App;
