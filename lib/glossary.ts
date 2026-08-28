export const SCHEMA_VERSION = 1;

export interface PronunciationCard {
  id: string;
  term: string;
  alias: string;
  ipa: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CardInput {
  term: string;
  alias: string;
  ipa?: string;
  notes?: string;
}

export interface GlossaryExport {
  schemaVersion: 1;
  exportedAt: string;
  cards: PronunciationCard[];
}

const LIMITS = { term: 80, alias: 160, ipa: 120, notes: 500 } as const;

function clean(value: unknown): string {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

export function validateCardInput(input: CardInput): string[] {
  const values = {
    term: clean(input.term),
    alias: clean(input.alias),
    ipa: clean(input.ipa),
    notes: clean(input.notes),
  };
  const errors: string[] = [];
  if (!values.term) errors.push('Enter the written term.');
  if (!values.alias) errors.push('Enter how the term should sound.');
  for (const key of Object.keys(LIMITS) as Array<keyof typeof LIMITS>) {
    if (values[key].length > LIMITS[key]) errors.push(`${key === 'ipa' ? 'IPA' : key[0]!.toUpperCase() + key.slice(1)} is too long.`);
  }
  return errors;
}

export function createCard(input: CardInput, id: string = crypto.randomUUID(), now = new Date().toISOString()): PronunciationCard {
  const errors = validateCardInput(input);
  if (errors.length) throw new Error(errors[0]);
  return {
    id,
    term: clean(input.term),
    alias: clean(input.alias),
    ipa: clean(input.ipa),
    notes: clean(input.notes),
    createdAt: now,
    updatedAt: now,
  };
}

export function updateCard(card: PronunciationCard, input: CardInput, now = new Date().toISOString()): PronunciationCard {
  const next = createCard(input, card.id, card.createdAt);
  next.updatedAt = now;
  return next;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function applyPronunciations(text: string, cards: PronunciationCard[]): string {
  return [...cards]
    .filter((card) => card.term && card.alias)
    .sort((a, b) => b.term.length - a.term.length)
    .reduce((result, card) => {
      const pattern = new RegExp(`(^|[^\\p{L}\\p{N}_])${escapeRegExp(card.term)}(?=$|[^\\p{L}\\p{N}_])`, 'giu');
      return result.replace(pattern, (_match, prefix: string) => `${prefix}${card.alias}`);
    }, text);
}

function escapeXml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');
}

export function toSsml(card: PronunciationCard): string {
  const term = escapeXml(card.term);
  if (card.ipa) return `<speak><phoneme alphabet="ipa" ph="${escapeXml(card.ipa)}">${term}</phoneme></speak>`;
  return `<speak><sub alias="${escapeXml(card.alias)}">${term}</sub></speak>`;
}

export function serializeGlossary(cards: PronunciationCard[], now = new Date().toISOString()): string {
  return JSON.stringify({ schemaVersion: SCHEMA_VERSION, exportedAt: now, cards }, null, 2);
}

function isCard(value: unknown): value is PronunciationCard {
  if (!value || typeof value !== 'object') return false;
  const card = value as Record<string, unknown>;
  return ['id', 'term', 'alias', 'ipa', 'notes', 'createdAt', 'updatedAt'].every((key) => typeof card[key] === 'string') &&
    validateCardInput(card as unknown as CardInput).length === 0;
}

export function parseGlossary(json: string): GlossaryExport {
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch {
    throw new Error('That file is not valid JSON. Export it again and retry.');
  }
  if (!value || typeof value !== 'object') throw new Error('This is not a Pronunciation Cards glossary.');
  const data = value as Record<string, unknown>;
  if (data.schemaVersion !== SCHEMA_VERSION) throw new Error('This glossary version is not supported.');
  if (!Array.isArray(data.cards) || !data.cards.every(isCard)) throw new Error('One or more cards are missing required fields.');
  if (data.cards.length > 5000) throw new Error('This glossary has more than 5,000 cards. Split it into smaller files.');
  return data as unknown as GlossaryExport;
}

export function mergeGlossaries(current: PronunciationCard[], incoming: PronunciationCard[]): PronunciationCard[] {
  const byTerm = new Map(current.map((card) => [card.term.toLocaleLowerCase(), card]));
  for (const card of incoming) byTerm.set(card.term.toLocaleLowerCase(), card);
  return [...byTerm.values()].sort((a, b) => a.term.localeCompare(b.term));
}
