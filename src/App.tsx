// import reactLogo from './assets/react.svg';
// import viteLogo from '/vite.svg';
import { useEffect, useState } from 'react';
import { AiOutlinePlayCircle } from 'react-icons/ai';
import { FiLoader, FiMessageCircle } from 'react-icons/fi';
import { IoClose, IoSettingsOutline } from 'react-icons/io5';
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

function App() {
  useDarkMode();
  const highlightedText = useHighlightedText();

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
        <button className='mr-3 flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700'>
          <IoSettingsOutline size={20} />
        </button>
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
      <p>{highlightedText}</p>
      <div>
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
          {/* <div className='rounded bg-gray-100 px-2 py-1 text-sm text-gray-600'>
            <span>⌘ R</span>
          </div> */}
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
                Intelligently simplify, summarise and speak aloud any
                highlighted text
              </p>
            </div>
          </div>
          {/* <div className='rounded bg-gray-100 px-2 py-1 text-sm text-gray-600 dark:bg-gray-700 dark:text-white'>
            <span>⌘ S</span>
          </div> */}
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
          {/* <div className='rounded bg-gray-100 px-2 py-1 text-sm text-gray-600'>
            <span>⌘ C</span>
          </div> */}
        </div>

        {/* Activate Button */}
        <div className='flex flex-col items-center p-4'>
          {/* <button className='bg-themeContrast2 hover:bg-themeSecondary dark:bg-darkThemeSecondary dark:hover:bg-darkThemePrimary mb-2 w-full rounded-full px-6 py-3 text-base font-semibold text-white'>
            Activate
          </button> */}
          <div className='text-center text-xs text-gray-500'>
            <span>Powered by Neuphonic</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
