import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

interface InventoryHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
}

export default function InventoryHistoryModal({ isOpen, onClose, product }: InventoryHistoryModalProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && product) {
      const fetchHistory = async () => {
        setLoading(true);
        const { data } = await supabase
          .from('inventory_ledger')
          .select('*')
          .eq('product_id', product.id)
          .order('created_at', { ascending: false });
        setHistory(data || []);
        setLoading(false);
      };
      fetchHistory();
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl ring-1 ring-gray-200 flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Stock History: {product.name}
          </h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <p className="text-center text-gray-500">Loading history...</p>
          ) : history.length === 0 ? (
            <p className="text-center text-gray-500">No stock history found.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Change</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Stock After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {history.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {format(new Date(entry.created_at), 'PP p')}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        entry.transaction_type === 'ADDITION' ? 'bg-green-100 text-green-800' :
                        entry.transaction_type === 'SALE' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {entry.transaction_type}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-sm font-medium">
                      <span className={entry.quantity_change > 0 ? 'text-green-600' : 'text-red-600'}>
                        {entry.quantity_change > 0 ? '+' : ''}{entry.quantity_change}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-sm text-gray-900">
                      {entry.stock_after}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
