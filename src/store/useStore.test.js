import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from './useStore';

const resetStore = () => {
    useStore.setState({
        currentUser: { id: 'steven' },
        data: {
            banks: [{ id: 1, name: 'Bank TWD', value: 1000, currency: 'TWD', userId: 'steven' }],
            transactions: [],
            savingsGoals: [],
            budgets: [],
            customCategories: [],
            subscriptions: [],
            bills: [],
            emergencyFund: 0
        },
        userPinHashes: {}
    });
};

describe('useStore transactions', () => {
    beforeEach(resetStore);

    it('addTransaction prepends a transaction with id + userId + date', () => {
        useStore.getState().addTransaction({
            type: 'expense',
            category: 'Food',
            amount: 50,
            bankId: 1
        });
        const txns = useStore.getState().data.transactions;
        expect(txns).toHaveLength(1);
        expect(txns[0].userId).toBe('steven');
        expect(txns[0].amount).toBe(50);
        expect(txns[0].id).toBeDefined();
        expect(txns[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('updateTransaction merges fields but preserves id and userId', () => {
        useStore.getState().addTransaction({
            type: 'expense', category: 'Food', amount: 50, bankId: 1
        });
        const original = useStore.getState().data.transactions[0];
        useStore.getState().updateTransaction(original.id, {
            amount: 75, category: 'Transport', id: 999, userId: 'attacker'
        });
        const updated = useStore.getState().data.transactions[0];
        expect(updated.id).toBe(original.id);
        expect(updated.userId).toBe('steven');
        expect(updated.amount).toBe(75);
        expect(updated.category).toBe('Transport');
    });

    it('updateTransaction is a no-op when id is unknown', () => {
        useStore.getState().addTransaction({
            type: 'expense', category: 'Food', amount: 50, bankId: 1
        });
        const before = useStore.getState().data.transactions;
        useStore.getState().updateTransaction(99999, { amount: 0 });
        expect(useStore.getState().data.transactions).toEqual(before);
    });

    it('deleteTransaction removes a transaction by id', () => {
        useStore.getState().addTransaction({
            type: 'expense', category: 'Food', amount: 50, bankId: 1
        });
        const id = useStore.getState().data.transactions[0].id;
        useStore.getState().deleteTransaction(id);
        expect(useStore.getState().data.transactions).toHaveLength(0);
    });
});

describe('useStore pin actions', () => {
    beforeEach(resetStore);

    it('hasUserPin is false before a PIN is set', () => {
        expect(useStore.getState().hasUserPin('steven')).toBe(false);
    });

    it('setUserPin stores a hash and verifyUserPin round-trips', async () => {
        await useStore.getState().setUserPin('steven', '2815');
        expect(useStore.getState().hasUserPin('steven')).toBe(true);
        expect(await useStore.getState().verifyUserPin('steven', '2815')).toBe(true);
        expect(await useStore.getState().verifyUserPin('steven', '0000')).toBe(false);
    });

    it('verifyUserPin returns false when no hash exists', async () => {
        expect(await useStore.getState().verifyUserPin('ghost', '0000')).toBe(false);
    });
});
