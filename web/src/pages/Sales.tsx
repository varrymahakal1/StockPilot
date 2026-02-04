import { useEffect, useState } from 'react';
import { Plus, Search, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import NewSaleModal from '../components/NewSaleModal';
import { format } from 'date-fns';

export default function Sales() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);

  const fetchSales = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sales')
      .select('*, sale_items(*)')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error('Error fetching sales');
    } else {
      setSales(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const filteredSales = sales.filter(sale => 
    (sale.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
          <p className="text-sm text-gray-500">Track and manage sales orders</p>
        </div>
        <button
          onClick={() => setIsNewSaleModalOpen(true)}
          className="flex items-center space-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          <span>New Sale</span>
        </button>
      </div>

      <div className="flex items-center rounded-md border bg-white px-3 py-2 shadow-sm">
        <Search className="mr-2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search sales by ID or customer..."
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
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Sale ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Items</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Total</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    No sales found. Click "New Sale" to create one.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-indigo-600">
                      #{sale.id.slice(0, 8)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {sale.customer_name || 'Guest'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {format(new Date(sale.created_at), 'PP p')}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
                      {sale.sale_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-bold text-gray-900">
                      ₹{sale.total_amount.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <button className="text-gray-400 hover:text-gray-600">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <NewSaleModal
        isOpen={isNewSaleModalOpen}
        onClose={() => setIsNewSaleModalOpen(false)}
        onSuccess={fetchSales}
      />
    </div>
  );
}
