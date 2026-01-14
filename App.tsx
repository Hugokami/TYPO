import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, 
  Minus,
  ArrowDownLeft, 
  ArrowUpRight, 
  Download, 
  Upload, 
  Search, 
  LayoutDashboard,
  Table2,
  Settings,
  Trash2,
  TrendingUp,
  Package,
  AlertTriangle,
  Box,
  Users,
  Edit2,
  Phone,
  MapPin,
  FileText,
  PieChart as PieChartIcon,
  RotateCcw,
  X,
  UserCircle,
  Sparkles,
  ArrowRight,
  Shirt,
  DollarSign,
  BrainCircuit,
  TrendingDown,
  Activity,
  Lightbulb
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { Transaction, FinancialState, CATEGORIES, TransactionType, InventoryItem, INVENTORY_CATEGORIES, InventoryCategory, Customer } from './types';

// --- Utility Functions ---

const formatMMK = (amount: number) => {
  return new Intl.NumberFormat('my-MM', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' MMK';
};

const generateId = () => Math.random().toString(36).substr(2, 9);

const COLORS = ['#0E5E5E', '#4ECDC4', '#C4ECE8', '#FF6B6B', '#FFD93D', '#6A0572', '#AB83A1'];

// --- Components ---

const Button = ({ children, onClick, variant = 'primary', className = '' }: { children?: React.ReactNode, onClick?: () => void, variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success', className?: string }) => {
  const baseStyle = "font-display font-bold tracking-wide rounded-xl px-4 py-2.5 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm";
  const variants = {
    primary: "bg-typo-accent text-typo-teal hover:bg-white hover:shadow-lg hover:shadow-typo-accent/20",
    secondary: "bg-typo-teal text-white border border-white/10 hover:bg-typo-light",
    ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/5",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
    success: "bg-green-500/10 text-green-500 hover:bg-green-500/20"
  };

  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }: { children?: React.ReactNode, className?: string }) => (
  <div className={`bg-[#0E2A2A] rounded-2xl p-6 border border-white/5 ${className}`}>
    {children}
  </div>
);

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children?: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#051F1F] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#021212]">
          <h3 className="font-display font-bold text-xl tracking-wider uppercase text-white">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors text-white">
            <X className="w-5 h-5" />
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
  // --- Persistent State ---
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('typo_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('typo_inventory');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('typo_customers');
    return saved ? JSON.parse(saved) : [];
  });

  const [businessProfile, setBusinessProfile] = useState(() => {
    const saved = localStorage.getItem('typo_profile');
    return saved ? JSON.parse(saved) : { name: 'TYPO', subtitle: 'Apparel Co.', owner: 'John Manager' };
  });

  // --- Persistence Effects ---
  useEffect(() => localStorage.setItem('typo_transactions', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('typo_inventory', JSON.stringify(inventory)), [inventory]);
  useEffect(() => localStorage.setItem('typo_customers', JSON.stringify(customers)), [customers]);
  useEffect(() => localStorage.setItem('typo_profile', JSON.stringify(businessProfile)), [businessProfile]);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'ledger' | 'inventory' | 'consultant' | 'settings'>('dashboard');
  
  // UI States
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Forms
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [newTxType, setNewTxType] = useState<TransactionType>('income');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [invName, setInvName] = useState('');
  const [invCategory, setInvCategory] = useState<InventoryCategory>('Raw Material');
  const [invQuantity, setInvQuantity] = useState('');
  const [invCost, setInvCost] = useState('');
  const [invReorder, setInvReorder] = useState('10');
  const [logAsExpense, setLogAsExpense] = useState(false);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custNotes, setCustNotes] = useState('');
  const [editingCustId, setEditingCustId] = useState<string | null>(null);

  const [profName, setProfName] = useState(businessProfile.name);
  const [profSubtitle, setProfSubtitle] = useState(businessProfile.subtitle);
  const [profOwner, setProfOwner] = useState(businessProfile.owner);

  const [searchTerm, setSearchTerm] = useState('');

  // Derived State
  const financials: FinancialState = useMemo(() => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    return { transactions, balance: totalIncome - totalExpense, totalIncome, totalExpense };
  }, [transactions]);

  const inventoryStats = useMemo(() => {
    const totalValue = inventory.reduce((acc, item) => acc + (item.quantity * item.unitCost), 0);
    const lowStockItems = inventory.filter(item => item.quantity <= item.reorderLevel).length;
    return { totalValue, lowStockItems };
  }, [inventory]);

  const chartData = useMemo(() => {
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
    return data.slice(-10);
  }, [transactions]);

  const pieData = useMemo(() => {
    const expenseCategories: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      expenseCategories[t.category] = (expenseCategories[t.category] || 0) + t.amount;
    });
    return Object.keys(expenseCategories).map(key => ({
      name: key,
      value: expenseCategories[key]
    }));
  }, [transactions]);

  // --- Handlers ---
  const openAddTxModal = (type: TransactionType) => {
    setNewTxType(type);
    setEditingTxId(null);
    setAmount(''); setDescription(''); setCategory(''); setIsAddModalOpen(true);
  };
  const openEditTxModal = (tx: Transaction) => {
    setNewTxType(tx.type); setEditingTxId(tx.id); setAmount(tx.amount.toString()); setDescription(tx.description); setCategory(tx.category); setIsAddModalOpen(true);
  };
  const handleSaveTransaction = () => {
    if (!amount || !description || !category) return;
    const newTx: Transaction = {
      id: editingTxId || generateId(),
      date: editingTxId ? transactions.find(t => t.id === editingTxId)!.date : new Date().toISOString(),
      amount: parseFloat(amount),
      description,
      type: newTxType,
      category
    };
    if (editingTxId) setTransactions(prev => prev.map(t => t.id === editingTxId ? newTx : t));
    else setTransactions(prev => [newTx, ...prev]);
    setIsAddModalOpen(false);
  };
  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Delete this transaction?')) setTransactions(prev => prev.filter(t => t.id !== id));
  };
  
  const handleAddInventory = () => {
    if (!invName || !invQuantity || !invCost) return;
    const qty = parseInt(invQuantity);
    const cost = parseFloat(invCost);
    const newItem: InventoryItem = {
      id: generateId(),
      name: invName,
      category: invCategory,
      quantity: qty,
      unitCost: cost,
      reorderLevel: parseInt(invReorder),
      lastUpdated: new Date().toISOString()
    };
    setInventory(prev => [newItem, ...prev]);
    if (logAsExpense) {
      setTransactions(prev => [{
        id: generateId(), date: new Date().toISOString(), amount: qty * cost,
        description: `Stock Purchase: ${invName} (x${qty})`, type: 'expense', category: 'Inventory (Fabric)'
      }, ...prev]);
    }
    setInvName(''); setInvCategory('Raw Material'); setInvQuantity(''); setInvCost(''); setIsInventoryModalOpen(false);
  };
  const handleDeleteInventory = (id: string) => {
    if (window.confirm('Remove item?')) setInventory(prev => prev.filter(i => i.id !== id));
  };
  const handleAdjustStock = (id: string, val: number) => {
    setInventory(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + val) } : i));
  };

  const handleSaveCustomer = () => {
    if (!custName) return;
    const newC: Customer = {
      id: editingCustId || generateId(),
      name: custName, phone: custPhone, email: custEmail, address: custAddress, notes: custNotes, totalSpent: 0
    };
    if (editingCustId) setCustomers(prev => prev.map(c => c.id === editingCustId ? newC : c));
    else setCustomers(prev => [...prev, newC]);
    setIsCustomerModalOpen(false);
  };

  const handleResetData = () => {
    if (window.confirm("WARNING: Wipe all data?")) {
      setTransactions([]); setInventory([]); setCustomers([]);
      localStorage.clear();
    }
  };

  // --- Views ---

  const DashboardView = () => {
    const isEmpty = transactions.length === 0 && inventory.length === 0;

    if (isEmpty) {
      return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
          <div className="mb-8">
            <h2 className="font-display font-bold text-3xl text-white">Overview</h2>
            <p className="text-gray-400">Business performance at a glance.</p>
          </div>
          
          <div className="flex-1 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center p-12 bg-[#051F1F]/50">
             <div className="w-16 h-16 bg-typo-teal/20 rounded-2xl flex items-center justify-center mb-6 text-typo-accent animate-pulse">
                <LayoutDashboard className="w-8 h-8" />
             </div>
             <h3 className="font-display font-bold text-2xl text-white mb-2">Start Your Business Journey</h3>
             <p className="text-gray-400 max-w-md text-center mb-8">Your dashboard is empty. Start by adding your initial inventory or recording your startup expenses.</p>
             <div className="flex gap-4">
                <Button onClick={() => setIsInventoryModalOpen(true)} variant="secondary" className="!px-6 !py-3">
                   <Box className="w-4 h-4" /> Go to Stock Room
                </Button>
                <Button onClick={() => openAddTxModal('income')} variant="primary" className="!px-6 !py-3">
                   <ArrowDownLeft className="w-4 h-4" /> Record Money
                </Button>
             </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-10">
        <div>
           <h2 className="font-display font-bold text-3xl text-white">Overview</h2>
           <p className="text-gray-400">Welcome back, {businessProfile.owner.split(' ')[0]}.</p>
        </div>

        <div className="grid grid-cols-3 gap-6">
           <Card className="col-span-1 bg-gradient-to-br from-typo-teal to-[#0A4545] border-none shadow-xl">
              <p className="text-typo-accent/80 text-xs font-bold uppercase tracking-wider mb-2">Total Balance</p>
              <h1 className="text-4xl font-display font-bold text-white mb-4">{formatMMK(financials.balance)}</h1>
              <div className="flex gap-2">
                 <div className="flex-1 bg-black/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                       <div className="w-2 h-2 rounded-full bg-green-400"></div>
                       <span className="text-xs text-gray-300">Income</span>
                    </div>
                    <p className="text-lg font-bold text-white">{formatMMK(financials.totalIncome)}</p>
                 </div>
                 <div className="flex-1 bg-black/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                       <div className="w-2 h-2 rounded-full bg-red-400"></div>
                       <span className="text-xs text-gray-300">Expense</span>
                    </div>
                    <p className="text-lg font-bold text-white">{formatMMK(financials.totalExpense)}</p>
                 </div>
              </div>
           </Card>

           <Card className="col-span-2 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-white">Cash Flow</h3>
                 <select className="bg-black/20 border-none text-xs text-gray-400 rounded-lg px-2 py-1">
                    <option>Last 30 Days</option>
                 </select>
              </div>
              <div className="flex-1 h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C4ECE8" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#C4ECE8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="date" stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                    <Tooltip contentStyle={{ backgroundColor: '#051F1F', borderColor: '#ffffff20', color: '#fff' }} />
                    <Area type="monotone" dataKey="balance" stroke="#C4ECE8" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </Card>
        </div>

        <div className="grid grid-cols-3 gap-6">
           <Card className="col-span-2">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-white">Recent Transactions</h3>
                 <Button onClick={() => setActiveTab('ledger')} variant="ghost" className="!p-0 text-xs">View All</Button>
              </div>
              <div className="space-y-3">
                 {transactions.slice(0, 4).map(tx => (
                    <div key={tx.id} onClick={() => openEditTxModal(tx)} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                       <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                             {tx.type === 'income' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                          </div>
                          <div>
                             <p className="font-bold text-white text-sm">{tx.description}</p>
                             <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString()}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className={`font-display font-bold text-sm ${tx.type === 'income' ? 'text-green-400' : 'text-white'}`}>
                             {tx.type === 'income' ? '+' : '-'} {formatMMK(tx.amount)}
                          </p>
                          <p className="text-[10px] text-gray-500">{tx.category}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </Card>

           <Card className="col-span-1">
              <h3 className="font-bold text-white mb-4">Expense Breakdown</h3>
              <div className="h-[200px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                       {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                     </Pie>
                     <Tooltip contentStyle={{ backgroundColor: '#051F1F', border: 'none', borderRadius: '8px', color: '#fff' }} formatter={(val: number) => formatMMK(val)} />
                     <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                   </PieChart>
                 </ResponsiveContainer>
              </div>
           </Card>
        </div>
      </div>
    );
  };

  const ConsultantView = () => {
    // Basic heuristics for "AI" advice
    const netProfit = financials.totalIncome - financials.totalExpense;
    const margin = financials.totalIncome > 0 ? (netProfit / financials.totalIncome) * 100 : 0;
    const burnRate = financials.totalExpense / (transactions.length > 0 ? transactions.length : 1); // Avg expense per tx (simplified)
    const inventoryVal = inventoryStats.totalValue;

    let advice = "Your business is just starting. Keep tracking!";
    if (margin > 30) advice = "Excellent profit margin! Consider reinvesting surplus into high-performing inventory.";
    else if (margin < 10 && financials.totalIncome > 0) advice = "Margins are tight. Review your supplier costs or consider raising prices.";
    if (netProfit < 0) advice = "You are currently operating at a loss. Focus on high-margin sales and reducing overhead.";

    return (
       <div className="space-y-6 animate-in slide-in-from-right duration-300">
         <div>
            <h2 className="font-display font-bold text-3xl text-white flex items-center gap-3">
               <Sparkles className="text-typo-accent" /> AI Consultant
            </h2>
            <p className="text-gray-400">Automated insights based on your data.</p>
         </div>

         <div className="grid grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-purple-900/40 to-typo-dark border-purple-500/20">
               <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><TrendingUp size={20} /></div>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${margin > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                     {margin.toFixed(1)}%
                  </span>
               </div>
               <p className="text-gray-400 text-xs uppercase tracking-wider font-bold">Net Profit Margin</p>
               <h3 className="text-2xl font-display font-bold text-white mt-1">{margin > 0 ? 'Healthy' : 'Needs Work'}</h3>
            </Card>

            <Card className="bg-gradient-to-br from-orange-900/40 to-typo-dark border-orange-500/20">
               <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400"><Activity size={20} /></div>
               </div>
               <p className="text-gray-400 text-xs uppercase tracking-wider font-bold">Burn Rate (Avg/Tx)</p>
               <h3 className="text-2xl font-display font-bold text-white mt-1">{formatMMK(burnRate)}</h3>
            </Card>

            <Card className="bg-gradient-to-br from-blue-900/40 to-typo-dark border-blue-500/20">
               <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><Box size={20} /></div>
               </div>
               <p className="text-gray-400 text-xs uppercase tracking-wider font-bold">Inventory Value</p>
               <h3 className="text-2xl font-display font-bold text-white mt-1">{formatMMK(inventoryVal)}</h3>
            </Card>
         </div>

         <div className="grid grid-cols-2 gap-6">
            <Card className="col-span-2 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-typo-accent/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
               <div className="relative z-10 flex gap-6 items-start">
                  <div className="w-16 h-16 bg-typo-teal rounded-full flex items-center justify-center shrink-0 border-4 border-[#0E2A2A] shadow-xl">
                     <BrainCircuit className="w-8 h-8 text-typo-accent" />
                  </div>
                  <div>
                     <h3 className="font-bold text-white text-lg mb-2">Consultant's Assessment</h3>
                     <p className="text-gray-300 leading-relaxed text-sm mb-4">"{advice}"</p>
                     
                     <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                           <Lightbulb size={14} className="text-yellow-400" />
                           <span>Tip: Keep your expenses logged daily for better accuracy.</span>
                        </div>
                     </div>
                  </div>
               </div>
            </Card>
         </div>
       </div>
    );
  };

  // --- Layout Structure ---

  return (
    <div className="flex h-screen bg-[#020B0B] text-typo-surface overflow-hidden font-sans selection:bg-typo-teal selection:text-white">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#051F1F] border-r border-white/5 flex flex-col shrink-0 transition-all duration-300 z-20">
         <div className="h-20 flex items-center px-6 border-b border-white/5">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
               <span className="font-display font-bold text-typo-dark text-xl">T</span>
            </div>
            <span className="font-display font-bold text-xl tracking-widest text-white">TYPO</span>
         </div>

         <nav className="flex-1 py-6 px-3 space-y-1">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-typo-teal text-white shadow-lg shadow-black/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
               <LayoutDashboard size={20} />
               <span className="font-medium text-sm">Dashboard</span>
            </button>
            <button onClick={() => setActiveTab('ledger')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'ledger' ? 'bg-typo-teal text-white shadow-lg shadow-black/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
               <ArrowDownLeft size={20} />
               <span className="font-medium text-sm">Money In/Out</span>
            </button>
            <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'inventory' ? 'bg-typo-teal text-white shadow-lg shadow-black/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
               <Shirt size={20} />
               <span className="font-medium text-sm">Stock Room</span>
            </button>
            <button onClick={() => setActiveTab('consultant')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'consultant' ? 'bg-typo-teal text-white shadow-lg shadow-black/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
               <Sparkles size={20} />
               <span className="font-medium text-sm">AI Consultant</span>
            </button>
            <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-typo-teal text-white shadow-lg shadow-black/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
               <Settings size={20} />
               <span className="font-medium text-sm">Data & Settings</span>
            </button>
         </nav>

         <div className="p-4 border-t border-white/5">
            <button onClick={() => setShowProfileModal(true)} className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white/5 transition-colors">
               <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold border-2 border-[#051F1F]">
                  {profOwner.charAt(0)}
               </div>
               <div className="text-left overflow-hidden">
                  <p className="text-sm font-bold text-white truncate">{profOwner}</p>
                  <p className="text-xs text-gray-500">Admin</p>
               </div>
            </button>
         </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
         {/* Header */}
         <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#020B0B]/95 backdrop-blur z-10">
            <div className="relative w-96">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
               <input 
                  type="text" 
                  placeholder="Search products or transactions..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#0E2A2A] border border-white/5 rounded-full py-2.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-typo-teal placeholder-gray-600"
               />
            </div>
            
            <div className="flex items-center gap-4">
               {activeTab !== 'dashboard' && (
                  <div className="bg-[#0E2A2A] px-4 py-2 rounded-lg border border-white/5">
                     <span className="text-xs text-gray-400 block">CURRENT BALANCE</span>
                     <span className="text-sm font-bold text-typo-accent">{formatMMK(financials.balance)}</span>
                  </div>
               )}
               <Button onClick={() => setIsInventoryModalOpen(true)} className="!rounded-full !px-6">
                  <Plus size={16} /> Add Product
               </Button>
            </div>
         </header>

         {/* Content Scroll Area */}
         <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {activeTab === 'dashboard' && <DashboardView />}
            
            {activeTab === 'ledger' && (
               <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex justify-between items-end">
                     <div>
                        <h2 className="font-display font-bold text-3xl text-white">Money In/Out</h2>
                        <p className="text-gray-400">Track all your business transactions.</p>
                     </div>
                     <div className="flex gap-2">
                        <Button onClick={() => openAddTxModal('expense')} variant="danger"><Minus size={16}/> Expense</Button>
                        <Button onClick={() => openAddTxModal('income')} variant="success"><Plus size={16}/> Income</Button>
                     </div>
                  </div>
                  
                  <div className="bg-[#0E2A2A] rounded-2xl border border-white/5 overflow-hidden">
                     <table className="w-full text-left text-sm">
                        <thead className="bg-black/20 text-gray-400 font-display text-xs uppercase tracking-wider">
                           <tr>
                              <th className="p-4 font-bold">Date</th>
                              <th className="p-4 font-bold">Description</th>
                              <th className="p-4 font-bold">Category</th>
                              <th className="p-4 font-bold text-right">Amount</th>
                              <th className="p-4 font-bold text-center">Action</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                           {transactions.filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase())).map(tx => (
                              <tr key={tx.id} onClick={() => openEditTxModal(tx)} className="hover:bg-white/5 cursor-pointer transition-colors group">
                                 <td className="p-4 text-gray-400 font-mono text-xs">{new Date(tx.date).toLocaleDateString()}</td>
                                 <td className="p-4 font-medium text-white">{tx.description}</td>
                                 <td className="p-4"><span className="px-2 py-1 rounded bg-white/5 text-gray-400 text-xs">{tx.category}</span></td>
                                 <td className={`p-4 text-right font-bold ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                    {tx.type === 'income' ? '+' : '-'} {formatMMK(tx.amount)}
                                 </td>
                                 <td className="p-4 text-center">
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteTransaction(tx.id); }} className="p-2 hover:bg-white/10 rounded-lg text-gray-500 hover:text-red-400 transition-colors">
                                       <Trash2 size={14} />
                                    </button>
                                 </td>
                              </tr>
                           ))}
                           {transactions.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-500">No records found.</td></tr>}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}

            {activeTab === 'inventory' && (
               <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex justify-between items-end">
                     <div>
                        <h2 className="font-display font-bold text-3xl text-white">Stock Room</h2>
                        <p className="text-gray-400">Manage your fabric, products and assets.</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-4 gap-6">
                     {inventory.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
                        <div key={item.id} className="bg-[#0E2A2A] p-4 rounded-2xl border border-white/5 hover:border-typo-teal/50 transition-colors group relative">
                           <button onClick={() => handleDeleteInventory(item.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 text-red-500 rounded-lg transition-all">
                              <Trash2 size={14} />
                           </button>
                           <div className="flex gap-3 mb-3">
                              <div className="w-10 h-10 rounded-xl bg-typo-teal/20 text-typo-accent flex items-center justify-center">
                                 <Package size={20} />
                              </div>
                              <div>
                                 <h4 className="font-bold text-white leading-tight">{item.name}</h4>
                                 <span className="text-[10px] text-gray-400 uppercase tracking-wide">{item.category}</span>
                              </div>
                           </div>
                           <div className="grid grid-cols-2 gap-2 text-xs mb-3 bg-black/20 p-2 rounded-lg">
                              <div><span className="block text-gray-500">Cost</span>{formatMMK(item.unitCost)}</div>
                              <div className="text-right"><span className="block text-gray-500">Value</span>{formatMMK(item.unitCost * item.quantity)}</div>
                           </div>
                           <div className="flex items-center justify-between">
                              <button onClick={() => handleAdjustStock(item.id, -1)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center"><Minus size={14} /></button>
                              <span className={`font-bold ${item.quantity <= item.reorderLevel ? 'text-orange-400' : 'text-white'}`}>{item.quantity} Units</span>
                              <button onClick={() => handleAdjustStock(item.id, 1)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center"><Plus size={14} /></button>
                           </div>
                        </div>
                     ))}
                     <button onClick={() => setIsInventoryModalOpen(true)} className="border-2 border-dashed border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-gray-500 hover:text-white hover:border-typo-teal/50 transition-all min-h-[200px]">
                        <Plus size={32} className="mb-2" />
                        <span className="font-bold text-sm">Add New Item</span>
                     </button>
                  </div>
               </div>
            )}

            {activeTab === 'consultant' && <ConsultantView />}
            
            {activeTab === 'settings' && (
               <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl">
                  <h2 className="font-display font-bold text-3xl text-white">Settings</h2>
                  
                  <Card>
                     <h3 className="font-bold text-white mb-4">Data Management</h3>
                     <div className="space-y-3">
                        <Button onClick={() => {
                           const data = JSON.stringify({ transactions, inventory, customers, profile: businessProfile });
                           const blob = new Blob([data], { type: 'application/json' });
                           const url = URL.createObjectURL(blob);
                           const link = document.createElement('a'); link.href = url; link.download = 'typo_backup.json'; link.click();
                        }} variant="secondary" className="w-full justify-start"><Download size={16}/> Export Backup</Button>
                        <Button onClick={handleResetData} variant="danger" className="w-full justify-start"><RotateCcw size={16}/> Reset Everything</Button>
                     </div>
                  </Card>
               </div>
            )}
         </div>
      </main>

      {/* --- Modals --- */}
      
      {/* Transaction Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={`Add ${newTxType}`}>
         <div className="space-y-4">
            <input type="number" autoFocus value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (MMK)" className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-2xl font-bold text-white focus:border-typo-teal outline-none" />
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-typo-teal outline-none" />
            <div className="grid grid-cols-2 gap-2">
               {CATEGORIES[newTxType].map(cat => (
                  <button key={cat} onClick={() => setCategory(cat)} className={`p-2 rounded-lg text-xs font-bold transition-all ${category === cat ? 'bg-typo-teal text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>{cat}</button>
               ))}
            </div>
            <Button onClick={handleSaveTransaction} className="w-full py-3">{editingTxId ? 'Update' : 'Save'}</Button>
         </div>
      </Modal>

      {/* Inventory Modal */}
      <Modal isOpen={isInventoryModalOpen} onClose={() => setIsInventoryModalOpen(false)} title="New Product">
         <div className="space-y-4">
            <input type="text" autoFocus value={invName} onChange={(e) => setInvName(e.target.value)} placeholder="Product Name" className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-typo-teal outline-none" />
            <div className="grid grid-cols-2 gap-4">
               <input type="number" value={invQuantity} onChange={(e) => setInvQuantity(e.target.value)} placeholder="Qty" className="bg-black/20 border border-white/10 rounded-xl p-3 text-white" />
               <input type="number" value={invCost} onChange={(e) => setInvCost(e.target.value)} placeholder="Unit Cost" className="bg-black/20 border border-white/10 rounded-xl p-3 text-white" />
            </div>
            <div className="flex flex-wrap gap-2">
               {INVENTORY_CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setInvCategory(cat)} className={`px-3 py-2 rounded-lg text-xs font-bold ${invCategory === cat ? 'bg-typo-teal text-white' : 'bg-white/5 text-gray-400'}`}>{cat}</button>
               ))}
            </div>
            <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer">
               <input type="checkbox" checked={logAsExpense} onChange={(e) => setLogAsExpense(e.target.checked)} className="rounded text-typo-teal focus:ring-0 bg-black/20 border-white/10" />
               <span className="text-sm text-gray-300">Log cost as expense?</span>
            </label>
            <Button onClick={handleAddInventory} className="w-full py-3">Add to Stock</Button>
         </div>
      </Modal>

      {/* Profile Modal */}
      <Modal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} title="Edit Profile">
         <div className="space-y-4">
            <input type="text" value={profName} onChange={(e) => setProfName(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white" />
            <input type="text" value={profSubtitle} onChange={(e) => setProfSubtitle(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white" />
            <input type="text" value={profOwner} onChange={(e) => setProfOwner(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white" />
            <Button onClick={() => { setBusinessProfile({ name: profName, subtitle: profSubtitle, owner: profOwner }); setShowProfileModal(false); }} className="w-full">Save Profile</Button>
         </div>
      </Modal>

    </div>
  );
}