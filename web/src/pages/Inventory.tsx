import { useEffect, useState } from 'react';
import { ArrowRightLeft, History, Search, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import StockAdjustmentModal from '../components/StockAdjustmentModal';
import InventoryHistoryModal from '../components/InventoryHistoryModal';

export default function Inventory() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('stock', { ascending: true }); // Low stock first
    
    if (error) {
      toast.error('Error fetching inventory');
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAdjustment = (product: any) => {
    setSelectedProduct(product);
    setIsAdjustmentModalOpen(true);
  };

  const openHistory = (product: any) => {
    setSelectedProduct(product);
    setIsHistoryModalOpen(true);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockCount = products.filter(p => p.stock <= p.min_stock).length;
  const totalStockValue = products.reduce((acc, p) => acc + (p.stock * p.cost), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500">Track stock levels and adjustments</p>
        </div>
        
        {/* Stats Cards */}
        <div className="flex gap-4">
          <div className="bg-white p-3 rounded-lg border shadow-sm flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Low Stock</p>
              <p className="text-lg font-bold text-gray-900">{lowStockCount}</p>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border shadow-sm flex items-center gap-3">
             <div className="p-2 bg-blue-100 rounded-full">
              <ArrowRightLeft className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Value</p>
              <p className="text-lg font-bold text-gray-900">₹{totalStockValue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center rounded-md border bg-white px-3 py-2 shadow-sm">
        <Search className="mr-2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search inventory..."
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
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Product</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Stock Level</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Value (Cost)</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      {product.size && <div className="text-xs text-gray-500">Size: {product.size}</div>}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className={`text-sm font-bold ${product.stock <= product.min_stock ? 'text-red-600' : 'text-gray-900'}`}>
                        {product.stock}
                      </div>
                      {product.stock <= product.min_stock && (
                        <div className="text-xs text-red-500">Low Stock (Min: {product.min_stock})</div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
                      ₹{(product.stock * product.cost).toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => openAdjustment(product)}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                        >
                          <ArrowRightLeft className="h-4 w-4" />
                          <span className="hidden sm:inline">Adjust</span>
                        </button>
                        <button
                          onClick={() => openHistory(product)}
                          className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
                        >
                          <History className="h-4 w-4" />
                          <span className="hidden sm:inline">History</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <StockAdjustmentModal
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        onSuccess={fetchProducts}
        product={selectedProduct}
      />

      <InventoryHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        product={selectedProduct}
      />
    </div>
  );
}
