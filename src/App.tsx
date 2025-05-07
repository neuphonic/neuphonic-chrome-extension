import type { Voice } from '@neuphonic/neuphonic-js';
import { createClient } from '@neuphonic/neuphonic-js';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { AiOutlinePlayCircle } from 'react-icons/ai';
import { FiLoader, FiMessageCircle } from 'react-icons/fi';
import { IoArrowBack, IoClose, IoSettingsOutline } from 'react-icons/io5';
import { MdKeyboardArrowDown, MdOpenInNew } from 'react-icons/md';

type Page = 'home' | 'settings';

type Settings = {
  language: string;
  voice: Partial<Voice>;
  apiKey: string;
};

// Add default settings
const DEFAULT_SETTINGS: Settings = {
  language: 'en',
  voice: {
    voice_id: 'fc854436-2dac-4d21-aa69-ae17b54e98eb',
    name: 'Emily',
  },
  apiKey: '',
};

/**
 * Hook that creates and returns a Neuphonic client with the user's API key.
 * Also fetches and returns available voices and language codes.
 */
export function useNeuphonic() {
  const [client, setClient] = useState<ReturnType<typeof createClient> | null>(
    null
  );
  const [voices, setVoices] = useState<Voice[]>([]);
  const [langCodes, setLangCodes] = useState<string[]>([]);
  const [apiKey, setApiKey] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Get API key from storage
  useEffect(() => {
    chrome.storage.local.get(['settings'], (result) => {
      if (result.settings?.apiKey) {
        setApiKey(result.settings.apiKey);
      }
    });

    // Listen for changes to settings
    const handleStorageChange = (changes: any) => {
      if (
        changes.settings?.newValue?.apiKey !==
        changes.settings?.oldValue?.apiKey
      ) {
        setApiKey(changes.settings.newValue.apiKey);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  // Create new client and fetch voices when API key changes
  useEffect(() => {
    if (!apiKey) return;

    const newClient = createClient({ apiKey });
    setClient(newClient);

    const fetchVoices = async () => {
      try {
        const voicesList = await newClient.voices.list();
        setVoices(voicesList);
        setError('');

        // Extract unique language codes
        const uniqueLangCodes = Array.from(
          new Set(voicesList.map((voice: any) => voice.lang_code))
        );
        setLangCodes(uniqueLangCodes);
      } catch (error) {
        setError('Please enter a valid API Key');
        setVoices([]);
        setLangCodes([]);
      }
    };

    fetchVoices();
  }, [apiKey]);

  return { client, voices, langCodes, error };
}

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

function App() {
  useDarkMode();
  const highlightedText = useHighlightedText();
  const [currentPage, setCurrentPage] = useState<Page>('settings');
  const { client: neuphonicClient, voices, langCodes, error } = useNeuphonic();

  // Add settings state
  const [currentSettings, setCurrentSettings] =
    useState<Settings>(DEFAULT_SETTINGS);
  const [lastSavedSettings, setLastSavedSettings] =
    useState<Settings>(DEFAULT_SETTINGS);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load settings from storage on mount
  useEffect(() => {
    chrome.storage.local.get(['settings'], (result) => {
      if (result.settings) {
        setCurrentSettings(result.settings);
        setLastSavedSettings(result.settings);
      }
    });
  }, []);

  // Handle settings changes
  const handleSettingChange = (
    key: keyof Settings,
    value: string | Partial<Voice>
  ) => {
    setCurrentSettings((prev) => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  // Save settings to storage
  const handleSave = () => {
    chrome.storage.local.set({ settings: currentSettings }, () => {
      setLastSavedSettings(currentSettings);
      setHasUnsavedChanges(false);
    });
  };

  // Reset settings to last saved state
  const handleReset = () => {
    setCurrentSettings(lastSavedSettings);
    setHasUnsavedChanges(false);
  };

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
            className='mb-1 block text-sm text-gray-700 dark:text-gray-300'
          >
            Language
          </label>
          <div className='relative'>
            <select
              id='language'
              value={currentSettings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              className='w-full cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-gray-700 focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-200'
            >
              {langCodes.map((code) => (
                <option key={code} value={code}>
                  {code.toUpperCase()}
                </option>
              ))}
            </select>
            <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2'>
              <MdKeyboardArrowDown className='h-4 w-4 fill-current text-gray-500' />
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor='voice'
            className='mb-1 block text-sm text-gray-700 dark:text-gray-300'
          >
            Voice
          </label>
          <div className='relative'>
            <select
              id='voice'
              value={currentSettings.voice.voice_id}
              onChange={(e) => {
                const selectedVoice = voices.find(
                  (v) => v.voice_id === e.target.value
                );
                if (selectedVoice) {
                  handleSettingChange('voice', {
                    voice_id: selectedVoice.voice_id,
                    name: selectedVoice.name,
                  });
                }
              }}
              className='w-full cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-gray-700 focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-200'
            >
              {voices
                .filter((voice) => voice.lang_code === currentSettings.language)
                .map((voice) => (
                  <option key={voice.voice_id} value={voice.voice_id}>
                    {voice.name} ({voice.voice_id})
                  </option>
                ))}
            </select>
            <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2'>
              <MdKeyboardArrowDown className='h-4 w-4 fill-current text-gray-500' />
            </div>
          </div>
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
            value={currentSettings.apiKey}
            onChange={(e) => handleSettingChange('apiKey', e.target.value)}
            className='w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-700 focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-gray-200'
            placeholder='Enter your API key'
          />
          {error && <p className='mt-1 text-sm text-red-500'>{error}</p>}
        </div>

        <div>
          <a
            target='_blank'
            href='https://app.neuphonic.com/apikey'
            className='flex items-center gap-1 text-gray-700 dark:text-gray-300'
            rel='noopener noreferrer'
          >
            Get Your API Key Here
            <MdOpenInNew className='inline-block h-4 w-4' />
          </a>
        </div>

        <div className='flex justify-end space-x-3 pt-4'>
          <button
            onClick={handleReset}
            className='rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700'
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
              hasUnsavedChanges
                ? 'text-button'
                : 'cursor-not-allowed bg-gray-400'
            }`}
          >
            Save Changes
          </button>
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
