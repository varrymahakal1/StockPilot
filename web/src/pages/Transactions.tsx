import { useEffect, useState } from 'react';
import { Plus, Search, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import AddTransactionModal from '../components/AddTransactionModal';
import { format } from 'date-fns';

export default function Transactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('employee');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error('Error fetching transactions');
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (data) setRole(data.role);
      }
      await fetchTransactions();
    };
    init();
  }, []);

  const filteredTransactions = transactions.filter(t => 
    (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Transactions</h1>
          <p className="text-sm text-gray-500">Track income and expenses</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Stats Cards - Only for Owner */}
      {role === 'owner' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Income</p>
                <p className="text-2xl font-semibold text-gray-900">₹{totalIncome.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm border">
            <div className="flex items-center">
              <div className="rounded-full bg-red-100 p-3">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                <p className="text-2xl font-semibold text-gray-900">₹{totalExpense.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm border">
            <div className="flex items-center">
              <div className={`rounded-full p-3 ${netProfit >= 0 ? 'bg-indigo-100' : 'bg-orange-100'}`}>
                <DollarSign className={`h-6 w-6 ${netProfit >= 0 ? 'text-indigo-600' : 'text-orange-600'}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Net Profit</p>
                <p className={`text-2xl font-semibold ${netProfit >= 0 ? 'text-indigo-600' : 'text-orange-600'}`}>
                  ₹{netProfit.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center rounded-md border bg-white px-3 py-2 shadow-sm">
        <Search className="mr-2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search transactions..."
          className="flex-1 border-none bg-transparent p-0 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {format(new Date(t.created_at), 'PP p')}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {t.description}
                      {t.related_sale_id && (
                        <span className="ml-2 text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          Sale
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        t.type === 'INCOME' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className={`whitespace-nowrap px-6 py-4 text-right text-sm font-bold ${
                      t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {t.type === 'INCOME' ? '+' : '-'}₹{t.amount.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchTransactions}
      />
    </div>
  );
}
