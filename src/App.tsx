import type { Voice } from '@neuphonic/neuphonic-js';
import type { Player } from '@neuphonic/neuphonic-js/browser';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { AiOutlinePlayCircle } from 'react-icons/ai';
import { FaRegStopCircle } from 'react-icons/fa';
import { IoArrowBack, IoClose, IoSettingsOutline } from 'react-icons/io5';
import { MdKeyboardArrowDown, MdOpenInNew } from 'react-icons/md';
import { DEFAULT_SETTINGS } from './consts';
import { useDarkMode, useHighlightedText, useNeuphonic } from './hooks';
import type { Page, Settings } from './types';

function App() {
  useDarkMode();
  const highlightedText = useHighlightedText();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const { browserClient, voices, langCodes, error } = useNeuphonic();
  const [isReading, setIsReading] = useState(false);
  const [ellipsisCount, setEllipsisCount] = useState(1);
  const [alert, setAlert] = useState<{
    message: string;
    level: 'info' | 'error';
  } | null>(null);
  const [currentSettings, setCurrentSettings] =
    useState<Settings>(DEFAULT_SETTINGS);
  const [lastSavedSettings, setLastSavedSettings] =
    useState<Settings>(DEFAULT_SETTINGS);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Audio and playback refs
  const playerRef = useRef<Player | null>(null);

  // Hide alert when navigating away from home page
  useEffect(() => {
    if (currentPage !== 'home') setAlert(null);
  }, [currentPage]);

  // Auto-hide alert after 3 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Load settings from storage on mount
  useEffect(() => {
    chrome.storage.local.get(['settings'], (result) => {
      if (result.settings) {
        setCurrentSettings(result.settings);
        setLastSavedSettings(result.settings);
      }
    });
  }, []);

  // Animate ellipsis when reading
  useEffect(() => {
    let interval: number;
    if (isReading) {
      interval = window.setInterval(() => {
        setEllipsisCount((prev) => (prev % 3) + 1);
      }, 500);
    } else {
      setEllipsisCount(1);
    }
    return () => clearInterval(interval);
  }, [isReading]);

  // Close player on unmount
  useEffect(() => {
    playerRef.current?.close();
  }, []);

  // Handle reading aloud
  const handleReadAloud = async () => {
    console.log(2);

    if (!browserClient) {
      return;
    }

    if (
      !lastSavedSettings.voice.voice_id ||
      !lastSavedSettings.language ||
      !lastSavedSettings.apiKey
    ) {
      setAlert({
        message: 'Please configure your settings first.',
        level: 'error',
      });
      return;
    }

    if (!highlightedText) {
      setAlert({
        message: 'Please highlight some text first',
        level: 'info',
      });
      return;
    }

    if (!playerRef.current) {
      try {
        playerRef.current = await browserClient.tts.player({
          lang_code: lastSavedSettings.language,
          voice_id: lastSavedSettings.voice.voice_id,
        });
      } catch (err) {
        console.error('Error while connecting', err);
        return;
      }
    }

    if (isReading) {
      playerRef.current.stop();
      setIsReading(false);
    } else {
      setIsReading(true);

      await playerRef.current.play(highlightedText);

      setIsReading(false);
    }
  };

  // Handle settings changes
  const handleSettingChange = (
    key: keyof Settings,
    value: string | Partial<Voice>
  ) => {
    setCurrentSettings((prev) => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  // Save settings
  const handleSave = () => {
    chrome.storage.local.set({ settings: currentSettings }, () => {
      setLastSavedSettings(currentSettings);
      setHasUnsavedChanges(false);
    });
  };

  // Reset settings
  const handleReset = () => {
    setCurrentSettings(lastSavedSettings);
    setHasUnsavedChanges(false);
  };

  // Format highlighted text for display
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
      {/* Alert Message */}
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`border-b p-4 text-center ${
              alert.level === 'error'
                ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-900/20'
                : 'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/20'
            }`}
          >
            <p
              className={`text-sm ${
                alert.level === 'error'
                  ? 'text-red-700 dark:text-red-300'
                  : 'text-yellow-700 dark:text-yellow-300'
              }`}
            >
              {alert.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Read Aloud Option */}
      <div
        className='flex cursor-pointer items-center border-b border-gray-200 p-4 hover:bg-gray-200 dark:border-neutral-700 dark:hover:bg-gray-700'
        onClick={handleReadAloud}
      >
        <div className='flex flex-1 items-center'>
          <div className='mr-4'>
            {isReading ? (
              <FaRegStopCircle
                size={26}
                className='text-red-700 dark:text-red-300'
              />
            ) : (
              <AiOutlinePlayCircle size={26} />
            )}
          </div>
          <div className='flex-1 text-left'>
            <h3 className='mb-1 text-base font-semibold'>
              {isReading ? `Reading${'.'.repeat(ellipsisCount)}` : 'Read Aloud'}
            </h3>
            <p className='text-sm font-light text-gray-700 dark:text-gray-300'>
              {isReading
                ? 'Press to cancel playback'
                : 'Read aloud any highlighted text'}
            </p>
          </div>
        </div>
      </div>

      {/* Highlighted Text Preview */}
      {highlightedText && (
        <div className='border-b border-gray-200 p-4 text-center dark:border-neutral-700'>
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
