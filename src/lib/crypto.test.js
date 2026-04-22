import { describe, it, expect } from 'vitest';
import { hashSecret, verifySecret } from './crypto';

describe('crypto', () => {
    it('hashSecret produces base64 hash + salt with iterations', async () => {
        const out = await hashSecret('1234');
        expect(typeof out.hash).toBe('string');
        expect(typeof out.salt).toBe('string');
        expect(out.hash.length).toBeGreaterThan(0);
        expect(out.salt.length).toBeGreaterThan(0);
        expect(out.iterations).toBeGreaterThanOrEqual(100000);
    });

    it('produces different hashes for the same secret (salted)', async () => {
        const a = await hashSecret('1234');
        const b = await hashSecret('1234');
        expect(a.hash).not.toBe(b.hash);
        expect(a.salt).not.toBe(b.salt);
    });

    it('verifySecret returns true for the correct secret', async () => {
        const stored = await hashSecret('2815');
        expect(await verifySecret('2815', stored)).toBe(true);
    });

    it('verifySecret returns false for the wrong secret', async () => {
        const stored = await hashSecret('2815');
        expect(await verifySecret('2816', stored)).toBe(false);
        expect(await verifySecret('', stored)).toBe(false);
    });

    it('verifySecret returns false for a missing or malformed stored entry', async () => {
        expect(await verifySecret('1234', null)).toBe(false);
        expect(await verifySecret('1234', {})).toBe(false);
        expect(await verifySecret('1234', { hash: 'x' })).toBe(false);
    });
});
