import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import ProductModal from '../components/ProductModal';

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Delete confirmation state
  const [productToDelete, setProductToDelete] = useState<any>(null);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error('Error fetching products');
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const initiateDelete = (product: any) => {
    setProductToDelete(product);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    const { error } = await supabase.from('products').delete().eq('id', productToDelete.id);
    if (error) {
      toast.error('Error deleting product');
    } else {
      toast.success('Product deleted');
      fetchProducts();
    }
    setProductToDelete(null);
  };

  const handleEdit = (product: any) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500">Manage your product inventory</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center space-x-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </button>
      </div>

      <div className="flex items-center rounded-md border bg-white px-3 py-2 shadow-sm">
        <Search className="mr-2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search products..."
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
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Size</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Stock</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                    No products found. Click "Add Product" to create one.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{product.size || '-'}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
                      <span className={product.stock <= product.min_stock ? 'font-bold text-red-600' : ''}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
                      ₹{product.price.toFixed(2)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => initiateDelete(product)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
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

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProducts}
        productToEdit={productToEdit}
      />

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl ring-1 ring-gray-200">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:h-10 sm:w-10">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Delete Product</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete <b>{productToDelete.name}</b>? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 sm:text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-md bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 sm:text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
