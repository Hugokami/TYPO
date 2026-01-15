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
  Lightbulb,
  ShoppingBag,
  Tag,
  Calculator,
  Filter,
  FileSpreadsheet
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

const TypoLogo = () => (
  <svg viewBox="0 0 100 100" fill="currentColor" className="w-8 h-8 text-typo-dark">
    {/* Top Bar */}
    <path d="M10 15 H 90 V 32 H 10 Z" rx="2" />
    {/* Bottom Hook Shape */}
    <path d="M 70 38 L 70 65 A 25 25 0 0 1 20 65 L 38 65 A 10 10 0 0 0 52 65 L 52 38 Z" />
  </svg>
);

const Button = ({ children, onClick, variant = 'primary', className = '' }: { children?: React.ReactNode, onClick?: () => void, variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success', className?: string }) => {
  const baseStyle = "font-display font-bold tracking-wide rounded-xl px-4 py-2.5 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm backdrop-blur-sm";
  const variants = {
    primary: "bg-typo-accent text-typo-teal hover:bg-white hover:shadow-lg hover:shadow-typo-accent/20",
    secondary: "bg-typo-teal/80 text-white border border-white/10 hover:bg-typo-teal",
    ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/5",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/10",
    success: "bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/10"
  };

  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }: { children?: React.ReactNode, className?: string }) => (
  <div className={`bg-[#0E2A2A]/60 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-colors ${className}`}>
    {children}
  </div>
);

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children?: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#051F1F] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto custom-scrollbar relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white z-10">
            <X className="w-5 h-5" />
        </button>
        <div className="p-8">
          <h3 className="font-display font-bold text-2xl tracking-wide text-white mb-6">{title}</h3>
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
    return saved ? JSON.parse(saved) : { name: 'TYPO', subtitle: 'Apparel Co.', owner: 'HUGO' };
  });

  // --- Persistence Effects ---
  useEffect(() => localStorage.setItem('typo_transactions', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('typo_inventory', JSON.stringify(inventory)), [inventory]);
  useEffect(() => localStorage.setItem('typo_customers', JSON.stringify(customers)), [customers]);
  useEffect(() => localStorage.setItem('typo_profile', JSON.stringify(businessProfile)), [businessProfile]);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'ledger' | 'inventory' | 'consultant' | 'settings'>('dashboard');
  
  // UI States
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [invFilter, setInvFilter] = useState<InventoryCategory | 'All'>('All');

  // Transaction Form
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [newTxType, setNewTxType] = useState<TransactionType>('income');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  
  // Inventory Form
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [invName, setInvName] = useState('');
  const [invCategory, setInvCategory] = useState<InventoryCategory>('Finished Product');
  const [invQuantity, setInvQuantity] = useState('');
  const [invCost, setInvCost] = useState('');
  const [invPrice, setInvPrice] = useState(''); // New: Selling Price
  const [invSize, setInvSize] = useState(''); // New: Size
  const [invColor, setInvColor] = useState(''); // New: Color
  const [invReorder, setInvReorder] = useState('10');
  const [logAsExpense, setLogAsExpense] = useState(false);

  // Quick Sell Modal State
  const [isQuickSellOpen, setIsQuickSellOpen] = useState(false);
  const [selectedItemForSale, setSelectedItemForSale] = useState<InventoryItem | null>(null);
  const [saleQuantity, setSaleQuantity] = useState('1');

  // Customer Form
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custNotes, setCustNotes] = useState('');
  const [editingCustId, setEditingCustId] = useState<string | null>(null);

  // Profile Form
  const [profName, setProfName] = useState(businessProfile.name);
  const [profSubtitle, setProfSubtitle] = useState(businessProfile.subtitle);
  const [profOwner, setProfOwner] = useState(businessProfile.owner);

  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived State
  const financials: FinancialState = useMemo(() => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    return { transactions, balance: totalIncome - totalExpense, totalIncome, totalExpense };
  }, [transactions]);

  const inventoryStats = useMemo(() => {
    const totalCostValue = inventory.reduce((acc, item) => acc + (item.quantity * item.unitCost), 0);
    const totalRetailValue = inventory.reduce((acc, item) => acc + (item.quantity * (item.unitPrice || item.unitCost)), 0);
    const lowStockItems = inventory.filter(item => item.quantity <= item.reorderLevel).length;
    return { totalCostValue, totalRetailValue, lowStockItems };
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
  
  // Enhanced Inventory Handler
  const handleAddInventory = () => {
    if (!invName || !invQuantity || !invCost) return;
    const qty = parseInt(invQuantity);
    const cost = parseFloat(invCost);
    const price = invPrice ? parseFloat(invPrice) : 0;
    
    const newItem: InventoryItem = {
      id: generateId(),
      name: invName,
      category: invCategory,
      quantity: qty,
      unitCost: cost,
      unitPrice: price,
      size: invSize,
      color: invColor,
      reorderLevel: parseInt(invReorder),
      lastUpdated: new Date().toISOString()
    };
    
    setInventory(prev => [newItem, ...prev]);
    
    if (logAsExpense) {
      setTransactions(prev => [{
        id: generateId(), date: new Date().toISOString(), amount: qty * cost,
        description: `Stock Purchase: ${invName} ${invSize} ${invColor} (x${qty})`, type: 'expense', category: 'Inventory (Fabric)'
      }, ...prev]);
    }
    // Reset Form
    setInvName(''); setInvCategory('Finished Product'); setInvQuantity(''); setInvCost(''); setInvPrice(''); setInvSize(''); setInvColor('');
    setIsInventoryModalOpen(false);
  };

  const handleDeleteInventory = (id: string) => {
    if (window.confirm('Remove item?')) setInventory(prev => prev.filter(i => i.id !== id));
  };
  const handleAdjustStock = (id: string, val: number) => {
    setInventory(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + val) } : i));
  };

  // Quick Sell Handler
  const openQuickSell = (item: InventoryItem) => {
    setSelectedItemForSale(item);
    setSaleQuantity('1');
    setIsQuickSellOpen(true);
  };

  const executeQuickSell = () => {
    if (!selectedItemForSale || !saleQuantity) return;
    
    const qty = parseInt(saleQuantity);
    if (qty > selectedItemForSale.quantity) {
        alert("Not enough stock!");
        return;
    }

    // 1. Deduct Stock
    setInventory(prev => prev.map(i => i.id === selectedItemForSale.id ? { ...i, quantity: i.quantity - qty } : i));

    // 2. Add Income Transaction
    const totalSaleAmount = qty * selectedItemForSale.unitPrice;
    const newTx: Transaction = {
        id: generateId(),
        date: new Date().toISOString(),
        amount: totalSaleAmount,
        description: `Sale: ${selectedItemForSale.name} (${selectedItemForSale.size || ''} ${selectedItemForSale.color || ''}) x${qty}`,
        type: 'income',
        category: 'Sales Revenue'
    };
    setTransactions(prev => [newTx, ...prev]);
    
    setIsQuickSellOpen(false);
    setSelectedItemForSale(null);
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const data = JSON.parse(json);
        
        if (window.confirm("Importing will overwrite your current data. Are you sure you want to continue?")) {
            if (Array.isArray(data.transactions)) setTransactions(data.transactions);
            if (Array.isArray(data.inventory)) setInventory(data.inventory);
            if (Array.isArray(data.customers)) setCustomers(data.customers);
            if (data.profile) setBusinessProfile(data.profile);
            alert("Backup imported successfully!");
        }
      } catch (error) {
        alert("Error importing file: Invalid format.");
        console.error(error);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; 
  };
  
  const handleExportCSV = () => {
      const headers = ["Date", "Description", "Type", "Category", "Amount"];
      const csvContent = [
          headers.join(","),
          ...transactions.map(t => [
              new Date(t.date).toLocaleDateString(),
              `"${t.description.replace(/"/g, '""')}"`,
              t.type,
              t.category,
              t.amount
          ].join(","))
      ].join("\n");
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `typo_ledger_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleResetData = () => {
    if (window.confirm("WARNING: This will wipe ALL data and cannot be undone. Are you sure?")) {
      localStorage.clear();
      window.location.reload();
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
          
          <div className="flex-1 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center p-12 bg-[#051F1F]/30 backdrop-blur-sm">
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
           <Card className="col-span-1 bg-[#1A1A1A]/80 border-l-4 border-purple-500 backdrop-blur-sm">
               <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><Tag size={20} /></div>
                   <h3 className="font-bold text-white">Potential Revenue</h3>
               </div>
               <p className="text-2xl font-display font-bold text-white">{formatMMK(inventoryStats.totalRetailValue)}</p>
               <p className="text-xs text-gray-500 mt-1">If all current stock is sold</p>
           </Card>

           <Card className="col-span-1 bg-[#1A1A1A]/80 border-l-4 border-orange-500 backdrop-blur-sm">
               <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400"><Box size={20} /></div>
                   <h3 className="font-bold text-white">Stock Value (Cost)</h3>
               </div>
               <p className="text-2xl font-display font-bold text-white">{formatMMK(inventoryStats.totalCostValue)}</p>
               <p className="text-xs text-gray-500 mt-1">Total investment in goods</p>
           </Card>

           <Card className="col-span-1 bg-[#1A1A1A]/80 border-l-4 border-blue-500 backdrop-blur-sm">
               <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><TrendingUp size={20} /></div>
                   <h3 className="font-bold text-white">Potential Profit</h3>
               </div>
               <p className="text-2xl font-display font-bold text-white">{formatMMK(inventoryStats.totalRetailValue - inventoryStats.totalCostValue)}</p>
               <p className="text-xs text-gray-500 mt-1">Revenue minus Cost</p>
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
    // Advanced heuristics
    const netProfit = financials.totalIncome - financials.totalExpense;
    const margin = financials.totalIncome > 0 ? (netProfit / financials.totalIncome) * 100 : 0;
    const potentialProfit = inventoryStats.totalRetailValue - inventoryStats.totalCostValue;
    const stockEfficiency = inventoryStats.totalCostValue > 0 ? (financials.totalIncome / inventoryStats.totalCostValue) : 0;

    let advice = "Your business is just starting. Keep tracking!";
    if (margin > 30) advice = "Excellent profit margin! Consider reinvesting surplus into high-performing inventory.";
    else if (margin < 10 && financials.totalIncome > 0) advice = "Margins are tight. Review your supplier costs or consider raising prices.";
    if (netProfit < 0) advice = "You are currently operating at a loss. Focus on high-margin sales and reducing overhead.";
    if (potentialProfit > 500000 && financials.balance < 100000) advice = "You have a lot of value tied up in stock. Run a promotion to increase cash flow.";

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
               <p className="text-gray-400 text-xs uppercase tracking-wider font-bold">Realized Profit Margin</p>
               <h3 className="text-2xl font-display font-bold text-white mt-1">{margin > 0 ? 'Healthy' : 'Needs Work'}</h3>
            </Card>

            <Card className="bg-gradient-to-br from-orange-900/40 to-typo-dark border-orange-500/20">
               <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400"><Calculator size={20} /></div>
               </div>
               <p className="text-gray-400 text-xs uppercase tracking-wider font-bold">Projected Profit (Stock)</p>
               <h3 className="text-2xl font-display font-bold text-white mt-1">{formatMMK(potentialProfit)}</h3>
            </Card>

            <Card className="bg-gradient-to-br from-blue-900/40 to-typo-dark border-blue-500/20">
               <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><Box size={20} /></div>
               </div>
               <p className="text-gray-400 text-xs uppercase tracking-wider font-bold">Stock Efficiency Ratio</p>
               <h3 className="text-2xl font-display font-bold text-white mt-1">{stockEfficiency.toFixed(2)}x</h3>
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
      <aside className="w-64 bg-[#051F1F]/90 backdrop-blur-xl border-r border-white/5 flex flex-col shrink-0 transition-all duration-300 z-20">
         <div className="h-20 flex items-center px-6 border-b border-white/5 gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-white rounded-lg">
                <TypoLogo />
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
            <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all justify-between group ${activeTab === 'inventory' ? 'bg-typo-teal text-white shadow-lg shadow-black/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
               <div className="flex items-center gap-3">
                   <Shirt size={20} />
                   <span className="font-medium text-sm">Stock Room</span>
               </div>
               {inventoryStats.lowStockItems > 0 && (
                   <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                       {inventoryStats.lowStockItems}
                   </span>
               )}
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

         <div className="p-4 border-t border-white/5 bg-black/10 backdrop-blur-md">
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
         {/* Background Decor */}
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-typo-teal/10 rounded-full blur-[100px] pointer-events-none" />
         
         {/* Header */}
         <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#020B0B]/80 backdrop-blur-md z-10">
            <div className="relative w-96 group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 group-focus-within:text-typo-accent transition-colors" />
               <input 
                  type="text" 
                  placeholder="Search products or transactions..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#0E2A2A]/50 border border-white/5 rounded-full py-2.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-typo-teal placeholder-gray-600 transition-all hover:bg-[#0E2A2A]"
               />
            </div>
            
            <div className="flex items-center gap-4">
               {activeTab !== 'dashboard' && (
                  <div className="bg-[#0E2A2A]/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/5 hidden md:block">
                     <span className="text-xs text-gray-400 block">CURRENT BALANCE</span>
                     <span className="text-sm font-bold text-typo-accent">{formatMMK(financials.balance)}</span>
                  </div>
               )}
               <Button onClick={() => setIsInventoryModalOpen(true)} className="!rounded-full !px-6 shadow-lg shadow-typo-accent/5">
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
                        <Button onClick={handleExportCSV} variant="ghost" className="!px-3"><FileSpreadsheet size={16}/> CSV</Button>
                        <Button onClick={() => openAddTxModal('expense')} variant="danger"><Minus size={16}/> Expense</Button>
                        <Button onClick={() => openAddTxModal('income')} variant="success"><Plus size={16}/> Income</Button>
                     </div>
                  </div>
                  
                  {/* Summary Cards for Ledger */}
                  <div className="grid grid-cols-3 gap-4">
                      <div className="bg-[#0E2A2A]/60 p-4 rounded-xl border border-white/5 flex flex-col">
                          <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Net Income</span>
                          <span className={`text-xl font-bold ${financials.balance >= 0 ? 'text-white' : 'text-red-400'}`}>{formatMMK(financials.balance)}</span>
                      </div>
                      <div className="bg-[#0E2A2A]/60 p-4 rounded-xl border border-white/5 flex flex-col">
                          <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Total In</span>
                          <span className="text-xl font-bold text-green-400">+{formatMMK(financials.totalIncome)}</span>
                      </div>
                      <div className="bg-[#0E2A2A]/60 p-4 rounded-xl border border-white/5 flex flex-col">
                          <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Total Out</span>
                          <span className="text-xl font-bold text-red-400">-{formatMMK(financials.totalExpense)}</span>
                      </div>
                  </div>
                  
                  <div className="bg-[#0E2A2A]/60 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden">
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
                     {/* Category Filter */}
                     <div className="bg-[#0E2A2A]/50 p-1 rounded-xl flex gap-1 border border-white/5">
                         {['All', ...INVENTORY_CATEGORIES].map(cat => (
                             <button 
                                key={cat} 
                                onClick={() => setInvFilter(cat as InventoryCategory | 'All')}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${invFilter === cat ? 'bg-typo-teal text-white shadow' : 'text-gray-400 hover:text-white'}`}
                             >
                                 {cat}
                             </button>
                         ))}
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                     {inventory
                        .filter(i => (invFilter === 'All' || i.category === invFilter))
                        .filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map(item => {
                         const margin = item.unitPrice && item.unitCost ? ((item.unitPrice - item.unitCost) / item.unitPrice * 100).toFixed(0) : 0;
                         return (
                        <div key={item.id} className="bg-[#0E2A2A]/60 backdrop-blur-md p-5 rounded-2xl border border-white/5 hover:border-typo-teal/50 hover:bg-[#0E2A2A]/80 transition-all group relative flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20">
                           <div className="flex justify-between items-start mb-3">
                              <div className="flex gap-3">
                                <div className="w-12 h-12 rounded-xl bg-typo-teal/20 text-typo-accent flex items-center justify-center shrink-0">
                                    <Shirt size={22} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white leading-tight mb-1">{item.name}</h4>
                                    <div className="flex gap-2 text-[10px] uppercase font-bold tracking-wide">
                                        {item.size && <span className="bg-white/10 text-gray-300 px-1.5 py-0.5 rounded border border-white/5">{item.size}</span>}
                                        {item.color && <span className="bg-white/10 text-gray-300 px-1.5 py-0.5 rounded border border-white/5">{item.color}</span>}
                                    </div>
                                </div>
                              </div>
                              <button onClick={() => handleDeleteInventory(item.id)} className="text-gray-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                  <Trash2 size={16} />
                              </button>
                           </div>

                           <div className="grid grid-cols-2 gap-2 mb-4 bg-black/20 p-3 rounded-xl border border-white/5">
                                <div>
                                    <span className="block text-[10px] text-gray-500 uppercase font-bold">Cost</span>
                                    <span className="text-white font-mono text-sm">{formatMMK(item.unitCost)}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-gray-500 uppercase font-bold">Price</span>
                                    <span className="text-typo-accent font-bold font-mono text-sm">{item.unitPrice ? formatMMK(item.unitPrice) : '-'}</span>
                                </div>
                           </div>

                           <div className="mt-auto pt-2 border-t border-white/5 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                  <button onClick={() => handleAdjustStock(item.id, -1)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white"><Minus size={14} /></button>
                                  <span className={`font-bold min-w-[3ch] text-center ${item.quantity <= item.reorderLevel ? 'text-red-400' : 'text-white'}`}>{item.quantity}</span>
                                  <button onClick={() => handleAdjustStock(item.id, 1)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white"><Plus size={14} /></button>
                              </div>
                              <Button onClick={() => openQuickSell(item)} variant="success" className="!py-1.5 !px-3 !text-xs !rounded-lg">
                                  Sell
                              </Button>
                           </div>
                           
                           {Number(margin) > 0 && (
                               <div className="absolute -top-2 -right-2 bg-green-500 text-black text-[10px] font-bold px-2 py-1 rounded-full shadow-lg shadow-green-500/20">
                                   {margin}% Margin
                               </div>
                           )}
                           
                           {item.quantity <= item.reorderLevel && (
                               <div className="absolute top-2 right-2 text-red-500 animate-pulse" title="Low Stock">
                                   <AlertTriangle size={16} />
                               </div>
                           )}
                        </div>
                     )})}
                     
                     <button onClick={() => setIsInventoryModalOpen(true)} className="border-2 border-dashed border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center text-gray-500 hover:text-white hover:border-typo-teal/50 hover:bg-white/5 transition-all min-h-[220px] group">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:bg-typo-accent group-hover:text-typo-teal transition-colors group-hover:scale-110 duration-300">
                            <Plus size={24} />
                        </div>
                        <span className="font-bold text-sm">Add New Product</span>
                        <span className="text-xs text-gray-600 mt-1 text-center px-4 group-hover:text-gray-400">Add fabric, finished shirts, or assets</span>
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
                        
                        <div className="relative">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleImportBackup} 
                                className="hidden" 
                                accept=".json"
                            />
                            <Button onClick={() => fileInputRef.current?.click()} variant="secondary" className="w-full justify-start">
                                <Upload size={16}/> Import Backup
                            </Button>
                        </div>

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
      <Modal isOpen={isInventoryModalOpen} onClose={() => setIsInventoryModalOpen(false)} title="Add New Product">
         <div className="space-y-5">
            <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 tracking-wider">Product Name</label>
                <input type="text" autoFocus value={invName} onChange={(e) => setInvName(e.target.value)} placeholder="e.g. Neon Glitch Tee" className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-typo-teal outline-none font-medium placeholder-gray-600" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 tracking-wider">Size</label>
                 <input type="text" value={invSize} onChange={(e) => setInvSize(e.target.value)} placeholder="L" className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-typo-teal outline-none placeholder-gray-600" />
               </div>
               <div>
                 <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 tracking-wider">Color</label>
                 <input type="text" value={invColor} onChange={(e) => setInvColor(e.target.value)} placeholder="e.g. Black" className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-typo-teal outline-none placeholder-gray-600" />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 tracking-wider">Cost (MMK)</label>
                  <input type="number" value={invCost} onChange={(e) => setInvCost(e.target.value)} placeholder="0" className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-typo-teal outline-none font-mono" />
               </div>
               <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 tracking-wider">Price (MMK)</label>
                  <input type="number" value={invPrice} onChange={(e) => setInvPrice(e.target.value)} placeholder="0" className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-typo-teal outline-none font-mono" />
               </div>
            </div>

            {/* Micro-calc: Margin Display */}
            {invCost && invPrice && (
                <div className="bg-white/5 rounded-lg p-3 flex items-center justify-between border border-white/5">
                    <span className="text-xs text-gray-400">Estimated Profit/Unit</span>
                    <div className="text-right">
                        <span className="block font-bold text-typo-accent">{formatMMK(parseFloat(invPrice) - parseFloat(invCost))}</span>
                        <span className="text-[10px] text-gray-500">
                             {(((parseFloat(invPrice) - parseFloat(invCost)) / parseFloat(invPrice)) * 100).toFixed(1)}% Margin
                        </span>
                    </div>
                </div>
            )}

            <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 tracking-wider">Initial Stock</label>
                <input type="number" value={invQuantity} onChange={(e) => setInvQuantity(e.target.value)} placeholder="0" className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-typo-teal outline-none font-bold text-lg" />
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
               {INVENTORY_CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setInvCategory(cat)} className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider ${invCategory === cat ? 'bg-typo-teal text-white' : 'bg-white/5 text-gray-500'}`}>{cat}</button>
               ))}
            </div>

            <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
               <input type="checkbox" checked={logAsExpense} onChange={(e) => setLogAsExpense(e.target.checked)} className="rounded text-typo-teal focus:ring-0 bg-black/20 border-white/10" />
               <div>
                   <span className="text-sm font-bold text-white block">Log as Expense?</span>
                   <span className="text-xs text-gray-500 block">Automatically add total cost to ledger</span>
               </div>
            </label>

            <Button onClick={handleAddInventory} className="w-full py-4 text-base bg-typo-accent text-typo-dark hover:bg-white">Save to Inventory</Button>
         </div>
      </Modal>

      {/* Quick Sell Modal */}
      <Modal isOpen={isQuickSellOpen} onClose={() => setIsQuickSellOpen(false)} title="Quick Sale">
         <div className="space-y-6">
            <div className="bg-white/5 p-4 rounded-xl flex items-center gap-4">
                 <div className="w-12 h-12 bg-typo-teal/20 rounded-lg flex items-center justify-center text-typo-accent">
                     <Shirt size={24} />
                 </div>
                 <div>
                     <h4 className="font-bold text-white text-lg">{selectedItemForSale?.name}</h4>
                     <p className="text-gray-400 text-sm">{selectedItemForSale?.size} • {selectedItemForSale?.color}</p>
                 </div>
            </div>

            <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 tracking-wider">Quantity to Sell</label>
                <div className="flex items-center gap-4">
                     <input 
                        type="number" 
                        value={saleQuantity} 
                        onChange={(e) => setSaleQuantity(e.target.value)}
                        className="flex-1 bg-black/20 border border-white/10 rounded-xl p-4 text-2xl font-bold text-white text-center focus:border-typo-teal outline-none"
                        autoFocus
                     />
                     <div className="text-right">
                         <span className="block text-gray-500 text-xs uppercase font-bold">Total</span>
                         <span className="block text-typo-accent font-bold text-xl">
                            {formatMMK((parseInt(saleQuantity) || 0) * (selectedItemForSale?.unitPrice || 0))}
                         </span>
                     </div>
                </div>
            </div>

            <Button onClick={executeQuickSell} variant="success" className="w-full py-4 text-lg">
                Confirm Sale
            </Button>
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