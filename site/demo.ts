import './style.css';
import { applyPronunciations, serializeGlossary, toSsml, type PronunciationCard } from '../lib/glossary';

const DEMO_STORAGE_KEY = 'demo:pronunciation-cards:cards';
const writtenSample = 'Kubernetes services use OAuth with PostgreSQL.';

function sampleCards(): PronunciationCard[] {
  return [
    { id: 'demo-kubernetes', term: 'Kubernetes', alias: 'cue burr NET eez', ipa: 'ˌkuːbərˈnɛtiːz', notes: 'Container orchestration platform', createdAt: '2026-08-28T00:00:00.000Z', updatedAt: '2026-08-28T00:00:00.000Z' },
    { id: 'demo-oauth', term: 'OAuth', alias: 'oh auth', ipa: 'oʊ ɔːθ', notes: 'Authorization protocol', createdAt: '2026-08-28T00:00:00.000Z', updatedAt: '2026-08-28T00:00:00.000Z' },
    { id: 'demo-postgresql', term: 'PostgreSQL', alias: 'POST gres cue ell', ipa: 'ˈpoʊstɡrɛs kjuː ɛl', notes: 'Database name', createdAt: '2026-08-28T00:00:00.000Z', updatedAt: '2026-08-28T00:00:00.000Z' },
    { id: 'demo-ngrok', term: 'ngrok', alias: 'en grok', ipa: 'ɛn ɡrɒk', notes: 'Secure tunnel tool', createdAt: '2026-08-28T00:00:00.000Z', updatedAt: '2026-08-28T00:00:00.000Z' },
  ];
}

function loadCards(): PronunciationCard[] {
  try {
    const stored = localStorage.getItem(DEMO_STORAGE_KEY);
    const cards = stored ? JSON.parse(stored) : null;
    if (Array.isArray(cards) && cards.every((card) => card && typeof card.term === 'string' && typeof card.alias === 'string')) return cards as PronunciationCard[];
  } catch {
    // A fresh sample is safer than an unreadable demo value.
  }
  const cards = sampleCards();
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(cards));
  return cards;
}

let cards = loadCards();
let deletedCard: PronunciationCard | undefined;

const byId = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing demo element #${id}`);
  return element as T;
};

const status = byId<HTMLParagraphElement>('demo-status');
const undo = byId<HTMLElement>('demo-undo');

function saveCards() {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(cards));
}

function announce(message: string) {
  status.textContent = message;
}

function copyText(value: string, label: string) {
  void (async () => {
    try {
      await navigator.clipboard.writeText(value);
      announce(`${label} copied from the sample.`);
    } catch {
      announce(`${label} is ready to copy in a browser that allows clipboard access.`);
    }
  })();
}

function preview(text: string) {
  if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
    announce('Speech preview is not available in this browser.');
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.86;
  utterance.onstart = () => announce(`Playing “${text}”.`);
  utterance.onend = () => announce('Sample preview finished.');
  utterance.onerror = () => announce('The browser could not play this sample.');
  window.speechSynthesis.speak(utterance);
}

function render() {
  byId<HTMLOutputElement>('spoken-output').value = applyPronunciations(writtenSample, cards);
  byId('demo-card-count').textContent = String(cards.length);
  const list = byId<HTMLUListElement>('demo-card-list');
  list.replaceChildren();
  for (const card of cards) {
    const item = document.createElement('li');
    item.className = 'demo-card';
    const copy = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = card.term;
    const alias = document.createElement('p');
    alias.className = 'demo-alias';
    alias.textContent = `Say: ${card.alias}`;
    const ipa = document.createElement('p');
    ipa.className = 'demo-ipa';
    ipa.textContent = `IPA: /${card.ipa}/`;
    const note = document.createElement('p');
    note.className = 'demo-note';
    note.textContent = card.notes;
    copy.append(title, alias, ipa, note);
    const actions = document.createElement('div');
    actions.className = 'demo-card-actions';
    const listen = document.createElement('button');
    listen.type = 'button'; listen.textContent = 'Preview'; listen.setAttribute('aria-label', `Preview ${card.term}`);
    listen.addEventListener('click', () => preview(card.alias));
    const ssml = document.createElement('button');
    ssml.type = 'button'; ssml.textContent = 'Copy SSML'; ssml.setAttribute('aria-label', `Copy SSML for ${card.term}`);
    ssml.addEventListener('click', () => copyText(toSsml(card), 'SSML'));
    const remove = document.createElement('button');
    remove.type = 'button'; remove.textContent = 'Remove sample card'; remove.className = 'danger-text'; remove.setAttribute('aria-label', `Remove ${card.term} from the sample`);
    remove.addEventListener('click', () => {
      deletedCard = card;
      cards = cards.filter((candidate) => candidate.id !== card.id);
      saveCards();
      render();
      byId('demo-undo-message').textContent = `Removed “${card.term}” from this sample.`;
      undo.hidden = false;
      announce('Sample card removed. Use Undo or Reset demo.');
    });
    actions.append(listen, ssml, remove);
    item.append(copy, actions);
    list.append(item);
  }
}

byId('read-sample').addEventListener('click', () => preview(applyPronunciations(writtenSample, cards)));
byId('reset-demo').addEventListener('click', () => {
  cards = sampleCards();
  deletedCard = undefined;
  saveCards();
  undo.hidden = true;
  render();
  announce('Sample restored. Your real extension data was not changed.');
});
byId('undo-demo').addEventListener('click', () => {
  if (!deletedCard) return;
  cards = [...cards, deletedCard].sort((a, b) => a.term.localeCompare(b.term));
  saveCards();
  const restored = deletedCard.term;
  deletedCard = undefined;
  undo.hidden = true;
  render();
  announce(`Restored “${restored}” to the sample.`);
});
byId('start-real').addEventListener('click', () => localStorage.removeItem(DEMO_STORAGE_KEY));
byId('export-demo').addEventListener('click', () => {
  const href = URL.createObjectURL(new Blob([serializeGlossary(cards, '2026-08-28T00:00:00.000Z')], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = href;
  link.download = 'pronunciation-cards-sample.json';
  link.click();
  URL.revokeObjectURL(href);
  announce(`Exported ${cards.length} sample cards as JSON.`);
});

render();

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => void navigator.serviceWorker.register('/sw.js'));
}

export { DEMO_STORAGE_KEY, sampleCards };
