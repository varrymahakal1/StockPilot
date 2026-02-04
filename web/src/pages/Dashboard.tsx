import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  TrendingUp, Package, AlertTriangle, 
  IndianRupee, ShoppingCart, ArrowRight, Plus, Sparkles 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { Link } from 'react-router-dom';
import NewSaleModal from '../components/NewSaleModal';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'owner' | 'employee'>('employee');
  const [orgName, setOrgName] = useState('');
  const [stats, setStats] = useState({
    totalSales: 0,
    salesCount: 0,
    netProfit: 0,
    lowStockCount: 0,
    inventoryValue: 0
  });
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, organizations(name)')
          .eq('id', user.id)
          .single();
          
        if (profile) {
          setRole(profile.role as 'owner' | 'employee');
          // @ts-ignore
          if (profile.organizations?.name) setOrgName(profile.organizations.name);
        }
      }
      await fetchDashboardData();
      setLoading(false);
    };
    init();
  }, []);

  const fetchDashboardData = async () => {
    // 1. Fetch Sales (Last 30 days for chart, Total for stats)
    const { data: allSales } = await supabase
      .from('sales')
      .select('total_amount, created_at');
    
    // 2. Fetch Expenses
    const { data: expenses } = await supabase
      .from('financial_transactions')
      .select('amount')
      .eq('type', 'EXPENSE');

    // 3. Fetch Products
    const { data: products } = await supabase
      .from('products')
      .select('stock, min_stock, cost');

    // 4. Fetch Recent Sales with items
    const { data: recent } = await supabase
      .from('sales')
      .select('*, sale_items(*)')
      .order('created_at', { ascending: false })
      .limit(5);

    // Calculations
    const totalSales = allSales?.reduce((acc, s) => acc + s.total_amount, 0) || 0;
    const totalExpenses = expenses?.reduce((acc, e) => acc + e.amount, 0) || 0;
    const netProfit = totalSales - totalExpenses;
    
    const lowStockCount = products?.filter(p => p.stock <= p.min_stock).length || 0;
    const inventoryValue = products?.reduce((acc, p) => acc + (p.stock * p.cost), 0) || 0;

    // Prepare Chart Data (Last 7 days)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const daySales = allSales?.filter(s => {
        const sDate = new Date(s.created_at);
        return sDate >= dayStart && sDate <= dayEnd;
      });

      const dayTotal = daySales?.reduce((acc, s) => acc + s.total_amount, 0) || 0;
      
      chartData.push({
        name: format(date, 'EEE'), // Mon, Tue...
        sales: dayTotal
      });
    }

    setStats({
      totalSales,
      salesCount: allSales?.length || 0,
      netProfit,
      lowStockCount,
      inventoryValue
    });
    setRecentSales(recent || []);
    setSalesData(chartData);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          {orgName && <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{orgName}</h2>}
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        </div>
        <Link 
          to="/ai-analyst" 
          className="flex items-center gap-2 rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-medium text-white hover:from-indigo-600 hover:to-purple-700 shadow-md transition-all hover:shadow-lg"
        >
          <Sparkles className="h-4 w-4" />
          Ask AI Analyst
        </Link>
      </div>
      
      {/* KPI Cards - Only for Owner */}
      {role === 'owner' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalSales.toFixed(2)}</p>
              </div>
              <div className="rounded-full bg-indigo-50 p-3">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">{stats.salesCount} orders processed</span>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Net Profit</p>
                <p className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{stats.netProfit.toFixed(2)}
                </p>
              </div>
              <div className={`rounded-full p-3 ${stats.netProfit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <IndianRupee className={`h-6 w-6 ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Inventory Value</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.inventoryValue.toFixed(2)}</p>
              </div>
              <div className="rounded-full bg-blue-50 p-3">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Low Stock Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.lowStockCount}</p>
              </div>
              <div className="rounded-full bg-orange-50 p-3">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              {stats.lowStockCount > 0 ? (
                <Link to="/inventory" className="text-orange-600 hover:text-orange-700 font-medium">
                  View items →
                </Link>
              ) : (
                <span className="text-green-600">Stock levels healthy</span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sales Chart */}
        <div className="lg:col-span-2 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend (Last 7 Days)</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => [`₹${Number(value).toFixed(2)}`, 'Sales']}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#4f46e5" 
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Sales</h2>
            <Link to="/sales" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentSales.length === 0 ? (
              <p className="text-gray-500 text-sm">No sales yet.</p>
            ) : (
              recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-green-100 p-2">
                      <ShoppingCart className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {sale.customer_name || 'Guest Customer'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(sale.created_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-gray-900">₹{sale.total_amount.toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsNewSaleModalOpen(true)}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-white shadow-lg transition-transform hover:bg-indigo-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        title="New Sale"
      >
        <Plus className="h-6 w-6" />
        <span className="font-bold text-lg">New Sale</span>
      </button>

      <NewSaleModal
        isOpen={isNewSaleModalOpen}
        onClose={() => setIsNewSaleModalOpen(false)}
        onSuccess={() => {
          fetchDashboardData();
          setIsNewSaleModalOpen(false);
        }}
      />
    </div>
  );
}
