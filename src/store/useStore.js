import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

const INITIAL_DATA = {
  banks: [
    { id: 1, name: 'Bank TWD', value: 50000, currency: 'TWD', userId: 'steven' },
    { id: 2, name: 'Bank IDR', value: 10000000, currency: 'IDR', userId: 'steven' },
    { id: 3, name: 'Girlfriend Bank', value: 20000, currency: 'TWD', userId: 'girl' }
  ],
  transactions: [],
  savingsGoals: [],
  budgets: [],
  customCategories: [
    { id: 1, name: 'Food', icon: 'Coffee', color: '#FF9500', type: 'expense' },
    { id: 2, name: 'Transport', icon: 'Car', color: '#007AFF', type: 'expense' },
    { id: 3, name: 'Salary', icon: 'TrendingUp', color: '#34C759', type: 'income' }
  ],
  subscriptions: [],
  bills: [],
  emergencyFund: 20000
};

export const USERS = [
  { id: 'steven', name: 'Steven', color: '#007AFF', avatar: 'S', pin: '2815', role: 'Owner' },
  { id: 'girl', name: 'Priscilla', color: '#FF3B30', avatar: 'G', pin: '2424', role: 'Family' }
];

export const useStore = create(
  persist(
    (set, get) => ({
      // --- Core State ---
      currentUser: null,
      data: INITIAL_DATA,
      selectedMonth: new Date().toISOString().slice(0, 7), // YYYY-MM
      currency: 'TWD',
      exchangeRate: 500, // TWD to IDR
      activeScreen: 'dashboard',
      theme: 'light',
      userThemes: {}, // {userId: 'light' | 'dark'}
      userBiometrics: {}, // {userId: boolean}
      lastActive: Date.now(),
      isSyncing: false,
      lastSyncedAt: null,
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
          id: Date.now(),
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
        const newTxn = {
          ...txn,
          id: Date.now(),
          userId: state.currentUser.id,
          date: state.selectedMonth + '-01' // Default to selected month start
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
          const newCat = { ...cat, id: Date.now() };
          const newData = { ...state.data, customCategories: [...state.data.customCategories, newCat] };
          return { data: newData };
      }),

      deleteCategory: (id) => set((state) => {
          const newData = { ...state.data, customCategories: state.data.customCategories.filter(c => c.id !== id) };
          return { data: newData };
      }),

      // --- Recurring Actions ---
      addSubscription: (sub) => set((state) => {
          const newSub = { ...sub, id: Date.now(), userId: state.currentUser.id };
          const newData = { ...state.data, subscriptions: [...(state.data.subscriptions || []), newSub] };
          return { data: newData };
      }),

      addBill: (bill) => set((state) => {
          const newBill = { ...bill, id: Date.now(), isPaid: false, userId: state.currentUser.id };
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
              id: Date.now(),
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
      syncWithSupabase: async () => {
        const state = get();
        if (!state.currentUser) return;
        set({ isSyncing: true });
        
        try {
          const { data: dbData, error } = await supabase
            .from('user_data')
            .select('content')
            .eq('user_id', state.currentUser.id)
            .single();

          if (dbData?.content) {
              // Priority: Merge remote data if newer, but keep local for now to be safe
              // In production we'd use updated_at
              set({ data: dbData.content, lastSyncedAt: new Date().toISOString() });
          } else {
              // Initial push if server is empty
              await supabase
                .from('user_data')
                .upsert({ 
                    user_id: state.currentUser.id, 
                    content: state.data,
                    updated_at: new Date().toISOString()
                });
          }
        } catch (err) {
          console.error("Supabase Sync Failed:", err);
        } finally {
          set({ isSyncing: false });
        }
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

      formatCurrency: (amount, code) => {
        const rate = get().exchangeRate || 500;
        
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
          userBiometrics: state.userBiometrics
      })
    }
  )
);

export default useStore;
