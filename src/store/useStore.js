import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { EXCHANGE_RATE_FALLBACK, MAX_PIN_ATTEMPTS, PIN_LOCKOUT_SECONDS } from '../constants';

// Hashes input PIN string with SHA-256, returns hex string
export const hashPin = async (pin) => {
  const encoded = new TextEncoder().encode(pin);
  const buf = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
};

const INITIAL_DATA = {
  banks: [
    { id: 'bank-twd', name: 'Bank TWD', value: 50000, currency: 'TWD', userId: 'steven' },
    { id: 'bank-idr', name: 'Bank IDR', value: 10000000, currency: 'IDR', userId: 'steven' },
    { id: 'bank-girl', name: 'Girlfriend Bank', value: 20000, currency: 'TWD', userId: 'girl' }
  ],
  transactions: [],
  savingsGoals: [],
  budgets: [],
  customCategories: [
    { id: 'cat-1', name: 'Food', icon: 'Coffee', color: '#FF9500', type: 'expense' },
    { id: 'cat-2', name: 'Transport', icon: 'Car', color: '#007AFF', type: 'expense' },
    { id: 'cat-3', name: 'Salary', icon: 'TrendingUp', color: '#34C759', type: 'income' }
  ],
  subscriptions: [],
  bills: [],
  emergencyFund: 20000,
  monthlyBudget: 30000
};

// PINs stored as SHA-256 hashes — never plaintext
export const USERS = [
  { id: 'steven', name: 'Steven', color: '#007AFF', avatar: 'S', pinHash: '8e5fabc4550b9c8521b119ede0270237fd4891a697330a2ef5fdea4dde53bf13', role: 'Owner' },
  { id: 'girl', name: 'Priscilla', color: '#FF3B30', avatar: 'G', pinHash: 'aa82088246685c17ebf16d48877686b831ed384ffdc42e76494283c271704d7a', role: 'Family' }
];

export const useStore = create(
  persist(
    (set, get) => ({
      // --- Core State ---
      currentUser: null,
      data: INITIAL_DATA,
      selectedMonth: new Date().toISOString().slice(0, 7), // YYYY-MM
      currency: 'TWD',
      exchangeRate: EXCHANGE_RATE_FALLBACK,
      activeScreen: 'dashboard',
      theme: 'light',
      userThemes: {}, // {userId: 'light' | 'dark'}
      userBiometrics: {}, // {userId: boolean}
      lastActive: Date.now(),
      isSyncing: false,
      lastSyncedAt: null,
      pinAttempts: {},
      pinLockoutUntil: {},
      lastBillResetMonth: null, // YYYY-MM of last bill reset
      isAddingTransaction: false,
      isSettingsOpen: false,

      // --- Auth Actions ---
      setCurrentUser: (user) => {
        const userId = user?.id;
        const savedTheme = get().userThemes?.[userId] || 'light';
        set({ 
          currentUser: user, 
          activeScreen: 'dashboard', 
          lastActive: Date.now(),
          theme: savedTheme
        });
      },
      logout: () => set({ currentUser: null, activeScreen: 'dashboard' }),
      toggleTheme: () => {
        const { theme, currentUser, userThemes } = get();
        const newTheme = theme === 'light' ? 'dark' : 'light';
        const newUserThemes = { ...userThemes };
        if (currentUser) newUserThemes[currentUser.id] = newTheme;
        set({ theme: newTheme, userThemes: newUserThemes });
      },
      toggleBiometrics: async () => {
        const { currentUser, userBiometrics } = get();
        if (!currentUser) return;

        // If disabling, just turn it off
        if (userBiometrics[currentUser.id]) {
            const newUserBiometrics = { ...userBiometrics, [currentUser.id]: false };
            set({ userBiometrics: newUserBiometrics });
            return;
        }

        // --- REAL WEBAUTHN ENROLLMENT ---
        try {
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);

            const options = {
                publicKey: {
                    challenge,
                    rp: { name: "MoneyPlanner", id: window.location.hostname },
                    user: {
                        id: Uint8Array.from(currentUser.id, c => c.charCodeAt(0)),
                        name: currentUser.name,
                        displayName: currentUser.name
                    },
                    pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
                    authenticatorSelection: { userVerification: "required", authenticatorAttachment: "platform" },
                    timeout: 60000
                }
            };

            const credential = await navigator.credentials.create(options);
            if (credential) {
                const newUserBiometrics = { ...userBiometrics, [currentUser.id]: true };
                set({ userBiometrics: newUserBiometrics });
            }
        } catch (err) {
            console.error("WebAuthn Enrollment Failed:", err);
            alert("Enrollment failed. Ensure you are on HTTPS or localhost and biometrics are supported.");
        }
      },
      setLastActive: () => set({ lastActive: Date.now() }),
      recordPinFailure: (userId) => set(state => {
        const attempts = (state.pinAttempts[userId] || 0) + 1;
        const newAttempts = { ...state.pinAttempts, [userId]: attempts };
        const newLockout = { ...state.pinLockoutUntil };
        if (attempts >= MAX_PIN_ATTEMPTS) {
          newLockout[userId] = Date.now() + PIN_LOCKOUT_SECONDS * 1000;
          newAttempts[userId] = 0;
        }
        return { pinAttempts: newAttempts, pinLockoutUntil: newLockout };
      }),
      resetPinAttempts: (userId) => set(state => ({
        pinAttempts: { ...state.pinAttempts, [userId]: 0 }
      })),
      fetchExchangeRate: async () => {
        try {
          const res = await fetch('https://api.exchangerate-api.com/v4/latest/TWD');
          const data = await res.json();
          if (data.rates && data.rates.IDR) {
            set({ exchangeRate: data.rates.IDR });
          }
        } catch (e) { console.error('Failed to update rate', e); }
      },
      setCurrency: (c) => set({ currency: c }),
      setActiveScreen: (s) => set({ activeScreen: s }),
      setSelectedMonth: (m) => set({ selectedMonth: m }),
      setIsAddingTransaction: (val) => set({ isAddingTransaction: val }),
      setIsSettingsOpen: (val) => set({ isSettingsOpen: val }),
      updateEmergencyFund: (val) => set(state => ({ 
          data: { ...state.data, emergencyFund: Number(val) } 
      })),

      // --- Bank Actions ---
      addBank: (name, value, curr, isJoint) => set((state) => {
        const newBank = {
          id: crypto.randomUUID(),
          name,
          value: parseFloat(value),
          currency: curr,
          userId: state.currentUser.id,
          isJoint: !!isJoint
        };
        const newData = { ...state.data, banks: [...state.data.banks, newBank] };
        return { data: newData };
      }),

      updateBank: (id, updates) => set((state) => {
        const newData = {
          ...state.data,
          banks: state.data.banks.map(b => b.id === id ? { ...b, ...updates } : b)
        };
        return { data: newData };
      }),

      deleteBank: (id) => set((state) => {
        const newData = {
          ...state.data,
          banks: state.data.banks.filter(b => b.id !== id)
        };
        return { data: newData };
      }),

      // --- Transaction Actions ---
      addTransaction: (txn) => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        const newTxn = {
          ...txn,
          id: txn.id || crypto.randomUUID(), // honour caller-supplied id (e.g. to match receipt key)
          userId: state.currentUser.id,
          date: txn.date || today
        };
        const newData = { ...state.data, transactions: [newTxn, ...state.data.transactions] };
        return { data: newData };
      }),

      deleteTransaction: (id) => set((state) => {
        const newData = {
          ...state.data,
          transactions: state.data.transactions.filter(t => t.id !== id)
        };
        return { data: newData };
      }),

      updateTransaction: (id, updates) => set((state) => {
        const newData = {
          ...state.data,
          transactions: state.data.transactions.map(t => t.id === id ? { ...t, ...updates } : t)
        };
        return { data: newData };
      }),

      setMonthlyBudget: (amount) => set(state => ({
        data: { ...state.data, monthlyBudget: Number(amount) }
      })),

      // --- Budget & Goals ---
      updateBudget: (cat, limit) => set((state) => {
          const budgets = [...state.data.budgets];
          const idx = budgets.findIndex(b => b.category === cat && b.month === state.selectedMonth && b.userId === state.currentUser.id);
          if(idx > -1) budgets[idx].limit = limit;
          else budgets.push({ category: cat, limit, month: state.selectedMonth, userId: state.currentUser.id });
          return { data: { ...state.data, budgets } };
      }),

      // --- Category Actions ---
      addCategory: (cat) => set((state) => {
          const newCat = { ...cat, id: crypto.randomUUID() };
          const newData = { ...state.data, customCategories: [...state.data.customCategories, newCat] };
          return { data: newData };
      }),

      deleteCategory: (id) => set((state) => {
          const newData = { ...state.data, customCategories: state.data.customCategories.filter(c => c.id !== id) };
          return { data: newData };
      }),

      // --- Recurring Actions ---
      addSubscription: (sub) => set((state) => {
          const newSub = { ...sub, id: crypto.randomUUID(), userId: state.currentUser.id };
          const newData = { ...state.data, subscriptions: [...(state.data.subscriptions || []), newSub] };
          return { data: newData };
      }),

      addBill: (bill) => set((state) => {
          const newBill = { ...bill, id: crypto.randomUUID(), isPaid: false, userId: state.currentUser.id };
          const newData = { ...state.data, bills: [...(state.data.bills || []), newBill] };
          return { data: newData };
      }),

      toggleBillStatus: (id) => set((state) => {
          const newData = { 
              ...state.data, 
              bills: state.data.bills.map(b => b.id === id ? { ...b, isPaid: !b.isPaid } : b)
          };
          return { data: newData };
      }),

      deleteRecurring: (type, id) => set((state) => {
          const newData = { ...state.data, [type]: state.data[type].filter(item => item.id !== id) };
          return { data: newData };
      }),

      payBill: (billId, bankId) => set((state) => {
          const bill = state.data.bills.find(b => b.id === billId);
          if (!bill) return state;

          const newTxn = {
              id: crypto.randomUUID(),
              type: 'expense',
              category: bill.category || 'Bill',
              amount: bill.amount,
              description: `Paid: ${bill.name}`,
              bankId: Number(bankId),
              userId: state.currentUser.id,
              date: new Date().toISOString().split('T')[0]
          };

          const newData = {
              ...state.data,
              bills: state.data.bills.map(b => b.id === billId ? { ...b, isPaid: true } : b),
              transactions: [newTxn, ...state.data.transactions],
              banks: state.data.banks.map(b => b.id === Number(bankId) ? { ...b, value: b.value - bill.amount } : b)
          };

          return { data: newData };
      }),

      // --- Sync Logic ---
      // Pushes local data to Supabase unconditionally (call after writes)
      pushToSupabase: async () => {
        const state = get();
        if (!state.currentUser) return;
        const now = new Date().toISOString();
        try {
          await supabase
            .from('user_data')
            .upsert({
              user_id: state.currentUser.id,
              content: state.data,
              updated_at: now
            });
          set({ lastSyncedAt: now });
        } catch (err) {
          console.error('Supabase Push Failed:', err);
        }
      },

      // On login: fetch remote, use whichever side is newer
      syncWithSupabase: async () => {
        const state = get();
        if (!state.currentUser) return;
        set({ isSyncing: true });

        try {
          const { data: dbData } = await supabase
            .from('user_data')
            .select('content, updated_at')
            .eq('user_id', state.currentUser.id)
            .single();

          if (!dbData) {
            // Nothing on server yet — push local up
            await get().pushToSupabase();
          } else {
            const remoteTs = dbData.updated_at ? new Date(dbData.updated_at).getTime() : 0;
            const localTs = state.lastSyncedAt ? new Date(state.lastSyncedAt).getTime() : 0;

            if (remoteTs > localTs) {
              // Remote is newer — pull it in
              set({ data: dbData.content, lastSyncedAt: dbData.updated_at });
            } else {
              // Local is newer (or equal) — push our version
              await get().pushToSupabase();
            }
          }
        } catch (err) {
          console.error('Supabase Sync Failed:', err);
        } finally {
          set({ isSyncing: false });
        }
      },

      // --- Bill Auto-Reset ---
      // Call on app load: resets recurring bills if the month has rolled over
      checkAndResetBills: () => {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const { lastBillResetMonth, data } = get();
        if (lastBillResetMonth === currentMonth) return;

        const resetBills = (data.bills || []).map(b =>
          b.isRecurring ? { ...b, isPaid: false } : b
        );
        set({
          lastBillResetMonth: currentMonth,
          data: { ...data, bills: resetBills }
        });
      },

      // --- Selectors ---
      getMonthlyTotals: (month) => {
        const { data, currentUser } = get();
        const txns = (data.transactions || []).filter(t => 
            t.userId === currentUser?.id && t.date && t.date.startsWith(month)
        );
        const income = txns.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const expenses = txns.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        return { income, expenses, transactions: txns };
      },

      // Returns categories at or above 80% of budget for current month
      getBudgetAlerts: () => {
        const { data, currentUser, selectedMonth } = get();
        if (!currentUser) return [];
        const alerts = [];
        const userBudgets = (data.budgets || []).filter(
          b => b.userId === currentUser.id && b.month === selectedMonth
        );
        for (const budget of userBudgets) {
          if (!budget.limit || budget.limit <= 0) continue;
          const spent = (data.transactions || [])
            .filter(t => t.userId === currentUser.id && t.type === 'expense' && t.date?.startsWith(selectedMonth) && t.category === budget.category)
            .reduce((sum, t) => sum + t.amount, 0);
          const pct = spent / budget.limit;
          if (pct >= 0.8) {
            alerts.push({ category: budget.category, spent, limit: budget.limit, pct });
          }
        }
        return alerts;
      },

      formatCurrency: (amount, code) => {
        const rate = get().exchangeRate || EXCHANGE_RATE_FALLBACK;
        
        // If 'code' is provided, we assume the 'amount' is ALREADY in that currency (Bank items)
        // If 'code' is NOT provided, we use global app currency and assume input is TWD Base (Stats)
        const activeCurr = code || get().currency;
        const displayAmount = (code || activeCurr === 'TWD') ? amount : (amount * rate);
        
        const symbol = activeCurr === 'IDR' ? 'Rp' : 'NT$';

        return `${symbol} ${new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(displayAmount)}`;
      }
    }),
    {
      name: 'money-planner-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
          data: state.data,
          currentUser: state.currentUser,
          currency: state.currency,
          theme: state.theme,
          userThemes: state.userThemes,
          userBiometrics: state.userBiometrics,
          lastBillResetMonth: state.lastBillResetMonth,
          lastSyncedAt: state.lastSyncedAt,
          pinAttempts: state.pinAttempts,
          pinLockoutUntil: state.pinLockoutUntil
      })
    }
  )
);

export default useStore;
