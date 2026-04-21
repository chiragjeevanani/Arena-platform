import { describe, it, expect } from 'vitest';
import { mapCmsContentToEventCard } from '../src/utils/arenaCmsEventAdapter';

describe('arenaCmsEventAdapter', () => {
  it('maps published CMS row to Live card with listCode', () => {
    const card = mapCmsContentToEventCard({
      id: '507f1f77bcf86cd799439011',
      title: 'Spring Open',
      subtitle: 'Court A',
      imageUrl: '',
      isPublished: true,
      createdAt: '2026-04-01T12:00:00.000Z',
    });
    expect(card.title).toBe('Spring Open');
    expect(card.status).toBe('Live');
    expect(card.type).toBe('EVENT');
    expect(card.listCode).toBe('439011');
    expect(card.venue).toBe('Court A');
    expect(card.banner).toMatch(/^https:\/\//);
  });

  it('draft uses Drafting status', () => {
    const card = mapCmsContentToEventCard({
      id: 'aaaaaaaaaaaaaaaaaaaaaaaa',
      title: 'TBD',
      isPublished: false,
    });
    expect(card.status).toBe('Drafting');
  });
});
