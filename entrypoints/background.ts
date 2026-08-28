import { browser } from 'wxt/browser';
import { applyPronunciations } from '../lib/glossary';
import { getCards, getSettings, PENDING_TERM_KEY } from '../lib/storage';

const READ_ID = 'pronunciation-cards-read';
const ADD_ID = 'pronunciation-cards-add';

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(async () => {
    await browser.contextMenus.removeAll();
    browser.contextMenus.create({ id: READ_ID, title: 'Read with Pronunciation Cards', contexts: ['selection'] });
    browser.contextMenus.create({ id: ADD_ID, title: 'Add to Pronunciation Cards', contexts: ['selection'] });
  });

  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    const text = info.selectionText?.trim();
    if (!text) return;
    if (info.menuItemId === ADD_ID) {
      await browser.storage.local.set({ [PENDING_TERM_KEY]: text.slice(0, 80) });
      try {
        await browser.action.openPopup();
      } catch {
        // The saved selection will be waiting next time the user opens the popup.
      }
      return;
    }
    if (info.menuItemId === READ_ID && tab?.id) {
      const [cards, settings] = await Promise.all([getCards(), getSettings()]);
      try {
        const spokenText = applyPronunciations(text, cards);
        await browser.scripting.executeScript({
          target: { tabId: tab.id },
          func: (speechText: string, voiceURI: string, speechRate: number) => {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(speechText);
            utterance.rate = Math.min(1.5, Math.max(0.5, speechRate));
            utterance.voice = window.speechSynthesis.getVoices().find((candidate) => candidate.voiceURI === voiceURI) ?? null;
            window.speechSynthesis.speak(utterance);
          },
          args: [spokenText, settings.voiceURI, settings.rate],
        });
      } catch {
        // Restricted browser pages do not accept script injection; the popup explains this limitation.
      }
    }
  });
});
