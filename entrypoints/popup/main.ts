import { browser } from 'wxt/browser';
import { applyPronunciations, createCard, mergeGlossaries, parseGlossary, serializeGlossary, toSsml, updateCard, validateCardInput, type PronunciationCard } from '../../lib/glossary';
import { getCards, getSettings, PENDING_TERM_KEY, setCards, setSettings } from '../../lib/storage';
import './style.css';

const byId = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing #${id}`);
  return element as T;
};

const form = byId<HTMLFormElement>('card-form');
const term = byId<HTMLInputElement>('term');
const alias = byId<HTMLInputElement>('alias');
const ipa = byId<HTMLInputElement>('ipa');
const notes = byId<HTMLTextAreaElement>('notes');
const cardId = byId<HTMLInputElement>('card-id');
const voice = byId<HTMLSelectElement>('voice');
const rate = byId<HTMLInputElement>('rate');
const status = byId<HTMLParagraphElement>('status');
const list = byId<HTMLUListElement>('card-list');
const dialog = byId<HTMLDialogElement>('delete-dialog');
let cards: PronunciationCard[] = [];
let selectedPageText = '';
let pendingDelete: PronunciationCard | undefined;
let deletedCard: PronunciationCard | undefined;

function announce(message: string, kind: 'info' | 'error' | 'success' = 'info') {
  status.textContent = message;
  status.dataset.kind = kind;
}

function activateTab(tab: HTMLButtonElement) {
  const tabs = [...document.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  for (const candidate of tabs) {
    const selected = candidate === tab;
    candidate.setAttribute('aria-selected', String(selected));
    candidate.tabIndex = selected ? 0 : -1;
    byId(candidate.getAttribute('aria-controls')!).hidden = !selected;
  }
  tab.focus();
}

for (const tab of document.querySelectorAll<HTMLButtonElement>('[role="tab"]')) {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const tabs = [...document.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    const index = tabs.indexOf(tab);
    const target = event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs.at(-1) : tabs[(index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
    if (target) activateTab(target);
  });
}

function speakPreview(textToSpeak: string) {
  if (!textToSpeak) return announce('Enter a spoken pronunciation first.', 'error');
  if (!('speechSynthesis' in window)) return announce('Speech preview is not available in this browser.', 'error');
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(textToSpeak);
  utterance.rate = Number(rate.value);
  utterance.voice = window.speechSynthesis.getVoices().find((item) => item.voiceURI === voice.value) ?? null;
  utterance.onstart = () => announce(`Playing “${textToSpeak}”.`);
  utterance.onend = () => announce('Preview finished.', 'success');
  utterance.onerror = () => announce('The browser could not play that preview. Try another installed voice.', 'error');
  window.speechSynthesis.speak(utterance);
}

function loadVoices() {
  const previous = voice.value;
  voice.replaceChildren(new Option('System default', ''));
  const voices = window.speechSynthesis?.getVoices() ?? [];
  for (const item of voices.sort((a, b) => a.lang.localeCompare(b.lang))) voice.add(new Option(`${item.name} — ${item.lang}`, item.voiceURI));
  voice.value = [...voice.options].some((option) => option.value === previous) ? previous : '';
}

function clearEditor() {
  form.reset();
  cardId.value = '';
  byId('save-card').textContent = 'Save card';
  byId<HTMLOutputElement>('rate-output').value = `${rate.value}×`;
}

function editCard(card: PronunciationCard) {
  cardId.value = card.id;
  term.value = card.term;
  alias.value = card.alias;
  ipa.value = card.ipa;
  notes.value = card.notes;
  byId('save-card').textContent = 'Update card';
  activateTab(byId<HTMLButtonElement>('editor-tab'));
  term.focus();
  announce(`Editing “${card.term}”.`);
}

async function copyText(value: string, label: string) {
  try {
    await navigator.clipboard.writeText(value);
    announce(`${label} copied to the clipboard.`, 'success');
  } catch {
    announce('Clipboard access was blocked. Try again after focusing the extension.', 'error');
  }
}

function renderCards() {
  const query = byId<HTMLInputElement>('search').value.trim().toLocaleLowerCase();
  const shown = cards.filter((card) => `${card.term} ${card.alias} ${card.ipa}`.toLocaleLowerCase().includes(query));
  byId('card-count').textContent = String(cards.length);
  byId('empty-cards').hidden = cards.length > 0;
  byId('empty-search').hidden = cards.length === 0 || shown.length > 0;
  list.replaceChildren();

  for (const card of shown) {
    const item = document.createElement('li');
    item.className = 'saved-card';
    const copy = document.createElement('div');
    const title = document.createElement('h2');
    title.textContent = card.term;
    const spoken = document.createElement('p');
    spoken.className = 'spoken';
    spoken.textContent = `Say: ${card.alias}`;
    copy.append(title, spoken);
    if (card.ipa) {
      const transcription = document.createElement('p');
      transcription.className = 'ipa mono';
      transcription.textContent = `IPA: ${card.ipa}`;
      copy.append(transcription);
    }
    const actions = document.createElement('div');
    actions.className = 'card-actions';
    const preview = document.createElement('button');
    preview.type = 'button'; preview.className = 'icon-action'; preview.textContent = 'Listen';
    preview.setAttribute('aria-label', `Preview ${card.term}`);
    preview.addEventListener('click', () => speakPreview(card.alias));
    const ssml = document.createElement('button');
    ssml.type = 'button'; ssml.className = 'icon-action'; ssml.textContent = 'Copy SSML';
    ssml.setAttribute('aria-label', `Copy SSML for ${card.term}`);
    ssml.addEventListener('click', () => void copyText(toSsml(card), 'SSML card'));
    const edit = document.createElement('button');
    edit.type = 'button'; edit.className = 'icon-action'; edit.textContent = 'Edit';
    edit.setAttribute('aria-label', `Edit ${card.term}`);
    edit.addEventListener('click', () => editCard(card));
    const remove = document.createElement('button');
    remove.type = 'button'; remove.className = 'icon-action danger-text'; remove.textContent = 'Delete';
    remove.setAttribute('aria-label', `Delete ${card.term}`);
    remove.addEventListener('click', () => {
      pendingDelete = card;
      byId('delete-description').textContent = `“${card.term}” will no longer be replaced when selections are read.`;
      dialog.showModal();
      dialog.querySelector<HTMLButtonElement>('[value="cancel"]')?.focus();
    });
    actions.append(preview, ssml, edit, remove);
    item.append(copy, actions);
    list.append(item);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const input = { term: term.value, alias: alias.value, ipa: ipa.value, notes: notes.value };
  const errors = validateCardInput(input);
  if (errors.length) {
    announce(errors[0]!, 'error');
    (!term.value.trim() ? term : alias).focus();
    return;
  }
  const duplicate = cards.find((card) => card.term.toLocaleLowerCase() === term.value.trim().toLocaleLowerCase() && card.id !== cardId.value);
  if (duplicate) return announce(`“${duplicate.term}” already has a card. Edit that card instead.`, 'error');
  try {
    const existing = cards.find((card) => card.id === cardId.value);
    const saved = existing ? updateCard(existing, input) : createCard(input);
    cards = existing ? cards.map((card) => card.id === existing.id ? saved : card) : [...cards, saved];
    cards.sort((a, b) => a.term.localeCompare(b.term));
    await setCards(cards);
    clearEditor();
    renderCards();
    announce(`Saved “${saved.term}” locally.`, 'success');
  } catch (error) {
    announce(error instanceof Error ? error.message : 'The card could not be saved.', 'error');
  }
});

byId('preview').addEventListener('click', () => speakPreview(alias.value.trim() || term.value.trim()));
rate.addEventListener('input', () => { byId<HTMLOutputElement>('rate-output').value = `${rate.value}×`; });
for (const control of [voice, rate]) control.addEventListener('change', () => void setSettings({ voiceURI: voice.value, rate: Number(rate.value) }));
byId<HTMLInputElement>('search').addEventListener('input', renderCards);
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-open-editor]')) button.addEventListener('click', () => activateTab(byId<HTMLButtonElement>('editor-tab')));

dialog.addEventListener('close', async () => {
  if (dialog.returnValue !== 'confirm' || !pendingDelete) { pendingDelete = undefined; return; }
  deletedCard = pendingDelete;
  cards = cards.filter((card) => card.id !== pendingDelete!.id);
  await setCards(cards);
  renderCards();
  byId('undo-message').textContent = `Deleted “${pendingDelete.term}”.`;
  byId('undo-wrap').hidden = false;
  pendingDelete = undefined;
});

byId('undo').addEventListener('click', async () => {
  if (!deletedCard) return;
  cards = mergeGlossaries(cards, [deletedCard]);
  await setCards(cards);
  renderCards();
  announce(`Restored “${deletedCard.term}”.`, 'success');
  deletedCard = undefined;
  byId('undo-wrap').hidden = true;
});

byId('export').addEventListener('click', () => {
  if (!cards.length) return announce('Add at least one card before exporting.', 'error');
  const url = URL.createObjectURL(new Blob([serializeGlossary(cards)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `pronunciation-cards-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
  announce(`Exported ${cards.length} ${cards.length === 1 ? 'card' : 'cards'}.`, 'success');
});

byId<HTMLInputElement>('import-file').addEventListener('change', async (event) => {
  const file = (event.currentTarget as HTMLInputElement).files?.[0];
  if (!file) return;
  if (file.size > 2_000_000) return announce('That file is larger than 2 MB. Choose a smaller glossary.', 'error');
  byId<HTMLTextAreaElement>('import-json').value = await file.text();
  announce(`Loaded “${file.name}”. Review the import choice, then import.`);
});

byId('import').addEventListener('click', async () => {
  const raw = byId<HTMLTextAreaElement>('import-json').value.trim();
  if (!raw) return announce('Choose a file or paste glossary JSON first.', 'error');
  try {
    const incoming = parseGlossary(raw).cards;
    const mode = document.querySelector<HTMLInputElement>('input[name="import-mode"]:checked')?.value;
    if (mode === 'replace' && cards.length && !window.confirm(`Replace all ${cards.length} current cards with ${incoming.length} imported cards?`)) return;
    cards = mode === 'replace' ? [...incoming] : mergeGlossaries(cards, incoming);
    await setCards(cards);
    renderCards();
    announce(`Imported ${incoming.length} ${incoming.length === 1 ? 'card' : 'cards'}.`, 'success');
  } catch (error) {
    announce(error instanceof Error ? error.message : 'The glossary could not be imported.', 'error');
  }
});

byId('read-selection').addEventListener('click', async () => {
  if (!selectedPageText) return announce('Select text on a web page first.', 'error');
  try {
    const [active] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!active?.id) throw new Error();
    const spokenText = applyPronunciations(selectedPageText, cards);
    await browser.scripting.executeScript({
      target: { tabId: active.id },
      func: (textToSpeak: string, voiceURI: string, speechRate: number) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = Math.min(1.5, Math.max(0.5, speechRate));
        utterance.voice = window.speechSynthesis.getVoices().find((candidate) => candidate.voiceURI === voiceURI) ?? null;
        window.speechSynthesis.speak(utterance);
      },
      args: [spokenText, voice.value, Number(rate.value)],
    });
    announce(`Reading with ${cards.length} saved ${cards.length === 1 ? 'card' : 'cards'} applied.`, 'success');
  } catch {
    announce('This browser page blocks extension reading. Try a regular web page.', 'error');
  }
});

async function loadSelection() {
  const note = byId('selection-note');
  try {
    const [active] = await browser.tabs.query({ active: true, currentWindow: true });
    if (active?.id) {
      const [result] = await browser.scripting.executeScript({
        target: { tabId: active.id },
        func: () => {
          const activeElement = document.activeElement;
          if (activeElement instanceof HTMLTextAreaElement || activeElement instanceof HTMLInputElement) {
            const start = activeElement.selectionStart ?? 0;
            const end = activeElement.selectionEnd ?? 0;
            if (end > start) return activeElement.value.slice(start, end).trim();
          }
          return window.getSelection()?.toString().trim() ?? '';
        },
      });
      if (typeof result?.result === 'string' && result.result) selectedPageText = result.result.slice(0, 5000);
    }
  } catch {
    // Restricted pages have no selection bridge; manual entry remains available.
  }
  if (!selectedPageText) {
    const stored = await browser.storage.local.get(PENDING_TERM_KEY);
    if (typeof stored[PENDING_TERM_KEY] === 'string') {
      selectedPageText = stored[PENDING_TERM_KEY] as string;
      await browser.storage.local.remove(PENDING_TERM_KEY);
    }
  }
  if (!selectedPageText) return;
  const candidate = selectedPageText.replace(/\s+/g, ' ').trim();
  if (candidate.length <= 80) term.value = candidate;
  note.textContent = candidate.length <= 80 ? `Selected from page: “${candidate}”` : `Page selection captured (${candidate.length} characters). Add a short term below or read the full selection.`;
  note.hidden = false;
  byId('read-selection').hidden = false;
}

async function init() {
  [cards] = await Promise.all([getCards(), loadSelection()]);
  const settings = await getSettings();
  rate.value = String(settings.rate);
  byId<HTMLOutputElement>('rate-output').value = `${settings.rate}×`;
  loadVoices();
  voice.value = settings.voiceURI;
  if ('speechSynthesis' in window) window.speechSynthesis.addEventListener('voiceschanged', loadVoices, { once: true });
  renderCards();
}

void init().catch(() => announce('Pronunciation Cards could not read local storage. Reload the extension.', 'error'));

// Exported for a tiny smoke hook in tests and devtools without exposing storage.
export { applyPronunciations };
