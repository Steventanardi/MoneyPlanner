import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import Modal from '../components/Modal';
import TransactionForm from '../components/TransactionForm';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import BudgetAlerts from '../components/dashboard/BudgetAlerts';
import BalanceCard from '../components/dashboard/BalanceCard';
import BudgetRing from '../components/dashboard/BudgetRing';
import QuickActions from '../components/dashboard/QuickActions';
import StatGrid from '../components/dashboard/StatGrid';
import BudgetHealthStrip from '../components/dashboard/BudgetHealthStrip';
import SpendingTrend from '../components/dashboard/SpendingTrend';
import TopCategories from '../components/dashboard/TopCategories';
import StatModal from '../components/dashboard/StatModal';

const Dashboard = () => {
    const {
        data,
        currentUser,
        selectedMonth,
        isAddingTransaction,
        getBudgetAlerts
    } = useStore();

    const emergencyFund = data.emergencyFund || 20000;
    const [statModal, setStatModal] = React.useState(null);

    const userTransactions = useMemo(() =>
        (data.transactions || []).filter(t => t.userId === currentUser?.id),
    [data.transactions, currentUser]);

    const activeMonthTransactions = useMemo(() =>
        userTransactions.filter(t => t.date && t.date.startsWith(selectedMonth)),
    [userTransactions, selectedMonth]);

    const income = useMemo(() =>
        activeMonthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
    [activeMonthTransactions]);

    const expense = useMemo(() =>
        activeMonthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
    [activeMonthTransactions]);

    const balance = income - expense;

    const trendData = useMemo(() => {
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        return last7Days.map(date => {
            const dayExpense = userTransactions
                .filter(t => t.date === date && t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
            return {
                date: new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
                amount: dayExpense
            };
        });
    }, [userTransactions]);

    const topCategories = useMemo(() => {
        const cats = {};
        activeMonthTransactions.filter(t => t.type === 'expense').forEach(t => {
            cats[t.category] = (cats[t.category] || 0) + t.amount;
        });
        return Object.entries(cats)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [activeMonthTransactions]);

    const topIncomeCategories = useMemo(() => {
        const cats = {};
        activeMonthTransactions.filter(t => t.type === 'income').forEach(t => {
            cats[t.category] = (cats[t.category] || 0) + t.amount;
        });
        return Object.entries(cats)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [activeMonthTransactions]);

    const budgetAlerts = useMemo(() => getBudgetAlerts(), [data.transactions, data.budgets, selectedMonth, currentUser]);

    const prevMonth = useMemo(() => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const d = new Date(year, month - 2);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }, [selectedMonth]);

    const prevMonthExpense = useMemo(() =>
        userTransactions
            .filter(t => t.date && t.date.startsWith(prevMonth) && t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0),
    [userTransactions, prevMonth]);

    const expenseDelta = prevMonthExpense > 0 ? ((expense - prevMonthExpense) / prevMonthExpense) * 100 : null;

    const budgetHealth = useMemo(() => {
        const userBudgets = (data.budgets || []).filter(
            b => b.userId === currentUser?.id && b.month === selectedMonth && b.limit > 0
        );
        if (!userBudgets.length) return null;
        const onTrack = userBudgets.filter(b => {
            const spent = activeMonthTransactions
                .filter(t => t.type === 'expense' && t.category === b.category)
                .reduce((sum, t) => sum + t.amount, 0);
            return spent < b.limit;
        }).length;
        return { total: userBudgets.length, onTrack };
    }, [data.budgets, activeMonthTransactions, currentUser, selectedMonth]);

    return (
        <div style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 120px)', paddingTop: 'calc(env(safe-area-inset-top, 40px) + 20px)' }}>
            <DashboardHeader />

            <BudgetAlerts budgetAlerts={budgetAlerts} />

            <div style={{ padding: '0 20px' }}>
                <BalanceCard balance={balance} expenseDelta={expenseDelta} expense={expense} income={income} />

                <BudgetRing expense={expense} />

                <QuickActions />

                <StatGrid
                    income={income}
                    expense={expense}
                    balance={balance}
                    emergencyFund={emergencyFund}
                    onStatClick={setStatModal}
                />

                <BudgetHealthStrip budgetHealth={budgetHealth} />

                <SpendingTrend trendData={trendData} />

                <TopCategories topCategories={topCategories} expense={expense} />
            </div>

            <Modal
                isOpen={isAddingTransaction}
                onClose={() => useStore.getState().setIsAddingTransaction(false)}
                title="New Transaction"
            >
                <TransactionForm onComplete={() => useStore.getState().setIsAddingTransaction(false)} />
            </Modal>

            <StatModal
                statModal={statModal}
                onClose={() => setStatModal(null)}
                topCategories={topCategories}
                topIncomeCategories={topIncomeCategories}
                activeMonthTransactions={activeMonthTransactions}
            />
        </div>
    );
};

export default Dashboard;
