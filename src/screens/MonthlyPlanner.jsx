import React, { useState, useMemo, memo } from 'react';
import useStore from '../store/useStore';
import MonthSelector from '../components/MonthSelector';
import Modal from '../components/Modal';
import TransactionForm from '../components/TransactionForm';
import { 
    TrendingUp, 
    TrendingDown, 
    ShieldCheck as EmergencyIcon, 
    PiggyBank as SavingsIcon,
    Plus,
    ChevronRight,
    Edit2,
    Trash2,
    Target
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// --- Sub-components ---

const SpendingBarChart = memo(({ data: categoryData }) => (
    <div style={{ height: '300px', width: '100%' }}>
        {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ left: -10, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--glass-border)" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={80} fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip
                        contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px', fontSize: '12px' }}
                        cursor={{ fill: 'var(--input-bg)' }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} fill="var(--accent-primary)" />
                </BarChart>
            </ResponsiveContainer>
        ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                No expenses logged for this period
            </div>
        )}
    </div>
));

const BudgetBanner = ({ budget, spent, income, formatCurrency, onEdit, onTap }) => {
    const remaining = budget - spent;
    const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : 0;
    let statusColor = 'var(--accent-success)';
    if (pct > 90) statusColor = 'var(--accent-danger)';
    else if (pct > 75) statusColor = 'var(--accent-warning)';

    return (
        <motion.div 
            whileHover={{ y: -2 }}
            onClick={onTap}
            style={{
                background: 'var(--card-bg)',
                borderRadius: '32px',
                padding: '24px',
                border: `1px solid var(--glass-border)`,
                marginBottom: '24px',
                cursor: 'pointer',
                position: 'relative'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Monthly Allowance</div>
                    <div style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-1.5px' }}>{formatCurrency(budget)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                        background: `${statusColor}15`, color: statusColor, 
                        fontSize: '11px', fontWeight: '800', 
                        padding: '6px 14px', borderRadius: '12px' 
                    }}>
                        {pct > 100 ? 'Over Limit' : `${Math.round(pct)}% Used`}
                    </div>
                </div>
            </div>

            <div style={{ height: '12px', background: 'var(--input-bg)', borderRadius: '6px', overflow: 'hidden', marginBottom: '20px' }}>
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    style={{ height: '100%', background: statusColor, borderRadius: '6px' }} 
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Spent</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent-danger)' }}>{formatCurrency(spent)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Net Income</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent-success)' }}>{formatCurrency(income)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Residual</div>
                    <div style={{ fontSize: '18px', fontWeight: '800' }}>{formatCurrency(remaining)}</div>
                </div>
            </div>
        </motion.div>
    );
};

const StatCard = ({ label, value, icon: Icon, color, onClick, badge }) => (
    <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="card"
        style={{
            padding: '20px',
            borderRadius: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            cursor: 'pointer'
        }}
    >
        <div style={{ 
            width: '44px', height: '44px', borderRadius: '14px', 
            background: `${color}15`, color: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <Icon size={22} />
        </div>
        <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
                {label}
                <ChevronRight size={14} />
            </div>
            <div style={{ fontSize: '20px', fontWeight: '900', marginTop: '2px' }}>{value}</div>
        </div>
        {badge && (
            <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--accent-danger)', color: 'white', fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: '6px' }}>
                {badge}
            </div>
        )}
    </motion.div>
);

const MonthlyPlanner = () => {
    const { data, selectedMonth, getMonthlyTotals, formatCurrency, setMonthlyBudget, setActiveScreen, syncWithSupabase } = useStore();
    const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [activeCardDetail, setActiveCardDetail] = useState(null); // 'income', 'emergency', 'expenses', 'savings'
    const [tempBudget, setTempBudget] = useState(data.monthlyBudget || 30000);

    const { income, expenses, transactions } = getMonthlyTotals(selectedMonth);
    const categoryData = (transactions || [])
        .filter(t => t.type === 'expense' && t.date && t.date.startsWith(selectedMonth))
        .reduce((acc, t) => {
            const existing = acc.find(item => item.name === t.category);
            if (existing) existing.value += t.amount;
            else acc.push({ name: t.category, value: t.amount });
            return acc;
        }, [])
        .sort((a, b) => b.value - a.value);

    const emergencyFundBanks = (data.banks || []).filter(b => b.id === 3 || b.name.toLowerCase().includes('emergency'));
    const emergencyFund = emergencyFundBanks.reduce((acc, b) => acc + b.value, 0) || (data.banks?.[0]?.value || 0);
    const savingsGoals = (data.savingsGoals || []);

    return (
        <div style={{ paddingBottom: '120px' }}>
            <header style={{ padding: 'calc(env(safe-area-inset-top, 40px) + 20px) 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-1.5px', margin: 0 }}>
                        {new Date(selectedMonth + "-01").toLocaleDateString('en-US', { month: 'long' })}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: '500' }}>Personalized Roadmap</p>
                </div>
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsTransactionModalOpen(true)}
                    style={{
                        background: 'var(--accent-primary)', color: 'white',
                        width: '48px', height: '48px', borderRadius: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 20px var(--accent-primary-glow)',
                        border: 'none', cursor: 'pointer'
                    }}
                >
                    <Plus size={24} />
                </motion.button>
            </header>

            <MonthSelector />

            <div style={{ padding: '0 20px' }}>
                <BudgetBanner 
                    budget={data?.monthlyBudget || 30000}
                    spent={expenses}
                    income={income}
                    formatCurrency={formatCurrency}
                    onTap={() => setIsBudgetModalOpen(true)}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                    <StatCard 
                        label="Income" 
                        value={formatCurrency(income)} 
                        icon={TrendingUp} 
                        color="var(--accent-success)" 
                        onClick={() => setActiveCardDetail('income')}
                    />
                    <StatCard 
                        label="Emergency" 
                        value={formatCurrency(emergencyFund)} 
                        icon={EmergencyIcon} 
                        color="var(--accent-warning)" 
                        onClick={() => setActiveCardDetail('emergency')}
                    />
                    <StatCard 
                        label="Expenses" 
                        value={formatCurrency(expenses)} 
                        icon={TrendingDown} 
                        color="var(--accent-danger)" 
                        badge={expenses > (data.monthlyBudget || 30000) ? 'OVER' : null}
                        onClick={() => setActiveCardDetail('expenses')}
                    />
                    <StatCard 
                        label="Savings" 
                        value={formatCurrency(income - expenses)} 
                        icon={SavingsIcon} 
                        color="var(--accent-primary)" 
                        onClick={() => setActiveCardDetail('savings')}
                    />
                </div>

                {/* Spending Chart Section */}
                <div className="card" style={{ padding: '24px', borderRadius: '32px', marginBottom: '24px' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Spending Velocity</h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Burn rate by category</p>
                    </div>

                    <SpendingBarChart data={categoryData} />
                </div>

                {/* Savings Goals Context */}
                <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Projected Goals</h3>
                        <div style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: '800', textTransform: 'uppercase' }}>View All →</div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {(data.savingsGoals || []).slice(0, 2).map(goal => {
                            const progress = (goal.saved / goal.target) * 100;
                            return (
                                <div key={goal.id} className="card" style={{ padding: '16px 20px', borderRadius: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: goal.color }} />
                                            <span style={{ fontWeight: '700', fontSize: '14px' }}>{goal.name}</span>
                                        </div>
                                        <span style={{ fontSize: '12px', fontWeight: '800' }}>{Math.round(progress)}%</span>
                                    </div>
                                    <div style={{ height: '6px', background: 'var(--input-bg)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ width: `${progress}%`, height: '100%', background: goal.color, borderRadius: '3px' }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <Modal isOpen={isBudgetModalOpen} onClose={() => setIsBudgetModalOpen(false)} title="Set Spending Allowance">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Set a soft limit for your monthly expenses. This helps tracking your residual savings.</p>
                    <div className="input-group">
                        <input 
                            type="number" 
                            value={tempBudget} 
                            onChange={(e) => setTempBudget(e.target.value)} 
                            placeholder="Enter amount"
                            autoFocus 
                        />
                    </div>
                    <button 
                        className="btn-primary" 
                        onClick={() => {
                            setMonthlyBudget(tempBudget);
                            setIsBudgetModalOpen(false);
                            syncWithSupabase();
                        }}
                    >
                        Save Allowance
                    </button>
                </div>
            </Modal>

            <Modal isOpen={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)} title="New Entry">
                <TransactionForm onComplete={() => setIsTransactionModalOpen(false)} />
            </Modal>

            {/* Drill-down Detail Modals */}
            <Modal
                isOpen={!!activeCardDetail}
                onClose={() => setActiveCardDetail(null)}
                title={
                    activeCardDetail === 'income' ? 'Total Income' :
                    activeCardDetail === 'emergency' ? 'Safe Reserves' :
                    activeCardDetail === 'expenses' ? 'All Expenditures' :
                    'Net Savings'
                }
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {activeCardDetail === 'income' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                             <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(52,199,89,0.1)', color: 'var(--accent-success)', textAlign: 'center' }}>
                                <div style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}>Inflow for {new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long' })}</div>
                                <div style={{ fontSize: '28px', fontWeight: '900' }}>{formatCurrency(income)}</div>
                             </div>
                             {(transactions || []).filter(t => t.type === 'income').map(t => (
                                 <div key={t.id} className="card" style={{ padding: '14px 18px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between' }}>
                                     <div>
                                         <div style={{ fontWeight: '800', fontSize: '14px' }}>{t.category}</div>
                                         <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{new Date(t.date).toLocaleDateString()}</div>
                                     </div>
                                     <div style={{ fontWeight: '900', color: 'var(--accent-success)' }}>+{formatCurrency(t.amount)}</div>
                                 </div>
                             ))}
                        </div>
                    )}

                    {activeCardDetail === 'emergency' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>These accounts are designated as your emergency reserves or liquid safety net.</p>
                            {(emergencyFundBanks.length > 0 ? emergencyFundBanks : (data.banks || []).slice(0, 1)).map(bank => (
                                <div key={bank.id} className="card" style={{ padding: '20px', borderRadius: '20px' }}>
                                    <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{bank.name}</div>
                                    <div style={{ fontSize: '20px', fontWeight: '900' }}>{formatCurrency(bank.value, bank.currency)}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeCardDetail === 'expenses' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                             <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(255,59,48,0.1)', color: 'var(--accent-danger)', textAlign: 'center' }}>
                                <div style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}>Burn Rate</div>
                                <div style={{ fontSize: '28px', fontWeight: '900' }}>{formatCurrency(expenses)}</div>
                             </div>
                             {categoryData.slice(0, 5).map(cat => (
                                 <div key={cat.name} className="flex-between" style={{ padding: '12px 16px', background: 'var(--input-bg)', borderRadius: '12px' }}>
                                     <span style={{ fontWeight: '700', fontSize: '14px' }}>{cat.name}</span>
                                     <span style={{ fontWeight: '800' }}>{formatCurrency(cat.value)}</span>
                                 </div>
                             ))}
                             <button className="btn-primary" onClick={() => setActiveScreen('history')} style={{ marginTop: '12px', background: 'var(--card-bg)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}>View Full Transaction Log</button>
                        </div>
                    )}

                    {activeCardDetail === 'savings' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                             <div style={{ padding: '20px', borderRadius: '16px', background: 'var(--accent-primary)', color: 'white', textAlign: 'center' }}>
                                <div style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', opacity: 0.8 }}>Residual Balance</div>
                                <div style={{ fontSize: '28px', fontWeight: '900' }}>{formatCurrency(income - expenses)}</div>
                             </div>
                             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                 <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
                                     <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700' }}>+ INCOME</div>
                                     <div style={{ fontWeight: '800' }}>{formatCurrency(income)}</div>
                                 </div>
                                 <div className="card" style={{ padding: '16px', textAlign: 'center' }}>
                                     <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '700' }}>- EXPENSE</div>
                                     <div style={{ fontWeight: '800' }}>{formatCurrency(expenses)}</div>
                                 </div>
                             </div>
                             <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', fontStyle: 'italic' }}>
                                "Money not spent is money earned. Focus on growing this gap."
                             </p>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default MonthlyPlanner;
