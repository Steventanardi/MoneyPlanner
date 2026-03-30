import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AppContext = createContext();

const INITIAL_USERS = [
  { id: 1, name: 'Steven', pin: '1234', color: '#007AFF' },
  { id: 2, name: 'Girlfriend', pin: '5678', color: '#FF2D55' },
];

const INITIAL_DATA = {
  banks: [
    { id: 1, name: 'Youju Bank', value: 12500.50 },
    { id: 2, name: 'Sinopac Bank', value: 8700.25 },
    { id: 3, name: 'Mega Bank', value: 45000.00 },
  ],
  transactions: [
    { id: 1, type: 'expense', category: 'Food', amount: 45.50, date: new Date().toISOString(), bankId: 1, userId: 1 },
    { id: 2, type: 'expense', category: 'Rent', amount: 1200, date: new Date().toISOString(), bankId: 2, userId: 1 },
    { id: 3, type: 'income', category: 'Salary', amount: 5000, date: new Date().toISOString(), bankId: 1, userId: 1 },
  ],
  budget: {
    monthlyLimit: 3000,
  },
  monthlyBudget: 30000,
  categoryBudgets: [
    { id: 1, category: 'Food', limit: 500 },
    { id: 2, category: 'Entertainment', limit: 200 },
  ],
  customCategories: [
    { id: 1, name: 'Housing', icon: 'Home', color: '#007AFF', type: 'expense' },
    { id: 2, name: 'Food', icon: 'Coffee', color: '#FF9500', type: 'expense' },
    { id: 3, name: 'Transport', icon: 'Car', color: '#34C759', type: 'expense' },
    { id: 4, name: 'Entertainment', icon: 'Tv', color: '#AF52DE', type: 'expense' },
    { id: 5, name: 'Salary', icon: 'Briefcase', color: '#34C759', type: 'income' },
    { id: 6, name: 'Investments', icon: 'TrendingUp', color: '#007AFF', type: 'income' }
  ],
  savingsGoals: [
    { id: 1, name: 'Emergency Fund', target: 10000, saved: 4500, icon: 'ShieldCheck', color: '#34C759' },
    { id: 2, name: 'Paris Vacation', target: 5000, saved: 1200, icon: 'Plane', color: '#007AFF' }
  ],
  subscriptions: [
    { id: 1, name: 'Netflix', amount: 330, category: 'Entertainment', frequency: 'monthly', icon: 'Tv' },
    { id: 2, name: 'Spotify', amount: 149, category: 'Entertainment', frequency: 'monthly', icon: 'Music' },
  ],
  bills: [
    { id: 1, name: 'Rent', amount: 15000, dueDate: 5, category: 'Housing', isPaid: false },
    { id: 2, name: 'Electric', amount: 1200, dueDate: 15, category: 'Utilities', isPaid: false },
  ]
};

export const AppProvider = ({ children }) => {
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'TWD');
  const [exchangeRate, setExchangeRate] = useState(null);

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('moneyPlannerUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('moneyPlannerData');
    if (!saved) return INITIAL_DATA;
    try {
      const parsed = JSON.parse(saved);
      if (parsed.banks) {
          parsed.banks = parsed.banks.map(b => ({...b, currency: b.currency || 'TWD'}));
      }
      return {
        ...INITIAL_DATA,
        ...parsed,
        banks: Array.isArray(parsed.banks) ? parsed.banks : INITIAL_DATA.banks,
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions : INITIAL_DATA.transactions,
        subscriptions: Array.isArray(parsed.subscriptions) ? parsed.subscriptions : INITIAL_DATA.subscriptions,
        bills: Array.isArray(parsed.bills) ? parsed.bills : INITIAL_DATA.bills,
        categoryBudgets: Array.isArray(parsed.categoryBudgets) ? parsed.categoryBudgets : INITIAL_DATA.categoryBudgets,
        savingsGoals: Array.isArray(parsed.savingsGoals) ? parsed.savingsGoals : INITIAL_DATA.savingsGoals,
        customCategories: Array.isArray(parsed.customCategories) ? parsed.customCategories : INITIAL_DATA.customCategories,
      };
    } catch (e) {
      console.error("Failed to parse saved data", e);
      return INITIAL_DATA;
    }
  });

  // Fetch live exchange rate
  useEffect(() => {
    const fetchRate = async () => {
      try {
        // Using a free public API for exchange rates
        const res = await fetch('https://open.er-api.com/v6/latest/TWD');
        const result = await res.json();
        if (result && result.rates && result.rates.IDR) {
          setExchangeRate(result.rates.IDR);
          console.log("Fetched TWD to IDR rate:", result.rates.IDR);
        } else {
          setExchangeRate(495); // Fallback offline IDR rate
        }
      } catch (e) {
        console.error("Failed to fetch exchange rate", e);
        setExchangeRate(495); // Fallback offline IDR rate
      }
    };
    fetchRate();
    // Refresh every hour
    const interval = setInterval(fetchRate, 3600000);
    return () => clearInterval(interval);
  }, []);

  // Supabase Data Fetching
  useEffect(() => {
    const loadSupabaseData = async () => {
      if (!currentUser) return;

      try {
        const { data: supabaseData, error } = await supabase
          .from('user_data')
          .select('content')
          .eq('user_id', currentUser.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching Supabase data:', error);
          return;
        }

        if (supabaseData?.content) {
          // Merge Supabase content with local, prioritizing Supabase for existing keys
          // but keeping local state if Supabase is missing something
          setData(prev => {
            const merged = { ...prev, ...supabaseData.content };
            // Ensure we don't lose transactions or other arrays if they were updated locally
            // This is a simple merge; a more complex one would compare timestamps
            return merged;
          });
          console.log('Successfully synced data from Supabase');
        }
      } catch (err) {
        console.error('Failed to load data from Supabase:', err);
      }
    };

    loadSupabaseData();
  }, [currentUser]);

  // Supabase Syncing
  useEffect(() => {
    const syncToSupabase = async () => {
      if (!currentUser) return;

      try {
        // Double check configuration before attempting sync
        if (!import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('your-project')) {
          return; 
        }

        const { error } = await supabase
          .from('user_data')
          .upsert({ 
            user_id: currentUser.id, 
            content: data,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });

        if (error) {
          console.error('Error syncing to Supabase:', error);
        }
      } catch (err) {
        console.error('Failed to sync to Supabase:', err);
      }
    };

    const timeout = setTimeout(syncToSupabase, 1000); // Debounce sync
    return () => clearTimeout(timeout);
  }, [data, currentUser]);

  useEffect(() => {
    localStorage.setItem('moneyPlannerData', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem('moneyPlannerUser', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const login = (userId, pin) => {
    const user = INITIAL_USERS.find(u => u.id === userId && u.pin === pin);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveScreen('dashboard');
  };

  const addBank = (name, initialValue = 0, bankCurrency = 'TWD') => {
    const newBank = {
      id: Date.now(),
      name,
      value: initialValue,
      currency: bankCurrency
    };

    setData(prev => ({
      ...prev,
      banks: [...prev.banks, newBank]
    }));
  };

  const deleteBank = (id) => {
    setData(prev => ({
      ...prev,
      banks: prev.banks.filter(b => b.id !== id),
      // Clean up transactions associated with this bank? Or keep them?
      // Usually better to keep but mark as 'No Bank' if id is missing.
      // For simplicity here, we'll just filter them or keep them.
    }));
  };

  const addTransaction = (transaction) => {
    // If we are in IDR mode, we convert the IDR input back to TWD for storage
    const amountInTWD = (currency === 'IDR' && exchangeRate)
      ? transaction.amount / exchangeRate
      : transaction.amount;

    const newTransaction = {
      ...transaction,
      amount: amountInTWD, // Store as TWD
      id: transaction.id || Date.now(),
      date: new Date().toISOString(),
      userId: currentUser?.id
    };

    setData(prev => ({
      ...prev,
      transactions: [newTransaction, ...prev.transactions],
      banks: prev.banks.map(bank => {
        if (bank.id === Number(transaction.bankId)) {
          const modification = (bank.currency === 'IDR' && exchangeRate) ? amountInTWD * exchangeRate : amountInTWD;
          return { ...bank, value: bank.value + (transaction.type === 'income' ? modification : -modification) };
        }
        return bank;
      })
    }));
  };

  const deleteTransaction = (id) => {
    const transaction = data.transactions.find(t => t.id === id);
    if (!transaction) return;

    setData(prev => ({
      ...prev,
      transactions: prev.transactions.filter(t => t.id !== id),
      banks: prev.banks.map(bank => {
        if (bank.id === Number(transaction.bankId)) {
          const amountInTWD = transaction.amount;
          const modification = (bank.currency === 'IDR' && exchangeRate) ? amountInTWD * exchangeRate : amountInTWD;
          return { ...bank, value: bank.value - (transaction.type === 'income' ? modification : -modification) };
        }
        return bank;
      })
    }));
  };

  const updateTransaction = (id, updates) => {
    const oldTransaction = data.transactions.find(t => t.id === id);
    if (!oldTransaction) return;

    // Convert new amount to TWD if needed
    const amountInTWD = (updates.amount !== undefined) 
      ? ((currency === 'IDR' && exchangeRate) ? updates.amount / exchangeRate : updates.amount)
      : oldTransaction.amount;

    setData(prev => {
      // Revert old transaction effect on banks
      let newBanks = prev.banks.map(bank => {
        if (bank.id === Number(oldTransaction.bankId)) {
          const oldAmountTWD = oldTransaction.amount;
          const oldMod = (bank.currency === 'IDR' && exchangeRate) ? oldAmountTWD * exchangeRate : oldAmountTWD;
          return { ...bank, value: bank.value - (oldTransaction.type === 'income' ? oldMod : -oldMod) };
        }
        return bank;
      });

      // Apply new transaction effect on banks
      const newType = updates.type || oldTransaction.type;
      const newBankId = Number(updates.bankId || oldTransaction.bankId);

      newBanks = newBanks.map(bank => {
        if (bank.id === newBankId) {
          const newMod = (bank.currency === 'IDR' && exchangeRate) ? amountInTWD * exchangeRate : amountInTWD;
          return { ...bank, value: bank.value + (newType === 'income' ? newMod : -newMod) };
        }
        return bank;
      });

      return {
        ...prev,
        transactions: prev.transactions.map(t => t.id === id ? { ...t, ...updates, amount: amountInTWD } : t),
        banks: newBanks
      };
    });
  };

  const updateBank = (bankId, updates) => {
    setData(prev => ({
      ...prev,
      banks: prev.banks.map(bank => {
        if (bank.id === bankId) {
          // Native Currency Bank update! No automatic exchange rate division here.
          return { ...bank, ...updates };
        }
        return bank;
      })
    }));
  };

  const addSavingsGoal = (goal) => {
    setData(prev => ({
      ...prev,
      savingsGoals: [...(prev.savingsGoals || []), { ...goal, id: Date.now(), saved: 0 }]
    }));
  };

  const updateSavingsGoal = (id, updates) => {
    setData(prev => ({
      ...prev,
      savingsGoals: prev.savingsGoals.map(g => g.id === id ? { ...g, ...updates } : g)
    }));
  };

  const deleteSavingsGoal = (id) => {
    setData(prev => ({
      ...prev,
      savingsGoals: prev.savingsGoals.filter(g => g.id !== id)
    }));
  };

  const fundSavingsGoal = (goalId, amount, bankId) => {
    // 1. Generate an expense transaction
    const transaction = {
      type: 'expense',
      category: 'Savings Transfer',
      amount: Number(amount),
      bankId: Number(bankId),
      notes: `Funded goal ID: ${goalId}`,
    };
    
    // Convert to TWD if needed (assuming user inputs in their selected currency)
    const amountInTWD = (currency === 'IDR' && exchangeRate)
      ? transaction.amount / exchangeRate
      : transaction.amount;

    const newTransaction = {
      ...transaction,
      amount: amountInTWD,
      id: Date.now(),
      date: new Date().toISOString(),
      userId: currentUser?.id
    };

    setData(prev => {
      // 2. Decrement bank balance
      const newBanks = prev.banks.map(bank => {
        if (bank.id === Number(bankId)) {
          const modification = (bank.currency === 'IDR' && exchangeRate) ? amountInTWD * exchangeRate : amountInTWD;
          return { ...bank, value: bank.value - modification };
        }
        return bank;
      });

      // 3. Increment goal progress
      const newGoals = prev.savingsGoals.map(goal => 
        goal.id === goalId 
          ? { ...goal, saved: goal.saved + amountInTWD }
          : goal
      );

      return {
        ...prev,
        transactions: [newTransaction, ...prev.transactions],
        banks: newBanks,
        savingsGoals: newGoals
      };
    });
  };

  const addSubscription = (sub) => {
    setData(prev => ({
      ...prev,
      subscriptions: [...prev.subscriptions, { ...sub, id: Date.now() }]
    }));
  };

  const addBill = (bill) => {
    setData(prev => ({
      ...prev,
      bills: [...prev.bills, { ...bill, id: Date.now(), isPaid: false }]
    }));
  };

  const toggleBillStatus = (id) => {
    setData(prev => ({
      ...prev,
      bills: prev.bills.map(b => b.id === id ? { ...b, isPaid: !b.isPaid } : b)
    }));
  };

  const payBill = (billId, bankId) => {
    const bill = data.bills.find(b => b.id === billId);
    if (!bill) return;

    const amountInTWD = (currency === 'IDR' && exchangeRate)
      ? bill.amount / exchangeRate
      : bill.amount;

    const transaction = {
      type: 'expense',
      category: bill.category || 'Bills',
      amount: amountInTWD,
      bankId: Number(bankId),
      notes: `Auto-paid bill: ${bill.name}`,
      id: Date.now(),
      date: new Date().toISOString(),
      userId: currentUser?.id
    };

    setData(prev => {
      const newBanks = prev.banks.map(bank => {
        if (bank.id === Number(bankId)) {
          const modification = (bank.currency === 'IDR' && exchangeRate) ? amountInTWD * exchangeRate : amountInTWD;
          return { ...bank, value: bank.value - modification };
        }
        return bank;
      });

      const newBills = prev.bills.map(b =>
        b.id === billId ? { ...b, isPaid: true } : b
      );

      return {
        ...prev,
        transactions: [transaction, ...prev.transactions],
        banks: newBanks,
        bills: newBills
      };
    });
  };

  const deleteRecurring = (type, id) => {
    setData(prev => ({
      ...prev,
      [type]: prev[type].filter(item => item.id !== id)
    }));
  };

  const saveCategoryBudget = (budget) => {
    setData(prev => {
      // If it exists, update it. Else, add it.
      const exists = prev.categoryBudgets.find(b => b.category.toLowerCase() === budget.category.toLowerCase());
      if (exists) {
        return {
          ...prev,
          categoryBudgets: prev.categoryBudgets.map(b => b.id === exists.id ? { ...b, limit: budget.limit } : b)
        };
      } else {
        return {
          ...prev,
          categoryBudgets: [...prev.categoryBudgets, { ...budget, id: Date.now() }]
        };
      }
    });
  };

  const deleteCategoryBudget = (id) => {
    setData(prev => ({
      ...prev,
      categoryBudgets: prev.categoryBudgets.filter(b => b.id !== id)
    }));
  };

  const addCategory = (categoryObj) => {
    setData(prev => ({
      ...prev,
      customCategories: [...(prev.customCategories || []), { ...categoryObj, id: Date.now() }]
    }));
  };

  const deleteCategory = (id) => {
    setData(prev => ({
      ...prev,
      customCategories: (prev.customCategories || []).filter(c => c.id !== id)
    }));
  };

  const setMonthlyBudget = (amount) => {
    setData(prev => ({ ...prev, monthlyBudget: Number(amount) }));
  };

  const getMonthlyTotals = (month) => {
    const currentYear = new Date().getFullYear();
    const monthTransactions = data.transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === month && d.getFullYear() === currentYear;
    });

    // Filter to show ONLY Current User's transactions
    const visibleTransactions = monthTransactions.filter(t => t.userId === currentUser?.id);

    const income = visibleTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expenses = visibleTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

    return { income, expenses, transactions: visibleTransactions };
  };

  const formatCurrency = (amount) => {
    // Convert to display value if using IDR
    const displayAmount = (currency === 'IDR' && exchangeRate) ? amount * exchangeRate : amount;

    const symbol = currency === 'TWD' ? 'NT$' : 'Rp';

    return `${symbol} ${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(displayAmount)}`;
  };

  const value = {
    activeScreen, setActiveScreen,
    selectedMonth, setSelectedMonth,
    theme, setTheme,
    currency, setCurrency,
    exchangeRate,
    currentUser, login, logout,
    users: INITIAL_USERS,
    data,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addBank,
    deleteBank,
    updateBank,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    fundSavingsGoal,
    addSubscription,
    addBill,
    toggleBillStatus,
    payBill,
    deleteRecurring,
    saveCategoryBudget,
    deleteCategoryBudget,
    addCategory,
    deleteCategory,
    getMonthlyTotals,
    formatCurrency,
    setMonthlyBudget
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
