import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, 
  Minus,
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
  Package,
  AlertTriangle,
  RefreshCw,
  Box,
  Tags,
  Users,
  Edit2,
  Phone,
  MapPin,
  FileText,
  PieChart as PieChartIcon,
  RotateCcw
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
  Legend
} from 'recharts';
import { Transaction, FinancialState, CATEGORIES, TransactionType, InventoryItem, INVENTORY_CATEGORIES, InventoryCategory, Customer } from './types';

// --- Utility Functions ---

const formatMMK = (amount: number) => {
  return new Intl.NumberFormat('my-MM', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const generateId = () => Math.random().toString(36).substr(2, 9);

const COLORS = ['#0E5E5E', '#4ECDC4', '#C4ECE8', '#FF6B6B', '#FFD93D', '#6A0572', '#AB83A1'];

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
      <div className="bg-[#F0F7F7] dark:bg-[#051F1F] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-typo-teal/30 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="p-6 border-b border-typo-teal/10 flex justify-between items-center bg-typo-teal text-white sticky top-0 z-10">
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ledger' | 'inventory' | 'customers' | 'settings'>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  // Transaction Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [newTxType, setNewTxType] = useState<TransactionType>('income');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  
  // Inventory Form State
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [invName, setInvName] = useState('');
  const [invCategory, setInvCategory] = useState<InventoryCategory>('Raw Material');
  const [invQuantity, setInvQuantity] = useState('');
  const [invCost, setInvCost] = useState('');
  const [invReorder, setInvReorder] = useState('10');
  const [logAsExpense, setLogAsExpense] = useState(false);

  // Customer Form State
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custNotes, setCustNotes] = useState('');
  const [editingCustId, setEditingCustId] = useState<string | null>(null);

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

  const inventoryStats = useMemo(() => {
    const totalValue = inventory.reduce((acc, item) => acc + (item.quantity * item.unitCost), 0);
    const lowStockItems = inventory.filter(item => item.quantity <= item.reorderLevel).length;
    return { totalValue, lowStockItems };
  }, [inventory]);

  // Chart Data
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
    setAmount('');
    setDescription('');
    setCategory('');
    setIsAddModalOpen(true);
  };

  const openEditTxModal = (tx: Transaction) => {
    setNewTxType(tx.type);
    setEditingTxId(tx.id);
    setAmount(tx.amount.toString());
    setDescription(tx.description);
    setCategory(tx.category);
    setIsAddModalOpen(true);
  };

  const handleSaveTransaction = () => {
    if (!amount || !description || !category) return;
    
    if (editingTxId) {
      // Edit Mode
      setTransactions(prev => prev.map(t => {
        if (t.id === editingTxId) {
           return {
             ...t,
             amount: parseFloat(amount),
             description,
             category,
             type: newTxType
           }
        }
        return t;
      }));
    } else {
      // Add Mode
      const newTx: Transaction = {
        id: generateId(),
        date: new Date().toISOString(),
        amount: parseFloat(amount),
        description,
        type: newTxType,
        category
      };
      setTransactions(prev => [newTx, ...prev]);
    }

    setAmount('');
    setDescription('');
    setCategory('');
    setEditingTxId(null);
    setIsAddModalOpen(false);
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
      const totalCost = qty * cost;
      const expenseTx: Transaction = {
        id: generateId(),
        date: new Date().toISOString(),
        amount: totalCost,
        description: `Stock Purchase: ${invName} (x${qty})`,
        type: 'expense',
        category: 'Inventory (Fabric)'
      };
      setTransactions(prev => [expenseTx, ...prev]);
    }

    setInvName('');
    setInvCategory('Raw Material');
    setInvQuantity('');
    setInvCost('');
    setLogAsExpense(false);
    setIsInventoryModalOpen(false);
  };

  const openCustomerModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustId(customer.id);
      setCustName(customer.name);
      setCustPhone(customer.phone);
      setCustEmail(customer.email);
      setCustAddress(customer.address);
      setCustNotes(customer.notes);
    } else {
      setEditingCustId(null);
      setCustName('');
      setCustPhone('');
      setCustEmail('');
      setCustAddress('');
      setCustNotes('');
    }
    setIsCustomerModalOpen(true);
  };

  const handleSaveCustomer = () => {
    if (!custName) return;

    if (editingCustId) {
      setCustomers(prev => prev.map(c => c.id === editingCustId ? {
        ...c,
        name: custName,
        phone: custPhone,
        email: custEmail,
        address: custAddress,
        notes: custNotes
      } : c));
    } else {
      const newCustomer: Customer = {
        id: generateId(),
        name: custName,
        phone: custPhone,
        email: custEmail,
        address: custAddress,
        notes: custNotes,
        totalSpent: 0
      };
      setCustomers(prev => [...prev, newCustomer]);
    }
    setIsCustomerModalOpen(false);
  };

  const handleDeleteCustomer = (id: string) => {
    if (window.confirm('Delete this customer?')) {
      setCustomers(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleAdjustStock = (id: string, adjustment: number) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + adjustment);
        return { ...item, quantity: newQty, lastUpdated: new Date().toISOString() };
      }
      return item;
    }));
  };

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Delete this transaction?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleDeleteInventory = (id: string) => {
    if (window.confirm('Remove this item from inventory?')) {
      setInventory(prev => prev.filter(i => i.id !== id));
    }
  };

  const handleResetData = () => {
    if (window.confirm("WARNING: This will delete ALL transactions, inventory, and customers. This cannot be undone.")) {
       if (window.confirm("Are you absolutely sure?")) {
         setTransactions([]);
         setInventory([]);
         setCustomers([]);
         alert("All data has been reset to 0.");
       }
    }
  };

  // --- Data Management ---

  const handleExport = () => {
    const exportData = {
      transactions,
      inventory,
      customers,
      exportedAt: new Date().toISOString(),
      version: "1.2"
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `typo_full_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const data = JSON.parse(result);
        
        if (Array.isArray(data)) {
          setTransactions(data);
          alert('Legacy transactions imported successfully!');
        } else if (data.transactions || data.inventory || data.customers) {
          if (data.transactions) setTransactions(data.transactions);
          if (data.inventory) setInventory(data.inventory);
          if (data.customers) setCustomers(data.customers);
          alert('Full system backup imported successfully!');
        } else {
          alert('Invalid file format.');
        }
      } catch (err) {
        alert('Error parsing file.');
      }
    };
    reader.readAsText(file);
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
            <p className="text-typo-accent/70 text-sm font-medium tracking-wide">Net Profit</p>
            <div className="flex items-baseline gap-2">
              <h1 className="text-4xl sm:text-5xl font-display font-bold text-white tracking-wider tabular-nums">
                {formatMMK(financials.balance)}
              </h1>
              <span className="text-lg font-normal text-white/50 font-display">MMK</span>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
             <button 
               onClick={() => openAddTxModal('income')}
               className="flex-1 bg-typo-accent text-typo-teal py-3 px-4 rounded-xl font-display font-bold text-sm hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-lg"
             >
               <Plus className="w-4 h-4" /> Add Income
             </button>
             <button 
                onClick={() => openAddTxModal('expense')}
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

       {/* Pie Chart */}
       {pieData.length > 0 && (
        <Card className="!p-0 overflow-hidden bg-white dark:bg-typo-teal flex flex-col">
          <div className="p-6 pb-2">
             <h3 className="font-display font-bold text-lg text-typo-dark dark:text-white flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-typo-teal dark:text-typo-accent" />
                Expense Breakdown
             </h3>
          </div>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   formatter={(value: number) => formatMMK(value)}
                   contentStyle={{ backgroundColor: '#051F1F', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 custom-scrollbar">
         <button onClick={() => setIsInventoryModalOpen(true)} className="flex-none bg-white dark:bg-typo-light p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center gap-3 min-w-[160px] shadow-sm">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600 dark:text-purple-400">
               <Box size={20} />
            </div>
            <div className="text-left">
               <div className="font-bold text-sm text-typo-dark dark:text-white">Add Stock</div>
               <div className="text-[10px] text-gray-500">Log new items</div>
            </div>
         </button>
         <button onClick={() => { setActiveTab('inventory'); }} className="flex-none bg-white dark:bg-typo-light p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center gap-3 min-w-[160px] shadow-sm">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg text-orange-600 dark:text-orange-400">
               <AlertTriangle size={20} />
            </div>
            <div className="text-left">
               <div className="font-bold text-sm text-typo-dark dark:text-white">Check Low</div>
               <div className="text-[10px] text-gray-500">{inventoryStats.lowStockItems} items alert</div>
            </div>
         </button>
      </div>

      {/* Recent Transactions */}
      <div className="bg-typo-teal dark:bg-typo-teal rounded-[2rem] p-1 shadow-inner shadow-black/20">
        <div className="bg-[#F5FBFB] dark:bg-[#0B2A2A] rounded-[1.8rem] p-5 min-h-[300px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-typo-dark dark:text-white text-lg tracking-wide">Recent</h3>
            <button onClick={() => setActiveTab('ledger')} className="text-xs text-typo-teal dark:text-typo-accent bg-typo-teal/10 dark:bg-white/10 px-3 py-1 rounded-full hover:bg-typo-teal/20 transition-colors font-semibold">View All</button>
          </div>
          
          <div className="space-y-3">
            {transactions.slice(0, 5).map((tx) => (
              <div onClick={() => openEditTxModal(tx)} key={tx.id} className="flex items-center justify-between bg-white dark:bg-typo-light/30 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 active:scale-95 transition-transform cursor-pointer">
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

  const InventoryView = () => (
    <div className="space-y-6 pb-24 animate-in slide-in-from-right duration-300">
       <div className="sticky top-0 bg-[#F0F7F7] dark:bg-[#051F1F] z-20 pb-4 pt-2">
        <h2 className="font-display font-bold text-3xl text-typo-dark dark:text-white mb-4 pl-2">INVENTORY</h2>
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search fabric, items..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-typo-light rounded-2xl py-3 pl-12 pr-4 text-typo-dark dark:text-white shadow-sm border-none focus:ring-2 focus:ring-typo-teal placeholder-gray-400 font-display tracking-wide"
          />
        </div>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="!p-4 bg-typo-teal text-white">
           <div className="text-typo-accent/80 text-xs font-bold uppercase tracking-wider mb-2">Total Value</div>
           <div className="text-2xl font-display font-bold">{formatMMK(inventoryStats.totalValue)}</div>
           <div className="text-[10px] opacity-60">Assets on hand</div>
        </Card>
        <Card className="!p-4 bg-white dark:bg-typo-light">
           <div className="text-gray-500 dark:text-typo-accent/80 text-xs font-bold uppercase tracking-wider mb-2">Low Stock</div>
           <div className="flex items-center gap-2">
             <div className="text-2xl font-display font-bold text-orange-500">{inventoryStats.lowStockItems}</div>
             {inventoryStats.lowStockItems > 0 && <AlertTriangle className="w-5 h-5 text-orange-500 animate-pulse" />}
           </div>
           <div className="text-[10px] text-gray-400">Items need restock</div>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setIsInventoryModalOpen(true)} className="!py-2 !px-4 text-xs">
          <Plus className="w-4 h-4" /> Add Item
        </Button>
      </div>

      {/* Inventory List */}
      <div className="space-y-3">
        {inventory
           .filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()) || i.category.toLowerCase().includes(searchTerm.toLowerCase()))
           .map(item => (
           <div key={item.id} className="bg-white dark:bg-typo-light p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                 <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      item.category === 'Raw Material' ? 'bg-blue-100 text-blue-600' : 
                      item.category === 'Finished Product' ? 'bg-green-100 text-green-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      <Box size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-typo-dark dark:text-white">{item.name}</h4>
                      <span className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-black/20 rounded text-gray-500 font-bold uppercase tracking-wide">{item.category}</span>
                    </div>
                 </div>
                 <button onClick={() => handleDeleteInventory(item.id)} className="text-gray-300 hover:text-red-500 p-1">
                    <Trash2 size={16} />
                 </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 border-t border-dashed border-gray-200 dark:border-white/10 pt-3 mt-1">
                 <div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold">Unit Cost</div>
                    <div className="text-sm font-display font-bold text-typo-dark dark:text-typo-accent">{formatMMK(item.unitCost)}</div>
                 </div>
                 <div className="text-right">
                    <div className="text-[10px] text-gray-400 uppercase font-bold">Total Value</div>
                    <div className="text-sm font-display font-bold text-typo-dark dark:text-white">{formatMMK(item.unitCost * item.quantity)}</div>
                 </div>
              </div>

              <div className="mt-4 flex items-center justify-between bg-gray-50 dark:bg-black/20 rounded-xl p-2">
                 <button onClick={() => handleAdjustStock(item.id, -1)} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-typo-light rounded-lg shadow-sm text-gray-500 hover:text-red-500 active:scale-95 transition-all">
                    <Minus size={14} />
                 </button>
                 <div className={`font-display font-bold text-lg ${item.quantity <= item.reorderLevel ? 'text-orange-500' : 'text-typo-dark dark:text-white'}`}>
                    {item.quantity}
                 </div>
                 <button onClick={() => handleAdjustStock(item.id, 1)} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-typo-light rounded-lg shadow-sm text-gray-500 hover:text-green-500 active:scale-95 transition-all">
                    <Plus size={14} />
                 </button>
              </div>
           </div>
        ))}
        {inventory.length === 0 && (
          <div className="text-center py-10 opacity-50">
             <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
             <p className="text-sm">Inventory is empty</p>
          </div>
        )}
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
                  <td className="p-4 text-center flex items-center justify-center gap-2">
                     <button onClick={() => openEditTxModal(tx)} className="text-gray-300 hover:text-typo-teal dark:hover:text-typo-accent transition-colors">
                        <Edit2 className="w-4 h-4" />
                     </button>
                     <button onClick={() => handleDeleteTransaction(tx.id)} className="text-gray-300 hover:text-red-500 transition-colors">
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

  const CustomersView = () => (
    <div className="space-y-6 pb-24 animate-in slide-in-from-right duration-300">
       <div className="sticky top-0 bg-[#F0F7F7] dark:bg-[#051F1F] z-20 pb-4 pt-2 flex justify-between items-end">
        <div>
           <h2 className="font-display font-bold text-3xl text-typo-dark dark:text-white pl-2">CUSTOMERS</h2>
           <p className="text-xs text-gray-500 pl-2">CRM & Address Book</p>
        </div>
        <Button onClick={() => openCustomerModal()} className="!py-2 !px-4 text-xs">
          <Plus className="w-4 h-4" /> Add
        </Button>
      </div>

      <div className="grid gap-4">
         {customers.map(c => (
            <div key={c.id} className="bg-white dark:bg-typo-light p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 relative group">
               <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openCustomerModal(c)} className="p-1.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 hover:text-typo-teal">
                     <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDeleteCustomer(c.id)} className="p-1.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-500 hover:text-red-500">
                     <Trash2 size={14} />
                  </button>
               </div>
               
               <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-typo-teal to-typo-light flex items-center justify-center text-white font-display font-bold text-xl">
                     {c.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                     <h3 className="font-bold text-lg text-typo-dark dark:text-white">{c.name}</h3>
                     
                     <div className="mt-2 space-y-1">
                        {c.phone && (
                           <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <Phone size={14} />
                              <span>{c.phone}</span>
                           </div>
                        )}
                        {c.address && (
                           <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <MapPin size={14} />
                              <span className="truncate max-w-[200px]">{c.address}</span>
                           </div>
                        )}
                         {c.notes && (
                           <div className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400 mt-2 bg-gray-50 dark:bg-black/20 p-2 rounded-lg">
                              <FileText size={14} className="mt-0.5" />
                              <span className="text-xs italic">{c.notes}</span>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         ))}
         {customers.length === 0 && (
          <div className="text-center py-10 opacity-50">
             <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
             <p className="text-sm">No customers added yet</p>
          </div>
        )}
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
                    <div className="font-bold text-white">Export Full Backup</div>
                    <div className="text-xs text-white/50">Save transactions, stock & CRM</div>
                  </div>
                </div>
                <div className="text-typo-accent opacity-0 group-hover:opacity-100 transition-opacity">
                   <ArrowUpRight className="w-5 h-5" />
                </div>
             </button>

             <button 
               onClick={() => fileInputRef.current?.click()}
               className="w-full bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl p-4 flex items-center justify-between group transition-all"
             >
                <div className="flex items-center gap-4">
                  <div className="bg-typo-accent p-2 rounded-lg text-typo-teal">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-white">Import Backup</div>
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

       <Card className="!p-0 overflow-hidden border-red-200 bg-red-50 dark:bg-red-900/10">
          <div className="p-6">
            <h3 className="font-display font-bold text-xl mb-1 text-red-600 dark:text-red-400">Danger Zone</h3>
            <p className="text-sm text-red-600/60 dark:text-red-400/60 mb-4">Irreversible actions.</p>
            
            <button 
               onClick={handleResetData}
               className="w-full bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 p-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all"
            >
               <RotateCcw className="w-4 h-4" />
               Reset All Data to 0
            </button>
          </div>
       </Card>

       <div className="p-4 text-center text-xs text-gray-400">
          <p>TYPO Business Manager v1.3</p>
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
          {activeTab === 'dashboard' ? 'DASHBOARD' : activeTab === 'ledger' ? 'LEDGER' : activeTab === 'inventory' ? 'STOCK' : activeTab === 'customers' ? 'CRM' : 'SYSTEM'}
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
        {activeTab === 'inventory' && <InventoryView />}
        {activeTab === 'customers' && <CustomersView />}
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
            onClick={() => openAddTxModal('income')}
            className="bg-typo-accent text-typo-teal px-6 py-3 rounded-full font-bold font-display flex items-center gap-2 hover:bg-white transition-colors mx-2 shadow-lg active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>NEW</span>
          </button>

          <button 
            onClick={() => setActiveTab('inventory')} 
            className={`p-3 rounded-full transition-all duration-300 ${activeTab === 'inventory' ? 'bg-white/20 text-typo-accent' : 'hover:bg-white/10 text-white/50'}`}
          >
            <Package className="w-6 h-6" />
          </button>

          <button 
            onClick={() => setActiveTab('customers')} 
            className={`p-3 rounded-full transition-all duration-300 ${activeTab === 'customers' ? 'bg-white/20 text-typo-accent' : 'hover:bg-white/10 text-white/50'}`}
          >
            <Users className="w-6 h-6" />
          </button>

          <button 
            onClick={() => setActiveTab('settings')}
            className={`p-3 rounded-full transition-all duration-300 ${activeTab === 'settings' ? 'bg-white/20 text-typo-accent' : 'hover:bg-white/10 text-white/50'}`}
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Add/Edit Transaction Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`${editingTxId ? 'Edit' : 'Add'} ${newTxType}`}
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
                onClick={handleSaveTransaction}
                disabled={!amount || !description || !category}
                className="flex-[2] bg-typo-teal text-white rounded-xl py-3 font-display font-bold tracking-wide shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-typo-light transition-colors"
             >
               {editingTxId ? 'UPDATE' : 'SAVE'}
             </button>
          </div>
        </div>
      </Modal>

      {/* Add Inventory Modal */}
      <Modal
        isOpen={isInventoryModalOpen}
        onClose={() => setIsInventoryModalOpen(false)}
        title="New Stock Item"
      >
        <div className="space-y-4">
          <div>
             <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Item Name</label>
             <input 
               type="text" 
               autoFocus
               value={invName}
               onChange={(e) => setInvName(e.target.value)}
               className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 font-medium text-typo-dark dark:text-white focus:ring-2 focus:ring-typo-teal/50 outline-none"
               placeholder="e.g. White Cotton T-Shirt XL"
             />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Quantity</label>
               <input 
                 type="number" 
                 value={invQuantity}
                 onChange={(e) => setInvQuantity(e.target.value)}
                 className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 font-display font-bold text-lg text-typo-dark dark:text-white focus:ring-2 focus:ring-typo-teal/50 outline-none"
                 placeholder="0"
               />
             </div>
             <div>
               <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Unit Cost (MMK)</label>
               <input 
                 type="number" 
                 value={invCost}
                 onChange={(e) => setInvCost(e.target.value)}
                 className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 font-display font-bold text-lg text-typo-dark dark:text-white focus:ring-2 focus:ring-typo-teal/50 outline-none"
                 placeholder="0"
               />
             </div>
          </div>

          <div>
             <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Category</label>
             <div className="flex flex-wrap gap-2">
                {INVENTORY_CATEGORIES.map((cat) => (
                   <button 
                      key={cat}
                      onClick={() => setInvCategory(cat)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                         invCategory === cat 
                         ? 'bg-typo-teal text-white' 
                         : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400'
                      }`}
                   >
                      {cat}
                   </button>
                ))}
             </div>
          </div>

          <div>
             <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Low Stock Alert Level</label>
             <input 
                 type="number" 
                 value={invReorder}
                 onChange={(e) => setInvReorder(e.target.value)}
                 className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm text-typo-dark dark:text-white focus:ring-2 focus:ring-typo-teal/50 outline-none"
             />
          </div>

          <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl flex items-center gap-3">
             <input 
               type="checkbox" 
               id="logExpense" 
               checked={logAsExpense} 
               onChange={(e) => setLogAsExpense(e.target.checked)}
               className="w-5 h-5 rounded text-typo-teal focus:ring-typo-teal"
             />
             <label htmlFor="logExpense" className="text-sm text-typo-dark dark:text-white cursor-pointer select-none">
                <span className="font-bold block">Log as Expense?</span>
                <span className="text-xs text-gray-500 block">Automatically add total cost to ledger</span>
             </label>
          </div>

          <div className="pt-4 flex gap-3">
             <button 
                onClick={() => setIsInventoryModalOpen(false)}
                className="flex-1 py-3 text-gray-500 font-bold text-sm hover:text-gray-700 dark:hover:text-white"
             >
               CANCEL
             </button>
             <button 
                onClick={handleAddInventory}
                disabled={!invName || !invQuantity || !invCost}
                className="flex-[2] bg-typo-teal text-white rounded-xl py-3 font-display font-bold tracking-wide shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-typo-light transition-colors"
             >
               SAVE ITEM
             </button>
          </div>
        </div>
      </Modal>

      {/* Customer Modal */}
      <Modal
         isOpen={isCustomerModalOpen}
         onClose={() => setIsCustomerModalOpen(false)}
         title={`${editingCustId ? 'Edit' : 'Add'} Customer`}
      >
         <div className="space-y-4">
            <div>
               <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Name</label>
               <input 
                  type="text" 
                  autoFocus
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 font-medium text-typo-dark dark:text-white focus:ring-2 focus:ring-typo-teal/50 outline-none"
                  placeholder="Customer Name"
               />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Phone</label>
                  <input 
                     type="text" 
                     value={custPhone}
                     onChange={(e) => setCustPhone(e.target.value)}
                     className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm text-typo-dark dark:text-white focus:ring-2 focus:ring-typo-teal/50 outline-none"
                     placeholder="09..."
                  />
               </div>
               <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Email</label>
                  <input 
                     type="email" 
                     value={custEmail}
                     onChange={(e) => setCustEmail(e.target.value)}
                     className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm text-typo-dark dark:text-white focus:ring-2 focus:ring-typo-teal/50 outline-none"
                     placeholder="Optional"
                  />
               </div>
            </div>

            <div>
               <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Address</label>
               <textarea 
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm text-typo-dark dark:text-white focus:ring-2 focus:ring-typo-teal/50 outline-none h-20 resize-none"
                  placeholder="Delivery Address..."
               />
            </div>

            <div>
               <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Notes</label>
               <input 
                  type="text" 
                  value={custNotes}
                  onChange={(e) => setCustNotes(e.target.value)}
                  className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm text-typo-dark dark:text-white focus:ring-2 focus:ring-typo-teal/50 outline-none"
                  placeholder="Sizes, preferences, etc."
               />
            </div>

            <div className="pt-4 flex gap-3">
               <button 
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="flex-1 py-3 text-gray-500 font-bold text-sm hover:text-gray-700 dark:hover:text-white"
               >
                  CANCEL
               </button>
               <button 
                  onClick={handleSaveCustomer}
                  disabled={!custName}
                  className="flex-[2] bg-typo-teal text-white rounded-xl py-3 font-display font-bold tracking-wide shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-typo-light transition-colors"
               >
                  {editingCustId ? 'UPDATE' : 'SAVE CUSTOMER'}
               </button>
            </div>
         </div>
      </Modal>

    </div>
  );
}