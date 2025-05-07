// import reactLogo from './assets/react.svg';
// import viteLogo from '/vite.svg';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { AiOutlinePlayCircle } from 'react-icons/ai';
import { FiLoader, FiMessageCircle } from 'react-icons/fi';
import { IoArrowBack, IoClose, IoSettingsOutline } from 'react-icons/io5';
import './App.css';

export function useDarkMode() {
  useEffect(() => {
    // Check if user prefers dark mode
    const darkModeMediaQuery = window.matchMedia(
      '(prefers-color-scheme: dark)'
    );

    // Function to update the dark class
    const updateDarkMode = (isDark: boolean) => {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    // Set initial state
    updateDarkMode(darkModeMediaQuery.matches);

    // Add listener for changes
    const listener = (e: MediaQueryListEvent) => updateDarkMode(e.matches);
    darkModeMediaQuery.addEventListener('change', listener);

    // Cleanup
    return () => darkModeMediaQuery.removeEventListener('change', listener);
  }, []);
}

/**
 * Hook that retrieves and subscribes to the user's highlighted text.
 * @returns {string} The current highlighted text
 */
const useHighlightedText = () => {
  const [highlightedText, setHighlightedText] = useState<string>('');

  useEffect(() => {
    // Get initial value
    chrome.storage.local.get(['highlightedText'], (result) => {
      setHighlightedText(result.highlightedText || '');
    });

    // Listen for changes
    const handleStorageChange = (changes: any) => {
      if (changes.highlightedText) {
        setHighlightedText(changes.highlightedText.newValue || '');
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    // Cleanup
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  return highlightedText;
};

type Page = 'home' | 'settings';

function App() {
  useDarkMode();
  const highlightedText = useHighlightedText();
  const [currentPage, setCurrentPage] = useState<Page>('home');

  // Function to format highlighted text for display
  const formatHighlightedText = (text: string) => {
    if (!text) return '';
    if (text.length <= 50) return text;

    const words = text.split(' ');
    if (words.length <= 8) return text;

    return `${words.slice(0, 3).join(' ')} ... ${words.slice(-3).join(' ')}`;
  };

  const renderHomePage = () => (
    <motion.div
      key='home'
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
    >
      {/* Read Aloud Option */}
      <div className='flex cursor-pointer items-center border-b border-gray-200 p-4 hover:bg-gray-200 dark:border-neutral-700 dark:hover:bg-gray-700'>
        <div className='flex flex-1 items-center'>
          <div className='mr-4'>
            <AiOutlinePlayCircle size={26} />
          </div>
          <div className='flex-1 text-left'>
            <h3 className='mb-1 text-base font-semibold'>Read Aloud</h3>
            <p className='text-sm font-light text-gray-700 dark:text-gray-300'>
              Read aloud any highlighted text
            </p>
          </div>
        </div>
      </div>

      {/* Simplify & Summarise Option */}
      <div className='flex cursor-pointer items-center border-b border-gray-200 p-4 hover:bg-gray-200 dark:border-neutral-700 dark:hover:bg-gray-700'>
        <div className='flex flex-1 items-center'>
          <div className='mr-4'>
            <FiLoader size={26} />
          </div>
          <div className='flex-1 text-left'>
            <h3 className='mb-1 text-base font-semibold'>
              Simplify & Summarise
            </h3>
            <p className='text-sm font-light text-gray-700 dark:text-gray-300'>
              Intelligently simplify, summarise and speak aloud any highlighted
              text
            </p>
          </div>
        </div>
      </div>

      {/* Converse Option */}
      <div className='flex cursor-pointer items-center border-b border-gray-200 p-4 hover:bg-gray-200 dark:border-neutral-700 dark:hover:bg-gray-700'>
        <div className='flex flex-1 items-center'>
          <div className='mr-4'>
            <FiMessageCircle size={26} />
          </div>
          <div className='flex-1 text-left'>
            <h3 className='mb-1 text-base font-semibold'>Converse</h3>
            <p className='text-sm font-light text-gray-700 dark:text-gray-300'>
              Converse with this page
            </p>
          </div>
        </div>
      </div>

      {/* Highlighted Text Preview */}
      {highlightedText && (
        <div className='border-b border-gray-200 p-4 dark:border-neutral-700'>
          <p className='text-sm text-gray-700 italic dark:text-gray-300'>
            "{formatHighlightedText(highlightedText)}"
          </p>
        </div>
      )}
    </motion.div>
  );

  const renderSettingsPage = () => (
    <motion.div
      key='settings'
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className='p-4'
    >
      <div className='space-y-4'>
        <div>
          <label
            htmlFor='language'
            className='mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300'
          >
            Language
          </label>
          <select
            id='language'
            className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-700 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200'
          >
            <option value='en'>English</option>
            <option value='es'>Spanish</option>
            <option value='fr'>French</option>
            <option value='de'>German</option>
          </select>
        </div>

        <div>
          <label
            htmlFor='voice'
            className='mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300'
          >
            Voice ID
          </label>
          <select
            id='voice'
            className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-700 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200'
          >
            <option value='voice1'>Voice 1 (Female)</option>
            <option value='voice2'>Voice 2 (Male)</option>
            <option value='voice3'>Voice 3 (Female)</option>
            <option value='voice4'>Voice 4 (Male)</option>
          </select>
        </div>

        <div>
          <label
            htmlFor='apiKey'
            className='mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300'
          >
            API Key
          </label>
          <input
            type='password'
            id='apiKey'
            className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-700 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200'
            placeholder='Enter your API key'
          />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className='w-[375px] overflow-hidden border border-gray-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800'>
      {/* Header */}
      <div className='flex items-center border-b border-gray-200 px-4 py-3 dark:border-neutral-700'>
        <div className='flex flex-1 items-center'>
          <img
            src='/logo.png'
            alt='Neuphonic Logo'
            className='mr-2.5 h-6 w-6 rounded'
          />
          <span className='text-lg font-semibold'>Neuphonic Reader</span>
        </div>
        {currentPage === 'home' ? (
          <button
            className='mr-3 flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700'
            onClick={() => setCurrentPage('settings')}
          >
            <IoSettingsOutline size={20} />
          </button>
        ) : (
          <button
            className='mr-3 flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700'
            onClick={() => setCurrentPage('home')}
          >
            <IoArrowBack size={20} />
          </button>
        )}
        <button
          className='flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700'
          onClick={() => {
            window.close();
          }}
        >
          <IoClose size={20} />
        </button>
      </div>

      {/* Main Content */}
      <div>
        <AnimatePresence mode='wait' initial={false}>
          {currentPage === 'home' ? renderHomePage() : renderSettingsPage()}
        </AnimatePresence>

        <div className='p-4 text-center'>
          <span className='text-xs text-gray-500'>
            Powered by{' '}
            <a target='_blank' href='https://neuphonic.com'>
              Neuphonic
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}

export default App;
