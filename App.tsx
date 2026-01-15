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
  Settings,
  Trash2,
  TrendingUp,
  Box,
  X,
  Sparkles,
  Shirt,
  BrainCircuit,
  Lightbulb,
  Tag,
  Calculator,
  FileSpreadsheet,
  Menu,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RotateCcw,
  Edit2,
  Palette,
  Check
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
import { Transaction, FinancialState, CATEGORIES, TransactionType, InventoryItem, INVENTORY_CATEGORIES, InventoryCategory, Customer, ThemeConfig } from './types';

// --- Utility Functions ---

const formatMMK = (amount: number) => {
  return new Intl.NumberFormat('my-MM', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' MMK';
};

const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Theme Presets ---

const THEMES: ThemeConfig[] = [
  {
    id: 'ocean',
    name: 'Ocean Depth',
    colors: {
      bgDark: '#051F1F',
      bgLight: '#0E2A2A',
      primary: '#0E5E5E',
      accent: '#C4ECE8',
      textMain: '#F0F7F7',
      textMuted: '#9CA3AF'
    },
    gradient: 'linear-gradient(135deg, #0E5E5E 0%, #0A4545 100%)'
  },
  {
    id: 'sunset',
    name: 'Cyber Sunset',
    colors: {
      bgDark: '#1A0B14',
      bgLight: '#2D1222',
      primary: '#9D174D',
      accent: '#FBCFE8',
      textMain: '#FDF2F8',
      textMuted: '#FDA4AF'
    },
    gradient: 'linear-gradient(135deg, #BE185D 0%, #831843 100%)'
  },
  {
    id: 'midnight',
    name: 'Midnight Pro',
    colors: {
      bgDark: '#020617',
      bgLight: '#0F172A',
      primary: '#3B82F6',
      accent: '#BFDBFE',
      textMain: '#F8FAFC',
      textMuted: '#94A3B8'
    },
    gradient: 'linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)'
  },
  {
    id: 'forest',
    name: 'Deep Forest',
    colors: {
      bgDark: '#052e16',
      bgLight: '#14532d',
      primary: '#22c55e',
      accent: '#dcfce7',
      textMain: '#f0fdf4',
      textMuted: '#86efac'
    },
    gradient: 'linear-gradient(135deg, #16a34a 0%, #14532d 100%)'
  }
];

// --- Components ---

const ModernTLogo = ({ collapsed = false }: { collapsed?: boolean }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${collapsed ? 'w-10 h-10' : 'w-10 h-10'} transition-all duration-500`}>
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
        <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.7" />
      </linearGradient>
    </defs>
    {/* Top Bar */}
    <rect x="15" y="15" width="70" height="18" rx="4" fill="url(#logoGradient)" />
    {/* Vertical Pillar with angle */}
    <path d="M42 38H58V75C58 80.5228 53.5228 85 48 85H42V38Z" fill="url(#logoGradient)" fillOpacity="0.8" />
    <path d="M58 38H65V75C65 80.5228 60.5228 85 55 85H58V38Z" fill="currentColor" fillOpacity="0.4" />
  </svg>
);

const Button = ({ children, onClick, variant = 'primary', className = '' }: { children?: React.ReactNode, onClick?: () => void, variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success', className?: string }) => {
  const baseStyle = "font-display font-bold tracking-wide rounded-xl px-4 py-2.5 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm backdrop-blur-md border";
  const variants = {
    primary: "bg-typo-teal border-typo-teal text-white shadow-lg shadow-typo-teal/20 hover:brightness-110",
    secondary: "bg-white/5 border-white/10 text-typo-surface hover:bg-white/10 hover:border-white/20",
    ghost: "bg-transparent border-transparent text-typo-muted hover:text-typo-surface hover:bg-white/5",
    danger: "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20",
    success: "bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500/20"
  };

  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }: { children?: React.ReactNode, className?: string }) => (
  <div className={`bg-typo-light/60 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/5 shadow-xl hover:border-white/10 transition-all duration-300 ${className}`}>
    {children}
  </div>
);

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children?: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-typo-dark rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto custom-scrollbar relative ring-1 ring-white/10">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white z-10">
            <X className="w-5 h-5" />
        </button>
        <div className="p-6 sm:p-8">
          <h3 className="font-display font-bold text-2xl tracking-wide text-typo-surface mb-6 border-l-4 border-typo-teal pl-4">{title}</h3>
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
  
  const [businessProfile, setBusinessProfile] = useState(() => {
    const saved = localStorage.getItem('typo_profile');
    return saved ? JSON.parse(saved) : { name: 'TYPO', subtitle: 'Apparel Co.', owner: 'HUGO' };
  });

  const [currentThemeId, setCurrentThemeId] = useState(() => {
    return localStorage.getItem('typo_theme_id') || 'ocean';
  });

  // --- Persistence Effects ---
  useEffect(() => localStorage.setItem('typo_transactions', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('typo_inventory', JSON.stringify(inventory)), [inventory]);
  useEffect(() => localStorage.setItem('typo_profile', JSON.stringify(businessProfile)), [businessProfile]);
  useEffect(() => localStorage.setItem('typo_theme_id', currentThemeId), [currentThemeId]);

  // --- Theme Effect ---
  useEffect(() => {
    const theme = THEMES.find(t => t.id === currentThemeId) || THEMES[0];
    const root = document.documentElement;
    root.style.setProperty('--color-bg-dark', theme.colors.bgDark);
    root.style.setProperty('--color-bg-light', theme.colors.bgLight);
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-text-main', theme.colors.textMain);
    root.style.setProperty('--color-text-muted', theme.colors.textMuted);
    root.style.setProperty('--bg-gradient', theme.gradient);
  }, [currentThemeId]);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'ledger' | 'inventory' | 'consultant' | 'settings'>('dashboard');
  
  // Sidebar states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile drawer
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Desktop toggle

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
  const [editingInventoryId, setEditingInventoryId] = useState<string | null>(null);
  const [invName, setInvName] = useState('');
  const [invCategory, setInvCategory] = useState<InventoryCategory>('Finished Product');
  const [invQuantity, setInvQuantity] = useState('');
  const [invCost, setInvCost] = useState('');
  const [invPrice, setInvPrice] = useState('');
  const [invSize, setInvSize] = useState('');
  const [invColor, setInvColor] = useState('');
  const [invReorder, setInvReorder] = useState('10');
  const [logAsExpense, setLogAsExpense] = useState(false);

  // Quick Sell Modal State
  const [isQuickSellOpen, setIsQuickSellOpen] = useState(false);
  const [selectedItemForSale, setSelectedItemForSale] = useState<InventoryItem | null>(null);
  const [saleQuantity, setSaleQuantity] = useState('1');

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
  
  const openEditInventoryModal = (item: InventoryItem) => {
    setEditingInventoryId(item.id);
    setInvName(item.name);
    setInvCategory(item.category);
    setInvQuantity(item.quantity.toString());
    setInvCost(item.unitCost.toString());
    setInvPrice(item.unitPrice.toString());
    setInvSize(item.size);
    setInvColor(item.color);
    setInvReorder(item.reorderLevel.toString());
    setLogAsExpense(false); 
    setIsInventoryModalOpen(true);
  };

  const handleAddInventory = () => {
    if (!invName || !invQuantity || !invCost) return;
    const qty = parseInt(invQuantity);
    const cost = parseFloat(invCost);
    const price = invPrice ? parseFloat(invPrice) : 0;
    
    const newItem: InventoryItem = {
      id: editingInventoryId || generateId(),
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
    
    if (editingInventoryId) {
       setInventory(prev => prev.map(i => i.id === editingInventoryId ? newItem : i));
    } else {
       setInventory(prev => [newItem, ...prev]);
       if (logAsExpense) {
          setTransactions(prev => [{
            id: generateId(), date: new Date().toISOString(), amount: qty * cost,
            description: `Stock Purchase: ${invName} ${invSize} ${invColor} (x${qty})`, type: 'expense', category: 'Inventory (Fabric)'
          }, ...prev]);
       }
    }
    
    setInvName(''); setInvCategory('Finished Product'); setInvQuantity(''); setInvCost(''); setInvPrice(''); setInvSize(''); setInvColor('');
    setEditingInventoryId(null);
    setIsInventoryModalOpen(false);
  };

  const handleDeleteInventory = (id: string) => {
    if (window.confirm('Remove item?')) setInventory(prev => prev.filter(i => i.id !== id));
  };
  const handleAdjustStock = (id: string, val: number) => {
    setInventory(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + val) } : i));
  };

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
    setInventory(prev => prev.map(i => i.id === selectedItemForSale.id ? { ...i, quantity: i.quantity - qty } : i));
    const totalSaleAmount = qty * selectedItemForSale.unitPrice;
    setTransactions(prev => [{
        id: generateId(), date: new Date().toISOString(), amount: totalSaleAmount,
        description: `Sale: ${selectedItemForSale.name} (${selectedItemForSale.size || ''} ${selectedItemForSale.color || ''}) x${qty}`,
        type: 'income', category: 'Sales Revenue'
    }, ...prev]);
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
        if (window.confirm("Importing will overwrite your current data. Are you sure?")) {
            if (Array.isArray(data.transactions)) setTransactions(data.transactions);
            if (Array.isArray(data.inventory)) setInventory(data.inventory);
            if (data.profile) setBusinessProfile(data.profile);
            alert("Backup imported successfully!");
        }
      } catch (error) { alert("Error importing file."); }
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
      link.setAttribute('download', `ledger_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleExportInventoryCSV = () => {
    const headers = ["Name", "Category", "Size", "Color", "Quantity", "Cost", "Price", "Total Value"];
    const csvContent = [
        headers.join(","),
        ...inventory.map(i => [
            `"${i.name.replace(/"/g, '""')}"`,
            i.category,
            i.size,
            i.color,
            i.quantity,
            i.unitCost,
            i.unitPrice,
            (i.quantity * i.unitCost).toFixed(2)
        ].join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `inventory_${new Date().toISOString().split('T')[0]}.csv`);
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

  const SidebarContent = () => (
    <>
      <div className={`h-24 flex items-center px-6 border-b border-white/5 ${isSidebarCollapsed ? 'justify-center' : 'gap-4'} bg-typo-dark/50 backdrop-blur-xl`}>
        <div className={`text-typo-teal shrink-0`}>
          <ModernTLogo collapsed={isSidebarCollapsed} />
        </div>
        {!isSidebarCollapsed && (
          <div className="animate-in fade-in duration-300">
             <span className="font-display font-bold text-2xl tracking-widest text-typo-surface block">{businessProfile.name}</span>
             <span className="text-[10px] uppercase tracking-widest text-typo-muted block">Business Manager</span>
          </div>
        )}
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {[
          { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { id: 'ledger', icon: ArrowDownLeft, label: 'Money In/Out' },
          { id: 'inventory', icon: Shirt, label: 'Stock Room', badge: inventoryStats.lowStockItems },
          { id: 'consultant', icon: Sparkles, label: 'AI Consultant' },
          { id: 'settings', icon: Settings, label: 'Settings' }
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => { setActiveTab(item.id as any); setIsSidebarOpen(false); }}
            className={`w-full flex items-center rounded-xl transition-all duration-300 relative group overflow-hidden ${isSidebarCollapsed ? 'justify-center p-3' : 'px-4 py-3.5 gap-3'} ${activeTab === item.id ? 'text-white shadow-lg' : 'text-typo-muted hover:text-white hover:bg-white/5'}`}
            title={isSidebarCollapsed ? item.label : ''}
          >
            {activeTab === item.id && (
                <div className="absolute inset-0 bg-typo-gradient opacity-100 transition-opacity duration-300 -z-10" />
            )}
            <item.icon size={20} className={`shrink-0 z-10 ${activeTab === item.id ? 'text-white' : 'text-typo-muted group-hover:text-typo-accent'}`} />
            {!isSidebarCollapsed && <span className="font-medium text-sm whitespace-nowrap z-10">{item.label}</span>}
            
            {!isSidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-auto shadow-sm z-10">
                {item.badge}
              </span>
            )}
            {isSidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-typo-dark z-10 animate-pulse" />
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5 bg-black/10 backdrop-blur-md">
        <button 
          onClick={() => { setShowProfileModal(true); setIsSidebarOpen(false); }} 
          className={`flex items-center w-full p-2.5 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}
        >
          <div className="w-10 h-10 rounded-xl bg-typo-gradient flex items-center justify-center text-white font-bold shadow-lg shrink-0">
            {profOwner.charAt(0)}
          </div>
          {!isSidebarCollapsed && (
            <div className="text-left overflow-hidden">
              <p className="text-sm font-bold text-typo-surface truncate">{profOwner}</p>
              <p className="text-xs text-typo-muted">Administrator</p>
            </div>
          )}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-typo-dark text-typo-surface overflow-hidden font-sans selection:bg-typo-teal selection:text-white transition-colors duration-500">
      
      {/* Sidebar - Desktop */}
      <aside className={`hidden md:flex flex-col bg-typo-light/30 backdrop-blur-xl border-r border-white/5 shrink-0 transition-all duration-300 z-20 ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}>
         <SidebarContent />
         {/* Desktop Collapse Toggle */}
         <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-24 w-6 h-6 bg-typo-light text-typo-accent rounded-full flex items-center justify-center border border-white/10 shadow-lg hover:bg-typo-teal hover:text-white transition-colors"
         >
           {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
         </button>
      </aside>

      {/* Sidebar - Mobile Drawer */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 md:hidden ${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      />
      <aside className={`fixed top-0 left-0 bottom-0 w-72 bg-typo-dark z-[60] flex flex-col transition-transform duration-300 md:hidden border-r border-white/5 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-typo-dark">
         {/* Background Decor - Dynamic */}
         <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-typo-teal/20 rounded-full blur-[120px] pointer-events-none opacity-50 mix-blend-screen" />
         <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-typo-accent/5 rounded-full blur-[100px] pointer-events-none opacity-30 mix-blend-screen" />
         
         {/* Header */}
         <header className="h-16 sm:h-20 border-b border-white/5 flex items-center justify-between px-4 sm:px-8 bg-typo-dark/80 backdrop-blur-md z-10 sticky top-0">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
               <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 -ml-2 text-typo-muted hover:text-typo-surface md:hidden transition-colors"
               >
                 <Menu size={24} />
               </button>
               <div className="relative flex-1 sm:w-96 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-typo-muted w-4 h-4 group-focus-within:text-typo-accent transition-colors" />
                  <input 
                      type="text" 
                      placeholder="Search..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-typo-teal/50 placeholder-typo-muted transition-all hover:bg-white/10"
                  />
               </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
               {activeTab !== 'dashboard' && (
                  <div className="bg-white/5 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/5 hidden lg:block">
                     <span className="text-[10px] text-typo-muted block font-bold tracking-wider">BALANCE</span>
                     <span className="text-sm font-bold text-typo-accent">{formatMMK(financials.balance)}</span>
                  </div>
               )}
               <Button onClick={() => { setEditingInventoryId(null); setIsInventoryModalOpen(true); }} className="!rounded-full !px-4 sm:!px-6 shadow-xl shadow-typo-primary/20 hover:-translate-y-0.5 transition-transform">
                  <Plus size={16} /> <span className="hidden sm:inline">Add Product</span>
               </Button>
            </div>
         </header>

         {/* Content Scroll Area */}
         <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar scroll-smooth">
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-in fade-in duration-500 pb-10">
                <div className="flex justify-between items-start">
                   <div>
                      <h2 className="font-display font-bold text-2xl sm:text-3xl text-typo-surface">Overview</h2>
                      <p className="text-typo-muted text-sm mt-1">Real-time business performance.</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                   <Card className="lg:col-span-1 bg-gradient-to-br from-typo-teal/80 to-typo-light border-none shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-white/20 transition-colors duration-500"></div>
                      <p className="text-typo-accent/80 text-xs font-bold uppercase tracking-wider mb-2 relative z-10">Total Balance</p>
                      <h1 className="text-3xl sm:text-5xl font-display font-bold text-white mb-6 relative z-10 tracking-tight">{formatMMK(financials.balance)}</h1>
                      <div className="flex gap-3 relative z-10">
                         <div className="flex-1 bg-black/20 rounded-xl p-3 backdrop-blur-sm border border-white/5">
                            <span className="text-[10px] text-gray-300 block mb-1 font-bold uppercase">Income</span>
                            <p className="text-sm sm:text-base font-bold text-white">+{formatMMK(financials.totalIncome)}</p>
                         </div>
                         <div className="flex-1 bg-black/20 rounded-xl p-3 backdrop-blur-sm border border-white/5">
                            <span className="text-[10px] text-gray-300 block mb-1 font-bold uppercase">Expense</span>
                            <p className="text-sm sm:text-base font-bold text-white">-{formatMMK(financials.totalExpense)}</p>
                         </div>
                      </div>
                   </Card>

                   <Card className="lg:col-span-2 flex flex-col min-h-[280px]">
                      <h3 className="font-bold text-typo-surface mb-4 text-sm flex items-center gap-2">
                          <TrendingUp size={16} className="text-typo-teal" /> Cash Flow
                      </h3>
                      <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={10} tickLine={false} axisLine={false} hide={window.innerWidth < 640} />
                            <YAxis stroke="var(--color-text-muted)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val/1000}k`} />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--color-bg-dark)', borderColor: 'rgba(255,255,255,0.1)', color: 'var(--color-text-main)', borderRadius: '12px' }} />
                            <Area type="monotone" dataKey="balance" stroke="var(--color-accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                   </Card>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                   <Card className="border-l-4 border-l-purple-500/50 hover:border-l-purple-500 transition-colors">
                       <div className="flex items-center gap-3 mb-2">
                           <Tag size={16} className="text-purple-400" />
                           <h3 className="font-bold text-typo-muted text-xs uppercase tracking-wider">Revenue Pot.</h3>
                       </div>
                       <p className="text-xl sm:text-2xl font-display font-bold text-typo-surface">{formatMMK(inventoryStats.totalRetailValue)}</p>
                   </Card>

                   <Card className="border-l-4 border-l-orange-500/50 hover:border-l-orange-500 transition-colors">
                       <div className="flex items-center gap-3 mb-2">
                           <Box size={16} className="text-orange-400" />
                           <h3 className="font-bold text-typo-muted text-xs uppercase tracking-wider">Stock Value</h3>
                       </div>
                       <p className="text-xl sm:text-2xl font-display font-bold text-typo-surface">{formatMMK(inventoryStats.totalCostValue)}</p>
                   </Card>

                   <Card className="border-l-4 border-l-blue-500/50 hover:border-l-blue-500 transition-colors">
                       <div className="flex items-center gap-3 mb-2">
                           <TrendingUp size={16} className="text-blue-400" />
                           <h3 className="font-bold text-typo-muted text-xs uppercase tracking-wider">Profit Pot.</h3>
                       </div>
                       <p className="text-xl sm:text-2xl font-display font-bold text-typo-surface">{formatMMK(inventoryStats.totalRetailValue - inventoryStats.totalCostValue)}</p>
                   </Card>
                </div>
              </div>
            )}
            
            {activeTab === 'ledger' && (
               <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                     <div>
                        <h2 className="font-display font-bold text-2xl sm:text-3xl text-typo-surface">Money In/Out</h2>
                        <p className="text-typo-muted text-sm">Daily financial records.</p>
                     </div>
                     <div className="flex gap-2 w-full sm:w-auto">
                        <Button onClick={handleExportCSV} variant="ghost" className="flex-1 sm:flex-none"><FileSpreadsheet size={16}/> Export Excel</Button>
                        <Button onClick={() => openAddTxModal('expense')} variant="danger" className="flex-1 sm:flex-none"><Minus size={16}/> Out</Button>
                        <Button onClick={() => openAddTxModal('income')} variant="success" className="flex-1 sm:flex-none"><Plus size={16}/> In</Button>
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                          <span className="text-[10px] text-typo-muted uppercase font-bold tracking-widest">Net Cash</span>
                          <p className={`text-lg font-bold ${financials.balance >= 0 ? 'text-typo-surface' : 'text-red-400'}`}>{formatMMK(financials.balance)}</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                          <span className="text-[10px] text-typo-muted uppercase font-bold tracking-widest">Inflow</span>
                          <p className="text-lg font-bold text-green-400">+{formatMMK(financials.totalIncome)}</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                          <span className="text-[10px] text-typo-muted uppercase font-bold tracking-widest">Outflow</span>
                          <p className="text-lg font-bold text-red-400">-{formatMMK(financials.totalExpense)}</p>
                      </div>
                  </div>
                  
                  <Card className="!p-0 overflow-hidden">
                     <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left text-sm min-w-[600px]">
                           <thead className="bg-black/20 text-typo-muted font-display text-xs uppercase tracking-wider backdrop-blur-sm">
                              <tr>
                                 <th className="p-4">Date</th>
                                 <th className="p-4">Description</th>
                                 <th className="p-4 text-right">Amount</th>
                                 <th className="p-4 text-center">Action</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-white/5">
                              {transactions.filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase())).map(tx => (
                                 <tr key={tx.id} onClick={() => openEditTxModal(tx)} className="hover:bg-white/5 cursor-pointer transition-colors group">
                                    <td className="p-4 text-typo-muted font-mono text-xs">{new Date(tx.date).toLocaleDateString()}</td>
                                    <td className="p-4">
                                       <p className="font-medium text-typo-surface group-hover:text-typo-accent transition-colors">{tx.description}</p>
                                       <span className="text-[10px] bg-white/5 text-typo-muted px-2 py-0.5 rounded-full border border-white/5">{tx.category}</span>
                                    </td>
                                    <td className={`p-4 text-right font-bold ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                       {tx.type === 'income' ? '+' : '-'} {formatMMK(tx.amount)}
                                    </td>
                                    <td className="p-4 text-center">
                                       <button onClick={(e) => { e.stopPropagation(); handleDeleteTransaction(tx.id); }} className="p-2 text-typo-muted hover:text-red-400 transition-colors hover:bg-red-500/10 rounded-lg">
                                          <Trash2 size={14} />
                                       </button>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </Card>
               </div>
            )}

            {activeTab === 'inventory' && (
               <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                     <h2 className="font-display font-bold text-2xl sm:text-3xl text-typo-surface">Stock Room</h2>
                     <div className="bg-white/5 p-1 rounded-xl flex gap-1 border border-white/5 overflow-x-auto max-w-full no-scrollbar items-center">
                         <button onClick={handleExportInventoryCSV} className="px-3 py-1.5 text-xs text-typo-teal bg-typo-accent rounded-lg font-bold mr-2 whitespace-nowrap hover:bg-white flex items-center gap-2 shadow-sm">
                             <FileSpreadsheet size={12}/> Excel
                         </button>
                         {['All', ...INVENTORY_CATEGORIES].map(cat => (
                             <button 
                                key={cat} 
                                onClick={() => setInvFilter(cat as InventoryCategory | 'All')}
                                className={`px-3 py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all whitespace-nowrap ${invFilter === cat ? 'bg-typo-teal text-white shadow' : 'text-typo-muted hover:text-white'}`}
                             >
                                 {cat}
                             </button>
                         ))}
                     </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                     {inventory
                        .filter(i => (invFilter === 'All' || i.category === invFilter))
                        .filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map(item => {
                         const margin = item.unitPrice && item.unitCost ? ((item.unitPrice - item.unitCost) / item.unitPrice * 100).toFixed(0) : 0;
                         return (
                        <div key={item.id} className="bg-typo-light/60 backdrop-blur-md p-5 rounded-2xl border border-white/5 hover:border-typo-teal/50 hover:bg-typo-light/80 transition-all duration-300 group relative flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20">
                           <div className="flex justify-between items-start mb-3">
                              <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-xl bg-typo-teal/20 text-typo-accent flex items-center justify-center shrink-0 border border-white/5">
                                    <Shirt size={20} />
                                </div>
                                <div className="overflow-hidden">
                                    <h4 className="font-bold text-typo-surface leading-tight mb-1 truncate">{item.name}</h4>
                                    <div className="flex gap-1 text-[9px] uppercase font-bold">
                                        {item.size && <span className="bg-white/10 text-typo-muted px-1.5 py-0.5 rounded border border-white/5">{item.size}</span>}
                                        {item.color && <span className="bg-white/10 text-typo-muted px-1.5 py-0.5 rounded truncate max-w-[60px] border border-white/5">{item.color}</span>}
                                    </div>
                                </div>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button onClick={() => openEditInventoryModal(item)} className="p-1.5 text-typo-muted hover:text-typo-accent hover:bg-white/10 rounded-lg transition-colors">
                                    <Edit2 size={14} />
                                </button>
                                <button onClick={() => handleDeleteInventory(item.id)} className="p-1.5 text-typo-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                                    <Trash2 size={14} />
                                </button>
                              </div>
                           </div>

                           <div className="grid grid-cols-2 gap-2 mb-4 bg-black/20 p-3 rounded-xl border border-white/5">
                                <div>
                                    <span className="block text-[9px] text-typo-muted uppercase font-bold">Cost</span>
                                    <span className="text-typo-surface font-mono text-xs">{formatMMK(item.unitCost)}</span>
                                </div>
                                <div>
                                    <span className="block text-[9px] text-typo-muted uppercase font-bold">Price</span>
                                    <span className="text-typo-accent font-bold font-mono text-xs">{item.unitPrice ? formatMMK(item.unitPrice) : '-'}</span>
                                </div>
                           </div>

                           <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
                              <div className="flex items-center gap-1 bg-black/20 rounded-lg p-1">
                                  <button onClick={() => handleAdjustStock(item.id, -1)} className="w-6 h-6 rounded-md hover:bg-white/10 flex items-center justify-center text-typo-muted hover:text-white transition-colors"><Minus size={12} /></button>
                                  <span className={`font-bold min-w-[2.5ch] text-center text-xs ${item.quantity <= item.reorderLevel ? 'text-red-400' : 'text-typo-surface'}`}>{item.quantity}</span>
                                  <button onClick={() => handleAdjustStock(item.id, 1)} className="w-6 h-6 rounded-md hover:bg-white/10 flex items-center justify-center text-typo-muted hover:text-white transition-colors"><Plus size={12} /></button>
                              </div>
                              <Button onClick={() => openQuickSell(item)} variant="success" className="!py-1.5 !px-3 !text-[10px] !rounded-lg !shadow-none">
                                  Sell
                              </Button>
                           </div>
                           
                           {item.quantity <= item.reorderLevel && (
                               <div className="absolute top-2 right-2 text-red-500 animate-pulse" title="Low Stock">
                                   <AlertTriangle size={14} />
                               </div>
                           )}
                        </div>
                     )})}
                     
                     <button onClick={() => { setEditingInventoryId(null); setIsInventoryModalOpen(true); }} className="border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-typo-muted hover:text-typo-accent hover:border-typo-teal/50 hover:bg-white/5 transition-all duration-300 min-h-[180px] group">
                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform group-hover:bg-typo-teal group-hover:text-white">
                           <Plus size={24} />
                        </div>
                        <span className="font-bold text-sm">Add Item</span>
                     </button>
                  </div>
               </div>
            )}

            {activeTab === 'consultant' && (
              <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-typo-surface">AI Consultant</h2>
                <Card className="relative overflow-hidden border-typo-teal/30">
                   <div className="absolute top-0 right-0 w-48 h-48 bg-typo-accent/10 rounded-full blur-3xl -mr-10 -mt-10" />
                   <div className="flex flex-col sm:flex-row gap-6 items-start">
                      <div className="w-16 h-16 bg-typo-teal rounded-full flex items-center justify-center shrink-0 border-4 border-typo-dark shadow-xl">
                         <BrainCircuit className="w-8 h-8 text-white" />
                      </div>
                      <div className="space-y-4">
                         <h3 className="font-bold text-typo-surface text-lg">Financial Health Check</h3>
                         <p className="text-typo-muted text-sm leading-relaxed max-w-2xl">
                            Based on your current inflow of <strong>{formatMMK(financials.totalIncome)}</strong> and inventory cost of <strong>{formatMMK(inventoryStats.totalCostValue)}</strong>, your stock turnover appears steady.
                         </p>
                         <div className="flex flex-wrap gap-2">
                            <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-[10px] font-bold border border-green-500/20">HEALTHY MARGINS</span>
                            <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-[10px] font-bold border border-blue-500/20">STABLE FLOW</span>
                         </div>
                      </div>
                   </div>
                </Card>
              </div>
            )}
            
            {activeTab === 'settings' && (
               <div className="space-y-6 animate-in fade-in duration-300 max-w-xl">
                  <h2 className="font-display font-bold text-2xl sm:text-3xl text-typo-surface">Settings</h2>
                  
                  {/* Theme Picker */}
                  <Card>
                      <h3 className="font-bold text-typo-surface mb-4 text-sm flex items-center gap-2">
                          <Palette size={16} className="text-typo-teal" /> Theme Appearance
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {THEMES.map(theme => (
                              <button 
                                key={theme.id}
                                onClick={() => setCurrentThemeId(theme.id)}
                                className={`relative h-20 rounded-xl overflow-hidden border-2 transition-all ${currentThemeId === theme.id ? 'border-typo-accent scale-105 shadow-lg' : 'border-transparent hover:scale-105'}`}
                                style={{ background: theme.gradient }}
                              >
                                  <div className="absolute inset-0 bg-black/20 hover:bg-transparent transition-colors" />
                                  <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm">{theme.name.split(' ')[0]}</span>
                                  {currentThemeId === theme.id && (
                                      <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center text-typo-teal shadow-md">
                                          <Check size={12} strokeWidth={4} />
                                      </div>
                                  )}
                              </button>
                          ))}
                      </div>
                  </Card>

                  <Card>
                     <h3 className="font-bold text-typo-surface mb-4 text-sm">Data Portability</h3>
                     <div className="space-y-3">
                        <Button onClick={() => {
                           const data = JSON.stringify({ transactions, inventory, profile: businessProfile });
                           const blob = new Blob([data], { type: 'application/json' });
                           const url = URL.createObjectURL(blob);
                           const link = document.createElement('a'); link.href = url; link.download = 'typo_backup.json'; link.click();
                        }} variant="secondary" className="w-full justify-start"><Download size={16}/> Export JSON</Button>
                        
                        <div className="relative">
                            <input type="file" ref={fileInputRef} onChange={handleImportBackup} className="hidden" accept=".json" />
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
            <input type="number" autoFocus value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (MMK)" className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-2xl font-bold text-white focus:border-typo-teal focus:bg-black/40 outline-none transition-all" />
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this for?" className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-typo-teal focus:bg-black/40 outline-none transition-all" />
            <div className="grid grid-cols-2 gap-2">
               {CATEGORIES[newTxType].map(cat => (
                  <button key={cat} onClick={() => setCategory(cat)} className={`p-2 rounded-lg text-xs font-bold transition-all ${category === cat ? 'bg-typo-teal text-white shadow-lg' : 'bg-white/5 text-typo-muted hover:bg-white/10'}`}>{cat}</button>
               ))}
            </div>
            <Button onClick={handleSaveTransaction} className="w-full py-4 shadow-xl">Confirm Entry</Button>
         </div>
      </Modal>

      {/* Inventory Modal */}
      <Modal isOpen={isInventoryModalOpen} onClose={() => setIsInventoryModalOpen(false)} title={editingInventoryId ? "Edit Product" : "New Stock Item"}>
         <div className="space-y-4">
            <input type="text" autoFocus value={invName} onChange={(e) => setInvName(e.target.value)} placeholder="Product Name" className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-typo-teal transition-colors" />
            <div className="grid grid-cols-2 gap-4">
               <input type="text" value={invSize} onChange={(e) => setInvSize(e.target.value)} placeholder="Size" className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-typo-teal transition-colors" />
               <input type="text" value={invColor} onChange={(e) => setInvColor(e.target.value)} placeholder="Color" className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-typo-teal transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <input type="number" value={invCost} onChange={(e) => setInvCost(e.target.value)} placeholder="Cost/Unit" className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white outline-none font-mono focus:border-typo-teal transition-colors" />
               <input type="number" value={invPrice} onChange={(e) => setInvPrice(e.target.value)} placeholder="Sale/Unit" className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white outline-none font-mono focus:border-typo-teal transition-colors" />
            </div>
            <input type="number" value={invQuantity} onChange={(e) => setInvQuantity(e.target.value)} placeholder="Quantity" className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-typo-teal transition-colors" />
            <div className="flex flex-wrap gap-2">
               {INVENTORY_CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setInvCategory(cat)} className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${invCategory === cat ? 'bg-typo-teal text-white shadow' : 'bg-white/5 text-typo-muted hover:bg-white/10'}`}>{cat}</button>
               ))}
            </div>
            <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
               <input type="checkbox" checked={logAsExpense} onChange={(e) => setLogAsExpense(e.target.checked)} className="rounded text-typo-teal focus:ring-0 bg-black/20 border-white/10" />
               <span className="text-xs text-typo-muted">Log total cost as expense?</span>
            </label>
            <Button onClick={handleAddInventory} className="w-full py-4">{editingInventoryId ? "Update Product" : "Save to Stock"}</Button>
         </div>
      </Modal>

      {/* Quick Sell Modal */}
      <Modal isOpen={isQuickSellOpen} onClose={() => setIsQuickSellOpen(false)} title="Register Sale">
         <div className="space-y-6">
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                 <Shirt size={32} className="text-typo-accent" />
                 <div>
                     <h4 className="font-bold text-typo-surface">{selectedItemForSale?.name}</h4>
                     <p className="text-xs text-typo-muted">{selectedItemForSale?.size} • {selectedItemForSale?.color}</p>
                 </div>
            </div>
            <div className="flex items-center gap-4">
                 <input type="number" value={saleQuantity} onChange={(e) => setSaleQuantity(e.target.value)} className="flex-1 bg-black/20 border border-white/10 rounded-xl p-4 text-2xl font-bold text-white text-center focus:border-typo-teal outline-none transition-colors" autoFocus />
                 <div className="text-right shrink-0">
                     <span className="block text-[10px] text-typo-muted uppercase font-bold">Total Sales</span>
                     <span className="block text-typo-accent font-bold text-xl">
                        {formatMMK((parseInt(saleQuantity) || 0) * (selectedItemForSale?.unitPrice || 0))}
                     </span>
                 </div>
            </div>
            <Button onClick={executeQuickSell} variant="success" className="w-full py-4 text-lg shadow-xl shadow-green-900/20">Confirm Cash-In</Button>
         </div>
      </Modal>

      {/* Profile Modal */}
      <Modal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} title="User Settings">
         <div className="space-y-4">
            <div>
               <label className="block text-[10px] text-typo-muted uppercase font-bold mb-1">Display Name</label>
               <input type="text" value={profOwner} onChange={(e) => setProfOwner(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-typo-teal transition-colors" />
            </div>
            <Button onClick={() => { setBusinessProfile({ ...businessProfile, owner: profOwner }); setShowProfileModal(false); }} className="w-full">Update Info</Button>
         </div>
      </Modal>

    </div>
  );
}