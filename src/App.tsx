import type { Voice } from '@neuphonic/neuphonic-js';
import { toWav } from '@neuphonic/neuphonic-js';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { AiOutlinePlayCircle } from 'react-icons/ai';
import { FiMessageCircle } from 'react-icons/fi';
import { IoArrowBack, IoClose, IoSettingsOutline } from 'react-icons/io5';
import { MdKeyboardArrowDown, MdOpenInNew } from 'react-icons/md';
import { DEFAULT_SETTINGS } from './consts';
import { useDarkMode, useHighlightedText, useNeuphonic } from './hooks';
import type { Page, Settings } from './types';

function App() {
  useDarkMode();
  const highlightedText = useHighlightedText();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const { client: neuphonicClient, voices, langCodes, error } = useNeuphonic();
  const [isReading, setIsReading] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );
  const [alert, setAlert] = useState<{
    message: string;
    level: 'info' | 'error';
  } | null>(null);

  // Add settings state
  const [currentSettings, setCurrentSettings] =
    useState<Settings>(DEFAULT_SETTINGS);
  const [lastSavedSettings, setLastSavedSettings] =
    useState<Settings>(DEFAULT_SETTINGS);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  /**
   * Hide alert when navigating away from home page
   */
  useEffect(() => {
    if (currentPage !== 'home') {
      setAlert(null);
    }
  }, [currentPage]);

  /**
   * Auto-hide alert after 3 seconds
   */
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  /**
   * Load settings from storage on mount
   */
  useEffect(() => {
    chrome.storage.local.get(['settings'], (result) => {
      if (result.settings) {
        setCurrentSettings(result.settings);
        setLastSavedSettings(result.settings);
      }
    });
  }, []);

  /**
   * Cleanup audio element on unmount
   */
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
    };
  }, [audioElement]);

  /**
   * Play highlighted text using the SSE endpoint. Cancel playback if already playing.
   */
  const handleReadAloud = async () => {
    if (!neuphonicClient) {
      setAlert({
        message: 'Please add your API key in settings to use this feature',
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

    if (!currentSettings.voice.voice_id) return;

    // If already reading, stop the audio
    if (isReading && audioElement) {
      audioElement.pause();
      audioElement.src = '';
      setIsReading(false);
      return;
    }

    try {
      setIsReading(true);

      // Create SSE connection
      const sse = await neuphonicClient.tts.sse({
        speed: 1.0,
        lang_code: lastSavedSettings.language,
        voice_id: lastSavedSettings.voice.voice_id,
      });

      // Send text and get response
      const res = await sse.send(highlightedText);

      // Convert to WAV
      const wav = toWav(res.audio);

      // Create blob URL
      const blob = new Blob([wav], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);

      // Create or update audio element
      if (!audioElement) {
        const audio = new Audio(url);
        audio.onended = () => {
          setIsReading(false);
          URL.revokeObjectURL(url);
        };
        setAudioElement(audio);
        await audio.play();
      } else {
        audioElement.src = url;
        await audioElement.play();
      }
    } catch (error) {
      console.error('Error reading aloud:', error);
      setIsReading(false);
    }
  };

  const handleConverse = () => {
    if (!neuphonicClient) {
      setAlert({
        message: 'Please add your API key in settings to use this feature',
        level: 'error',
      });
      return;
    }

    setAlert({
      message: 'This feature has not been implemented yet',
      level: 'error',
    });
    // TODO: Implement converse functionality
  };

  // Handle settings changes
  const handleSettingChange = (
    key: keyof Settings,
    value: string | Partial<Voice>
  ) => {
    setCurrentSettings((prev) => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  /**
   * When the "Save" button in "Settings" is pressed, save the changes to local storage.
   */
  const handleSave = () => {
    chrome.storage.local.set({ settings: currentSettings }, () => {
      setLastSavedSettings(currentSettings);
      setHasUnsavedChanges(false);
    });
  };

  /**
   * When the "Reset" button in "Settings" is pressed, revert active changes back to lastSavedSettings.
   */
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
            <AiOutlinePlayCircle
              size={26}
              className={isReading ? 'animate-pulse' : ''}
            />
          </div>
          <div className='flex-1 text-left'>
            <h3 className='mb-1 text-base font-semibold'>
              {isReading ? 'Reading...' : 'Read Aloud'}
            </h3>
            <p className='text-sm font-light text-gray-700 dark:text-gray-300'>
              {isReading
                ? 'Press to cancel playback'
                : 'Read aloud any highlighted text'}
            </p>
          </div>
        </div>
      </div>

      {/* Commented out because this is actually no possible yet with the agent. */}
      {/* Simplify & Summarise Option */}
      {/* <div className='flex cursor-pointer items-center border-b border-gray-200 p-4 hover:bg-gray-200 dark:border-neutral-700 dark:hover:bg-gray-700'>
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
      </div> */}

      {/* Converse Option */}
      <div
        className='flex cursor-pointer items-center border-b border-gray-200 p-4 hover:bg-gray-200 dark:border-neutral-700 dark:hover:bg-gray-700'
        onClick={handleConverse}
      >
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
