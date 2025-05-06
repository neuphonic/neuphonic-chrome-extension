// import reactLogo from './assets/react.svg';
// import viteLogo from '/vite.svg';
import './App.css';
import { IoSettingsOutline } from 'react-icons/io5';
import { IoClose } from 'react-icons/io5';
import { useEffect } from 'react';
import { AiOutlinePlayCircle } from 'react-icons/ai';
import { FiLoader, FiMessageCircle } from 'react-icons/fi';

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

function App() {
  useDarkMode();

  return (
    <div className='w-[375px] overflow-hidden shadow-lg border border-gray-200 bg-white dark:bg-neutral-800 dark:border-neutral-700'>
      {/* Header */}
      <div className='flex items-center px-4 py-3 border-b border-gray-200 dark:border-neutral-700'>
        <div className='flex items-center flex-1'>
          <img
            src='/logo.png'
            alt='Neuphonic Logo'
            className='w-6 h-6 rounded mr-2.5'
          />
          <span className='text-lg font-semibold'>Neuphonic Reader</span>
        </div>
        <button className='w-9 h-9 flex items-center justify-center mr-3'>
          <IoSettingsOutline size={20} />
        </button>
        <button className='w-9 h-9 flex items-center justify-center'>
          <IoClose size={20} />
        </button>
      </div>

      {/* Main Content */}
      <div>
        {/* Read Aloud Option */}
        <div className='flex items-center p-4 border-b border-gray-200 dark:border-neutral-700'>
          <div className='flex flex-1 items-center'>
            <div className='mr-4'>
              <AiOutlinePlayCircle size={26} />
            </div>
            <div className='flex-1 text-left'>
              <h3 className='text-base font-semibold mb-1'>Read Aloud</h3>
              <p className='text-sm text-gray-700 dark:text-gray-300 font-light'>
                Read aloud any highlighted text
              </p>
            </div>
          </div>
          <div className='bg-gray-100 px-2 py-1 rounded text-sm text-gray-600'>
            <span>⌘ R</span>
          </div>
        </div>

        {/* Simplify & Summarise Option */}
        <div className='flex items-center p-4 border-b border-gray-200 dark:border-neutral-700'>
          <div className='flex flex-1 items-center'>
            <div className='mr-4'>
              <FiLoader size={26} />
            </div>
            <div className='flex-1 text-left'>
              <h3 className='text-base font-semibold mb-1'>
                Simplify & Summarise
              </h3>
              <p className='text-sm text-gray-700 dark:text-gray-300 font-light'>
                Intelligently simplify, summarise and speak aloud any
                highlighted text
              </p>
            </div>
          </div>
          <div className='bg-gray-100 px-2 py-1 rounded text-sm text-gray-600'>
            <span>⌘ S</span>
          </div>
        </div>

        {/* Converse Option */}
        <div className='flex items-center p-4 border-b border-gray-200 dark:border-neutral-700'>
          <div className='flex flex-1 items-center'>
            <div className='mr-4'>
              <FiMessageCircle size={26} />
            </div>
            <div className='flex-1 text-left'>
              <h3 className='text-base font-semibold mb-1'>Converse</h3>
              <p className='text-sm text-gray-700 dark:text-gray-300 font-light'>
                Converse with the highlighted text
              </p>
            </div>
          </div>
          <div className='bg-gray-100 px-2 py-1 rounded text-sm text-gray-600'>
            <span>⌘ C</span>
          </div>
        </div>

        {/* Activate Button */}
        <div className='p-4 flex flex-col items-center'>
          <button className='bg-themeContrast2 hover:bg-themeSecondary dark:bg-darkThemeSecondary dark:hover:bg-darkThemePrimary text-white rounded-full py-3 px-6 text-base font-semibold w-full mb-2'>
            Activate
          </button>
          <div className='text-xs text-gray-500 text-center'>
            <span>Powered by Neuphonic</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
