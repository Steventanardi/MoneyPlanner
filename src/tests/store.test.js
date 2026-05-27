import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock supabase so the store module loads without real network
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      upsert: vi.fn().mockResolvedValue({}),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null }),
    })),
  },
}));

// Provide crypto.randomUUID in jsdom
if (!globalThis.crypto.randomUUID) {
  let counter = 0;
  globalThis.crypto.randomUUID = () => `test-uuid-${++counter}`;
}

import { useStore } from '../store/useStore';

// Helper: reset store to a clean state before each test
function resetStore() {
  useStore.setState({
    currentUser: { id: 'user-1', name: 'Tester' },
    selectedMonth: '2025-01',
    currency: 'TWD',
    exchangeRate: 500,
    data: {
      banks: [],
      transactions: [],
      savingsGoals: [],
      budgets: [],
      customCategories: [],
      subscriptions: [],
      bills: [],
      inventory: [],
      emergencyFund: 0,
      monthlyBudget: 30000,
    },
    lastBillResetMonth: null,
  });
}

// ─── addTransaction ──────────────────────────────────────────────────────────
describe('addTransaction', () => {
  beforeEach(resetStore);

  it('prepends a transaction with generated id and userId', () => {
    const { addTransaction } = useStore.getState();
    addTransaction({ type: 'expense', amount: 500, category: 'Food', description: 'Lunch' });

    const { transactions } = useStore.getState().data;
    expect(transactions).toHaveLength(1);
    expect(transactions[0].type).toBe('expense');
    expect(transactions[0].amount).toBe(500);
    expect(transactions[0].userId).toBe('user-1');
    expect(transactions[0].id).toBeTruthy();
  });

  it('honours caller-supplied id', () => {
    const { addTransaction } = useStore.getState();
    addTransaction({ id: 'my-id', type: 'income', amount: 1000, category: 'Salary' });

    const { transactions } = useStore.getState().data;
    expect(transactions[0].id).toBe('my-id');
  });

  it('uses today as default date', () => {
    const today = new Date().toISOString().split('T')[0];
    const { addTransaction } = useStore.getState();
    addTransaction({ type: 'expense', amount: 100, category: 'Food' });

    expect(useStore.getState().data.transactions[0].date).toBe(today);
  });

  it('stacks multiple transactions newest-first', () => {
    const { addTransaction } = useStore.getState();
    addTransaction({ id: 'a', type: 'expense', amount: 100, category: 'Food' });
    addTransaction({ id: 'b', type: 'expense', amount: 200, category: 'Food' });

    const ids = useStore.getState().data.transactions.map(t => t.id);
    expect(ids[0]).toBe('b');
    expect(ids[1]).toBe('a');
  });
});

// ─── deleteTransaction ────────────────────────────────────────────────────────
describe('deleteTransaction', () => {
  beforeEach(resetStore);

  it('removes the transaction with the given id', () => {
    const { addTransaction, deleteTransaction } = useStore.getState();
    addTransaction({ id: 'del-1', type: 'expense', amount: 50, category: 'Food' });
    addTransaction({ id: 'del-2', type: 'expense', amount: 75, category: 'Food' });

    deleteTransaction('del-1');

    const { transactions } = useStore.getState().data;
    expect(transactions).toHaveLength(1);
    expect(transactions[0].id).toBe('del-2');
  });

  it('is a no-op for unknown id', () => {
    const { addTransaction, deleteTransaction } = useStore.getState();
    addTransaction({ id: 'keep', type: 'income', amount: 100, category: 'Salary' });

    deleteTransaction('ghost');

    expect(useStore.getState().data.transactions).toHaveLength(1);
  });
});

// ─── updateTransaction ────────────────────────────────────────────────────────
describe('updateTransaction', () => {
  beforeEach(resetStore);

  it('merges updates into the target transaction', () => {
    const { addTransaction, updateTransaction } = useStore.getState();
    addTransaction({ id: 'upd-1', type: 'expense', amount: 100, category: 'Food' });

    updateTransaction('upd-1', { amount: 200, description: 'Updated' });

    const txn = useStore.getState().data.transactions.find(t => t.id === 'upd-1');
    expect(txn.amount).toBe(200);
    expect(txn.description).toBe('Updated');
    expect(txn.category).toBe('Food'); // untouched field preserved
  });
});

// ─── addBank / deleteBank ─────────────────────────────────────────────────────
describe('addBank', () => {
  beforeEach(resetStore);

  it('adds a bank with correct fields', () => {
    const { addBank } = useStore.getState();
    addBank('My Bank', '50000', 'TWD', false);

    const { banks } = useStore.getState().data;
    expect(banks).toHaveLength(1);
    expect(banks[0].name).toBe('My Bank');
    expect(banks[0].value).toBe(50000);
    expect(banks[0].currency).toBe('TWD');
    expect(banks[0].userId).toBe('user-1');
    expect(banks[0].isJoint).toBe(false);
  });
});

describe('deleteBank', () => {
  beforeEach(resetStore);

  it('removes the bank with the given id', () => {
    useStore.setState(state => ({
      data: {
        ...state.data,
        banks: [
          { id: 'b1', name: 'A', value: 1000, currency: 'TWD', userId: 'user-1' },
          { id: 'b2', name: 'B', value: 2000, currency: 'IDR', userId: 'user-1' },
        ],
      },
    }));

    useStore.getState().deleteBank('b1');

    const { banks } = useStore.getState().data;
    expect(banks).toHaveLength(1);
    expect(banks[0].id).toBe('b2');
  });
});

// ─── addBill / toggleBillStatus ───────────────────────────────────────────────
describe('addBill', () => {
  beforeEach(resetStore);

  it('adds a bill with isPaid=false', () => {
    const { addBill } = useStore.getState();
    addBill({ name: 'Electricity', amount: 300, isRecurring: true });

    const { bills } = useStore.getState().data;
    expect(bills).toHaveLength(1);
    expect(bills[0].name).toBe('Electricity');
    expect(bills[0].isPaid).toBe(false);
    expect(bills[0].userId).toBe('user-1');
  });
});

describe('toggleBillStatus', () => {
  beforeEach(resetStore);

  it('flips isPaid from false to true', () => {
    const { addBill, toggleBillStatus } = useStore.getState();
    addBill({ name: 'Water', amount: 100, isRecurring: false });
    const billId = useStore.getState().data.bills[0].id;

    toggleBillStatus(billId);

    expect(useStore.getState().data.bills[0].isPaid).toBe(true);
  });

  it('flips isPaid back to false', () => {
    const { addBill, toggleBillStatus } = useStore.getState();
    addBill({ name: 'Internet', amount: 200, isRecurring: true });
    const billId = useStore.getState().data.bills[0].id;

    toggleBillStatus(billId);
    toggleBillStatus(billId);

    expect(useStore.getState().data.bills[0].isPaid).toBe(false);
  });
});

// ─── checkAndResetBills ───────────────────────────────────────────────────────
describe('checkAndResetBills', () => {
  beforeEach(resetStore);

  it('resets recurring bills when month changes', () => {
    useStore.setState(state => ({
      lastBillResetMonth: '2024-12',
      data: {
        ...state.data,
        bills: [
          { id: 'bill-r', name: 'Rent', amount: 5000, isRecurring: true, isPaid: true, userId: 'user-1' },
          { id: 'bill-o', name: 'One-off', amount: 100, isRecurring: false, isPaid: true, userId: 'user-1' },
        ],
      },
    }));

    useStore.getState().checkAndResetBills();

    const { bills } = useStore.getState().data;
    expect(bills.find(b => b.id === 'bill-r').isPaid).toBe(false); // recurring reset
    expect(bills.find(b => b.id === 'bill-o').isPaid).toBe(true);  // non-recurring untouched
  });

  it('skips reset when already reset this month', () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    useStore.setState(state => ({
      lastBillResetMonth: currentMonth,
      data: {
        ...state.data,
        bills: [
          { id: 'bill-r2', name: 'Gas', amount: 80, isRecurring: true, isPaid: true, userId: 'user-1' },
        ],
      },
    }));

    useStore.getState().checkAndResetBills();

    const { bills } = useStore.getState().data;
    expect(bills[0].isPaid).toBe(true); // unchanged
  });
});

// ─── getBudgetAlerts ──────────────────────────────────────────────────────────
describe('getBudgetAlerts', () => {
  beforeEach(resetStore);

  it('returns alert when spending >= 80% of budget', () => {
    useStore.setState(state => ({
      data: {
        ...state.data,
        budgets: [{ category: 'Food', limit: 1000, month: '2025-01', userId: 'user-1' }],
        transactions: [
          { id: 't1', type: 'expense', amount: 850, category: 'Food', date: '2025-01-10', userId: 'user-1' },
        ],
      },
    }));

    const alerts = useStore.getState().getBudgetAlerts();
    expect(alerts).toHaveLength(1);
    expect(alerts[0].category).toBe('Food');
    expect(alerts[0].pct).toBeCloseTo(0.85);
  });

  it('returns no alerts when under 80%', () => {
    useStore.setState(state => ({
      data: {
        ...state.data,
        budgets: [{ category: 'Food', limit: 1000, month: '2025-01', userId: 'user-1' }],
        transactions: [
          { id: 't2', type: 'expense', amount: 500, category: 'Food', date: '2025-01-05', userId: 'user-1' },
        ],
      },
    }));

    const alerts = useStore.getState().getBudgetAlerts();
    expect(alerts).toHaveLength(0);
  });

  it('returns empty array when no currentUser', () => {
    useStore.setState({ currentUser: null });
    expect(useStore.getState().getBudgetAlerts()).toEqual([]);
  });
});

// ─── formatCurrency ───────────────────────────────────────────────────────────
describe('formatCurrency', () => {
  beforeEach(resetStore);

  it('formats TWD amounts with NT$ symbol', () => {
    useStore.setState({ currency: 'TWD', exchangeRate: 500 });
    const result = useStore.getState().formatCurrency(1000, 'TWD');
    expect(result).toContain('NT$');
    expect(result).toContain('1,000');
  });

  it('formats IDR amounts with Rp symbol', () => {
    useStore.setState({ currency: 'IDR', exchangeRate: 500 });
    const result = useStore.getState().formatCurrency(50000, 'IDR');
    expect(result).toContain('Rp');
  });

  it('converts using exchange rate when no currency code given and active currency is IDR', () => {
    useStore.setState({ currency: 'IDR', exchangeRate: 500 });
    const result = useStore.getState().formatCurrency(10); // 10 TWD * 500 = 5000 IDR
    expect(result).toContain('Rp');
    expect(result).toContain('5,000');
  });
});
