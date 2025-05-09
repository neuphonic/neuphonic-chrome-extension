/**
 * Contains all React hooks used in this extension.
 */

import type { Voice } from '@neuphonic/neuphonic-js';
import { createClient } from '@neuphonic/neuphonic-js';
import { useEffect, useState } from 'react';

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

  // Helper function to update voices and language codes
  const updateVoicesAndLangCodes = (voicesList: Voice[]) => {
    setVoices(voicesList);
    const uniqueLangCodes = Array.from(
      new Set(voicesList.map((voice: Voice) => voice.lang_code))
    ) as string[];
    setLangCodes(uniqueLangCodes);
  };

  // Helper function to load voices from cache
  const loadVoicesFromCache = () => {
    chrome.storage.local.get(['cachedVoices'], (result) => {
      if (result.cachedVoices) {
        updateVoicesAndLangCodes(result.cachedVoices);
      }
    });
  };

  // Load voices from storage on mount
  useEffect(() => {
    loadVoicesFromCache();
  }, []);

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
        const newApiKey = changes.settings.newValue.apiKey;
        setApiKey(newApiKey);

        // If API key is deleted, clear cached voices
        if (!newApiKey) {
          chrome.storage.local.remove(['cachedVoices']);
          setVoices([]);
          setLangCodes([]);
          setClient(null);
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  // Create new client and fetch voices when API key changes
  useEffect(() => {
    if (!apiKey) {
      loadVoicesFromCache();
      return;
    }

    const newClient = createClient({ apiKey });
    setClient(newClient);

    const fetchVoices = async () => {
      try {
        const voicesList = await newClient.voices.list();
        updateVoicesAndLangCodes(voicesList);
        setError('');

        // Save voices to local storage
        chrome.storage.local.set({ cachedVoices: voicesList });
      } catch (error) {
        setError('Please enter a valid API Key');
        loadVoicesFromCache();
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
export const useHighlightedText = () => {
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
