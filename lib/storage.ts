import { browser } from 'wxt/browser';
import type { PronunciationCard } from './glossary';

const CARDS_KEY = 'pronunciationCards';
const SETTINGS_KEY = 'pronunciationSettings';
export const PENDING_TERM_KEY = 'pendingTerm';

export interface PronunciationSettings {
  voiceURI: string;
  rate: number;
}

export const DEFAULT_SETTINGS: PronunciationSettings = { voiceURI: '', rate: 0.9 };

export async function getCards(): Promise<PronunciationCard[]> {
  const result = await browser.storage.local.get(CARDS_KEY);
  return Array.isArray(result[CARDS_KEY]) ? result[CARDS_KEY] as PronunciationCard[] : [];
}

export async function setCards(cards: PronunciationCard[]): Promise<void> {
  await browser.storage.local.set({ [CARDS_KEY]: cards });
}

export async function getSettings(): Promise<PronunciationSettings> {
  const result = await browser.storage.local.get(SETTINGS_KEY);
  return { ...DEFAULT_SETTINGS, ...(result[SETTINGS_KEY] as Partial<PronunciationSettings> | undefined) };
}

export async function setSettings(settings: PronunciationSettings): Promise<void> {
  await browser.storage.local.set({ [SETTINGS_KEY]: settings });
}
