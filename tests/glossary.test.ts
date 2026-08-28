import { describe, expect, it } from 'vitest';
import { applyPronunciations, createCard, mergeGlossaries, parseGlossary, serializeGlossary, toSsml, updateCard, validateCardInput } from '../lib/glossary';

const now = '2026-08-28T00:00:00.000Z';
const kubernetes = createCard({ term: 'Kubernetes', alias: 'cue burr NET eez', ipa: 'ˌkuːbərˈnɛtiːz' }, 'card-1', now);

describe('pronunciation cards', () => {
  it('creates a trimmed card and preserves identity on update', () => {
    const card = createCard({ term: '  SQL ', alias: ' sequel  ', notes: ' team choice ' }, 'card-2', now);
    expect(card).toMatchObject({ id: 'card-2', term: 'SQL', alias: 'sequel', notes: 'team choice' });
    expect(updateCard(card, { term: 'SQL', alias: 'ess cue ell' }, '2026-08-29T00:00:00.000Z')).toMatchObject({ id: 'card-2', createdAt: now, updatedAt: '2026-08-29T00:00:00.000Z' });
  });

  it('validates required and bounded fields', () => {
    expect(validateCardInput({ term: '', alias: '' })).toEqual(['Enter the written term.', 'Enter how the term should sound.']);
    expect(validateCardInput({ term: 'x'.repeat(81), alias: 'x' })).toContain('Term is too long.');
  });

  it('applies longer terms first, case-insensitively, without matching inside words', () => {
    const cards = [
      createCard({ term: 'API', alias: 'A P I' }, 'api', now),
      createCard({ term: 'API Gateway', alias: 'A P I gate way' }, 'gateway', now),
      createCard({ term: 'C++', alias: 'C plus plus' }, 'cpp', now),
    ];
    expect(applyPronunciations('The API Gateway uses an API and C++; apiculture does not.', cards))
      .toBe('The A P I gate way uses an A P I and C plus plus; apiculture does not.');
  });

  it('creates escaped IPA SSML and alias SSML', () => {
    expect(toSsml(kubernetes)).toBe('<speak><phoneme alphabet="ipa" ph="ˌkuːbərˈnɛtiːz">Kubernetes</phoneme></speak>');
    const aliasCard = createCard({ term: 'R&D', alias: 'research & development' }, 'rd', now);
    expect(toSsml(aliasCard)).toContain('alias="research &amp; development"');
  });

  it('round-trips the portable schema and rejects invalid data', () => {
    const serialized = serializeGlossary([kubernetes], now);
    expect(parseGlossary(serialized).cards).toEqual([kubernetes]);
    expect(() => parseGlossary('{')).toThrow('not valid JSON');
    expect(() => parseGlossary('{"schemaVersion":2,"cards":[]}')).toThrow('not supported');
  });

  it('merges terms case-insensitively with imported values winning', () => {
    const replacement = createCard({ term: 'kubernetes', alias: 'koo ber net ees' }, 'new', now);
    expect(mergeGlossaries([kubernetes], [replacement])).toEqual([replacement]);
  });
});
