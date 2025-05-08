import type { Voice } from '@neuphonic/neuphonic-js';

export type Page = 'home' | 'settings';

export type Settings = {
  language: string;
  voice: Partial<Voice>;
  apiKey: string;
};
