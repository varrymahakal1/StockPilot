import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, ArrowRightLeft, TrendingUp, Bot, LogOut, Menu, X, Users } from 'lucide-react';
import { supabase } from './lib/supabase';
import { Toaster } from 'sonner';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Transactions from './pages/Transactions';
import AIAnalyst from './pages/AIAnalyst';
import Team from './pages/Team';

function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'owner' | 'employee'>('employee');
  const [userName, setUserName] = useState('');
  const [orgName, setOrgName] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRole = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('role, full_name, organizations(name)')
      .eq('id', userId)
      .single();
      
    if (data) {
      setRole(data.role as 'owner' | 'employee');
      setUserName(data.full_name || '');
      // @ts-ignore
      setOrgName(data.organizations?.name || 'StockPilot');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-gray-500">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/products', label: 'Products', icon: Package },
    { path: '/inventory', label: 'Inventory', icon: ArrowRightLeft },
    { path: '/sales', label: 'Sales', icon: ShoppingCart },
    { path: '/transactions', label: 'Finance', icon: TrendingUp },
    { path: '/ai-analyst', label: 'AI Analyst', icon: Bot },
  ];

  if (role === 'owner') {
    navItems.push({ path: '/team', label: 'Team', icon: Users });
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white border-b z-20 px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">{orgName || 'StockPilot'}</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar (Desktop) & Mobile Menu */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-10 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 flex flex-col
      `}>
        <div className="p-6 border-b hidden md:block">
          <h1 className="text-2xl font-bold text-blue-600 truncate">{orgName || 'StockPilot'}</h1>
          {role === 'owner' && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full mt-2 inline-block">Owner</span>}
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-14 md:mt-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="mb-4 px-4">
             <p className="text-sm font-bold text-gray-900 truncate">{userName || 'User'}</p>
             <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full pt-16 md:pt-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/products" element={<Layout><Products /></Layout>} />
        <Route path="/inventory" element={<Layout><Inventory /></Layout>} />
        <Route path="/sales" element={<Layout><Sales /></Layout>} />
        <Route path="/transactions" element={<Layout><Transactions /></Layout>} />
        <Route path="/ai-analyst" element={<Layout><AIAnalyst /></Layout>} />
        <Route path="/team" element={<Layout><Team /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}
