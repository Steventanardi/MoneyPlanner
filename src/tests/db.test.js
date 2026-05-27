import { describe, it, expect, beforeEach, vi } from 'vitest';
import 'fake-indexeddb/auto';

// fake-indexeddb/auto polyfills globalThis.indexedDB before any import below
import { saveReceipt, getReceipt, deleteReceipt } from '../utils/db';

// Reset the fake IndexedDB between tests so state doesn't bleed
import { IDBFactory } from 'fake-indexeddb';

beforeEach(() => {
  // Replace the global IDB instance with a fresh one each test
  globalThis.indexedDB = new IDBFactory();
});

// ─── saveReceipt ──────────────────────────────────────────────────────────────
describe('saveReceipt', () => {
  it('saves a receipt without throwing', async () => {
    await expect(saveReceipt('txn-1', 'data:image/png;base64,abc123')).resolves.toBeUndefined();
  });

  it('overwrites an existing receipt with the same key', async () => {
    await saveReceipt('txn-2', 'first-value');
    await saveReceipt('txn-2', 'second-value');

    const result = await getReceipt('txn-2');
    expect(result).toBe('second-value');
  });
});

// ─── getReceipt ───────────────────────────────────────────────────────────────
describe('getReceipt', () => {
  it('returns the stored base64 image', async () => {
    const imageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgAB';
    await saveReceipt('txn-3', imageData);

    const result = await getReceipt('txn-3');
    expect(result).toBe(imageData);
  });

  it('returns undefined for a missing key', async () => {
    const result = await getReceipt('does-not-exist');
    expect(result).toBeUndefined();
  });

  it('retrieves the correct receipt when multiple are stored', async () => {
    await saveReceipt('txn-a', 'image-a');
    await saveReceipt('txn-b', 'image-b');

    expect(await getReceipt('txn-a')).toBe('image-a');
    expect(await getReceipt('txn-b')).toBe('image-b');
  });
});

// ─── deleteReceipt ────────────────────────────────────────────────────────────
describe('deleteReceipt', () => {
  it('removes a stored receipt', async () => {
    await saveReceipt('txn-del', 'some-image');
    await deleteReceipt('txn-del');

    const result = await getReceipt('txn-del');
    expect(result).toBeUndefined();
  });

  it('resolves without error for a non-existent key', async () => {
    await expect(deleteReceipt('ghost-key')).resolves.toBeUndefined();
  });

  it('only deletes the targeted receipt', async () => {
    await saveReceipt('keep-me', 'image-keep');
    await saveReceipt('delete-me', 'image-delete');

    await deleteReceipt('delete-me');

    expect(await getReceipt('keep-me')).toBe('image-keep');
    expect(await getReceipt('delete-me')).toBeUndefined();
  });
});
