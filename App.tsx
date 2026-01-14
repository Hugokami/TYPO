import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Wallet, 
  Download, 
  Upload, 
  Search, 
  Filter, 
  MoreHorizontal,
  LayoutDashboard,
  Table2,
  Settings,
  Trash2,
  TrendingUp,
  Package
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Transaction, FinancialState, CATEGORIES, TransactionType } from './types';

// --- Utility Functions ---

const formatMMK = (amount: number) => {
  return new Intl.NumberFormat('my-MM', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Components ---

const Button = ({ children, onClick, variant = 'primary', className = '' }: { children?: React.ReactNode, onClick?: () => void, variant?: 'primary' | 'secondary' | 'ghost' | 'danger', className?: string }) => {
  const baseStyle = "font-display font-bold tracking-wide rounded-2xl px-6 py-3 transition-all active:scale-95 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-typo-accent text-typo-teal hover:bg-white shadow-lg",
    secondary: "bg-typo-teal text-white border border-white/10 hover:bg-typo-light",
    ghost: "bg-transparent text-typo-teal dark:text-typo-accent hover:bg-black/5 dark:hover:bg-white/5",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20"
  };

  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }: { children?: React.ReactNode, className?: string }) => (
  <div className={`bg-white dark:bg-typo-teal rounded-[2rem] p-6 shadow-xl border border-gray-100 dark:border-white/5 ${className}`}>
    {children}
  </div>
);

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children?: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#F0F7F7] dark:bg-[#051F1F] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-typo-teal/30">
        <div className="p-6 border-b border-typo-teal/10 flex justify-between items-center bg-typo-teal text-white">
          <h3 className="font-display font-bold text-xl tracking-wider uppercase">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <Plus className="rotate-45 w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ledger' | 'settings'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTxType, setNewTxType] = useState<TransactionType>('income');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  
  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  // Derived State
  const financials: FinancialState = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    return {
      transactions,
      balance: totalIncome - totalExpense,
      totalIncome,
      totalExpense
    };
  }, [transactions]);

  // Chart Data
  const chartData = useMemo(() => {
    // Group by date (simple version)
    const data: any[] = [];
    const sortedTx = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let runningBalance = 0;
    sortedTx.forEach(tx => {
      runningBalance += tx.type === 'income' ? tx.amount : -tx.amount;
      data.push({
        date: new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        balance: runningBalance,
        rawDate: tx.date
      });
    });
    
    // Take last 7 points if too many, or all if few
    return data.slice(-10);
  }, [transactions]);

  // Handlers
  const handleAddTransaction = () => {
    if (!amount || !description || !category) return;
    
    const newTx: Transaction = {
      id: generateId(),
      date: new Date().toISOString(),
      amount: parseFloat(amount),
      description,
      type: newTxType,
      category
    };

    setTransactions(prev => [newTx, ...prev]);
    
    // Reset and close
    setAmount('');
    setDescription('');
    setCategory('');
    setIsAddModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(transactions, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `typo_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const importedData = JSON.parse(result);
        if (Array.isArray(importedData)) {
          setTransactions(importedData);
          alert('Data imported successfully!');
        } else {
          alert('Invalid file format.');
        }
      } catch (err) {
        alert('Error parsing file.');
      }
    };
    reader.readAsText(file);
    // Reset input
    if (event.target) event.target.value = '';
  };

  // --- Views ---

  const DashboardView = () => (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      {/* Main Balance Card */}
      <div className="relative overflow-hidden bg-typo-teal rounded-[2.5rem] p-8 shadow-2xl text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="font-display font-bold text-4xl tracking-tight">TYPO</h2>
              <p className="text-typo-accent/80 text-xs uppercase tracking-[0.2em] font-medium mt-1">Apparel Co.</p>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/10">
              <Package className="text-typo-accent w-6 h-6" />
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-typo-accent/70 text-sm font-medium tracking-wide">Total Balance</p>
            <div className="flex items-baseline gap-2">
              <h1 className="text-4xl sm:text-5xl font-display font-bold text-white tracking-wider tabular-nums">
                {formatMMK(financials.balance)}
              </h1>
              <span className="text-lg font-normal text-white/50 font-display">MMK</span>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
             <button 
               onClick={() => { setNewTxType('income'); setIsAddModalOpen(true); }}
               className="flex-1 bg-typo-accent text-typo-teal py-3 px-4 rounded-xl font-display font-bold text-sm hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-lg"
             >
               <Plus className="w-4 h-4" /> Add Income
             </button>
             <button 
                onClick={() => { setNewTxType('expense'); setIsAddModalOpen(true); }}
                className="flex-1 bg-black/20 text-white py-3 px-4 rounded-xl font-display font-bold text-sm hover:bg-black/30 transition-colors backdrop-blur-sm flex items-center justify-center gap-2 border border-white/10"
             >
               <ArrowUpRight className="w-4 h-4" /> Expense
             </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="!p-4 bg-[#F0F7F7] dark:bg-[#0E5E5E] group">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-green-100 dark:bg-green-500/20 p-2 rounded-full">
              <ArrowDownLeft className="text-green-600 dark:text-green-400 w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-gray-500 dark:text-typo-accent/70 uppercase tracking-wider">Income</span>
          </div>
          <p className="text-xl font-display font-bold text-typo-dark dark:text-white tabular-nums">{formatMMK(financials.totalIncome)}</p>
        </Card>

        <Card className="!p-4 bg-[#F0F7F7] dark:bg-[#0E5E5E] group">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-red-100 dark:bg-red-500/20 p-2 rounded-full">
              <ArrowUpRight className="text-red-600 dark:text-red-400 w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-gray-500 dark:text-typo-accent/70 uppercase tracking-wider">Expense</span>
          </div>
          <p className="text-xl font-display font-bold text-typo-dark dark:text-white tabular-nums">{formatMMK(financials.totalExpense)}</p>
        </Card>
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <Card className="!p-0 overflow-hidden bg-white dark:bg-typo-teal h-64 flex flex-col">
          <div className="p-6 pb-0">
             <h3 className="font-display font-bold text-lg text-typo-dark dark:text-white">Trend Analysis</h3>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C4ECE8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#C4ECE8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#051F1F', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#C4ECE8' }}
                  formatter={(value: number) => [`${formatMMK(value)}`, 'Balance']}
                />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#C4ECE8" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorBalance)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Recent Transactions */}
      <div className="bg-typo-teal dark:bg-typo-teal rounded-[2rem] p-1 shadow-inner shadow-black/20">
        <div className="bg-[#F5FBFB] dark:bg-[#0B2A2A] rounded-[1.8rem] p-5 min-h-[300px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-typo-dark dark:text-white text-lg tracking-wide">Recent</h3>
            <button onClick={() => setActiveTab('ledger')} className="text-xs text-typo-teal dark:text-typo-accent bg-typo-teal/10 dark:bg-white/10 px-3 py-1 rounded-full hover:bg-typo-teal/20 transition-colors font-semibold">View All</button>
          </div>
          
          <div className="space-y-3">
            {transactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between bg-white dark:bg-typo-light/30 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === 'income' 
                      ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                  }`}>
                    {tx.type === 'income' ? <ArrowDownLeft size={18} /> : <TrendingUp size={18} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm line-clamp-1">{tx.description}</h4>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">{tx.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-display font-bold text-sm ${
                    tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-typo-dark dark:text-white'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'} {formatMMK(tx.amount)}
                  </p>
                  <p className="text-[10px] text-gray-400">{new Date(tx.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {transactions.length === 0 && (
              <div className="text-center py-12 opacity-50">
                <div className="mx-auto w-12 h-12 bg-gray-200 dark:bg-white/10 rounded-full flex items-center justify-center mb-2">
                   <LayoutDashboard className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium">No transactions yet.</p>
                <p className="text-xs">Start by adding income or expenses.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const LedgerView = () => (
    <div className="space-y-6 pb-24 animate-in slide-in-from-right duration-300">
      <div className="sticky top-0 bg-[#F0F7F7] dark:bg-[#051F1F] z-20 pb-4 pt-2">
        <h2 className="font-display font-bold text-3xl text-typo-dark dark:text-white mb-4 pl-2">LEDGER</h2>
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search transactions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-typo-light rounded-2xl py-3 pl-12 pr-4 text-typo-dark dark:text-white shadow-sm border-none focus:ring-2 focus:ring-typo-teal placeholder-gray-400 font-display tracking-wide"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-typo-light rounded-3xl overflow-hidden shadow-lg border border-gray-100 dark:border-white/5">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-typo-teal text-white font-display text-sm tracking-wider">
              <tr>
                <th className="p-4 font-semibold">DATE</th>
                <th className="p-4 font-semibold">DESC</th>
                <th className="p-4 font-semibold">CAT</th>
                <th className="p-4 font-semibold text-right">AMOUNT</th>
                <th className="p-4 font-semibold text-center">ACT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-sm">
              {transactions
                .filter(t => 
                  t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  t.category.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                  <td className="p-4 text-gray-500 dark:text-gray-400 whitespace-nowrap font-mono text-xs">
                    {new Date(tx.date).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-typo-dark dark:text-white font-medium">
                    {tx.description}
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {tx.category}
                    </span>
                  </td>
                  <td className={`p-4 text-right font-display font-bold whitespace-nowrap ${
                    tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
                  }`}>
                    {tx.type === 'expense' && '-'} {formatMMK(tx.amount)}
                  </td>
                  <td className="p-4 text-center">
                     <button onClick={() => handleDelete(tx.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                       <Trash2 className="w-4 h-4" />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {transactions.length === 0 && (
             <div className="p-8 text-center text-gray-400 text-sm">No records found.</div>
          )}
        </div>
      </div>
    </div>
  );

  const SettingsView = () => (
    <div className="space-y-6 pb-24 animate-in slide-in-from-right duration-300">
       <h2 className="font-display font-bold text-3xl text-typo-dark dark:text-white mb-6 pl-2">SETTINGS</h2>
       
       <Card className="!p-0 overflow-hidden bg-typo-teal text-white">
          <div className="p-6 border-b border-white/10">
            <h3 className="font-display font-bold text-xl mb-1">Data Management</h3>
            <p className="text-sm text-typo-accent/70">Backup or restore your business data.</p>
          </div>
          <div className="p-6 grid gap-4">
             <button 
               onClick={handleExport}
               className="w-full bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl p-4 flex items-center justify-between group transition-all"
             >
                <div className="flex items-center gap-4">
                  <div className="bg-typo-accent p-2 rounded-lg text-typo-teal">
                    <Download className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-white">Export Data</div>
                    <div className="text-xs text-white/50">Save JSON file locally</div>
                  </div>
                </div>
                <div className="text-typo-accent opacity-0 group-hover:opacity-100 transition-opacity">
                   <ArrowUpRight className="w-5 h-5" />
                </div>
             </button>

             <button 
               onClick={handleImportClick}
               className="w-full bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl p-4 flex items-center justify-between group transition-all"
             >
                <div className="flex items-center gap-4">
                  <div className="bg-typo-accent p-2 rounded-lg text-typo-teal">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-white">Import Data</div>
                    <div className="text-xs text-white/50">Restore from JSON file</div>
                  </div>
                </div>
                <div className="text-typo-accent opacity-0 group-hover:opacity-100 transition-opacity">
                   <Plus className="w-5 h-5" />
                </div>
             </button>
             <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImportFile} 
                accept=".json" 
                className="hidden" 
             />
          </div>
       </Card>

       <div className="p-4 text-center text-xs text-gray-400">
          <p>TYPO Business Manager v1.0</p>
          <p className="mt-1">Local Storage Mode • Data resides on this device</p>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0F7F7] dark:bg-[#051F1F] font-sans text-typo-dark dark:text-typo-surface transition-colors duration-300">
      
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-40 bg-[#F0F7F7]/80 dark:bg-[#051F1F]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between max-w-md left-1/2 -translate-x-1/2">
        <div className="bg-typo-teal text-white p-2 rounded-lg shadow-lg">
          <MoreHorizontal className="w-5 h-5" />
        </div>
        <span className="font-display font-bold text-lg tracking-widest text-typo-teal dark:text-typo-accent">
          {activeTab === 'dashboard' ? 'DASHBOARD' : activeTab === 'ledger' ? 'TRANSACTIONS' : 'SYSTEM'}
        </span>
        <div className="relative">
          <div className="w-9 h-9 bg-typo-teal rounded-full flex items-center justify-center text-typo-accent border-2 border-typo-accent shadow-lg">
             <span className="font-display font-bold">T</span>
          </div>
          <div className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-[#F0F7F7] dark:border-[#051F1F]"></div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pt-24 px-4 max-w-md mx-auto min-h-screen relative">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'ledger' && <LedgerView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Bottom Floating Navigation */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
        <div className="bg-typo-teal text-white rounded-full px-2 py-2 flex items-center gap-1 shadow-2xl border border-white/10 pointer-events-auto backdrop-blur-xl">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`p-3 rounded-full transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-white/20 text-typo-accent' : 'hover:bg-white/10 text-white/50'}`}
          >
            <LayoutDashboard className="w-6 h-6" />
          </button>
          
          <button 
            onClick={() => setActiveTab('ledger')}
            className={`p-3 rounded-full transition-all duration-300 ${activeTab === 'ledger' ? 'bg-white/20 text-typo-accent' : 'hover:bg-white/10 text-white/50'}`}
          >
            <Table2 className="w-6 h-6" />
          </button>

          <button 
            onClick={() => { setNewTxType('income'); setIsAddModalOpen(true); }}
            className="bg-typo-accent text-typo-teal px-6 py-3 rounded-full font-bold font-display flex items-center gap-2 hover:bg-white transition-colors mx-2 shadow-lg active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>NEW</span>
          </button>

          <button 
            onClick={() => {}} 
            className="p-3 rounded-full hover:bg-white/10 text-white/50 cursor-not-allowed opacity-50" 
            title="Stock (Coming Soon)"
          >
            <Package className="w-6 h-6" />
          </button>

          <button 
            onClick={() => setActiveTab('settings')}
            className={`p-3 rounded-full transition-all duration-300 ${activeTab === 'settings' ? 'bg-white/20 text-typo-accent' : 'hover:bg-white/10 text-white/50'}`}
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`Add ${newTxType}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Amount (MMK)</label>
            <input 
              type="number" 
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-white dark:bg-black/20 border-2 border-gray-200 dark:border-white/10 rounded-xl p-3 text-2xl font-display font-bold text-typo-teal dark:text-white focus:ring-0 focus:border-typo-teal outline-none"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Description</label>
            <input 
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 font-medium text-typo-dark dark:text-white focus:ring-2 focus:ring-typo-teal/50 outline-none"
              placeholder="e.g. Cotton Fabric Batch A"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES[newTxType].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`p-2 rounded-lg text-xs font-bold transition-all ${
                    category === cat 
                      ? 'bg-typo-teal text-white shadow-md' 
                      : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
             <button 
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-3 text-gray-500 font-bold text-sm hover:text-gray-700 dark:hover:text-white"
             >
               CANCEL
             </button>
             <button 
                onClick={handleAddTransaction}
                disabled={!amount || !description || !category}
                className="flex-[2] bg-typo-teal text-white rounded-xl py-3 font-display font-bold tracking-wide shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-typo-light transition-colors"
             >
               SAVE TRANSACTION
             </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}