import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Search, ShoppingCart, Minus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewSaleModal({ isOpen, onClose, onSuccess }: NewSaleModalProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      setCart([]);
      setCustomerName('');
      setDiscount(0);
      setSearchTerm('');
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').gt('stock', 0);
    setProducts(data || []);
  };

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.product_id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock) {
        toast.error('Not enough stock available');
        return;
      }
      setCart(cart.map(item => 
        item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { 
        product_id: product.id, 
        name: product.name, 
        price: product.price, 
        quantity: 1, 
        max_stock: product.stock 
      }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.product_id === productId) {
        const newQty = item.quantity + delta;
        if (newQty < 1) return item;
        if (newQty > item.max_stock) {
          toast.error(`Max stock available: ${item.max_stock}`);
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const finalAmount = Math.max(0, totalAmount - discount);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // 1. Create Sale
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert([{
          user_id: user.id,
          customer_name: customerName,
          total_amount: finalAmount,
          discount: discount
        }])
        .select()
        .single();

      if (saleError) throw saleError;

      // 2. Create Sale Items & Update Stock & Ledger
      for (const item of cart) {
        // Add Sale Item
        await supabase.from('sale_items').insert([{
          sale_id: sale.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price_at_sale: item.price
        }]);

        // Get current stock again to be safe
        const { data: currentProduct } = await supabase.from('products').select('stock').eq('id', item.product_id).single();
        const newStock = (currentProduct?.stock || 0) - item.quantity;
        
        await supabase.from('products').update({ stock: newStock }).eq('id', item.product_id);

        // Add to Ledger
        await supabase.from('inventory_ledger').insert([{
          user_id: user.id,
          product_id: item.product_id,
          transaction_type: 'SALE',
          quantity_change: -item.quantity,
          stock_after: newStock,
          related_sale_id: sale.id
        }]);
      }

      // 3. Add Financial Transaction
      await supabase.from('financial_transactions').insert([{
        user_id: user.id,
        type: 'INCOME',
        amount: finalAmount,
        description: `Sale #${sale.id.slice(0, 8)}`,
        related_sale_id: sale.id
      }]);

      toast.success('Sale completed successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-5xl h-[85vh] rounded-xl bg-white shadow-2xl ring-1 ring-gray-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4 bg-white">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" /> New Sale (POS)
          </h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Product Selection */}
          <div className="w-1/2 md:w-3/5 border-r flex flex-col bg-gray-50">
            <div className="p-4 border-b bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full rounded-md border border-gray-300 pl-9 p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-auto p-4 grid grid-cols-2 md:grid-cols-3 gap-3 content-start">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="flex flex-col items-start p-3 bg-white rounded-lg border hover:border-indigo-500 hover:shadow-md transition-all text-left"
                >
                  <span className="font-medium text-gray-900 line-clamp-1 w-full">{product.name}</span>
                  <span className="text-xs text-gray-500 mb-2">{product.size || '-'}</span>
                  <div className="mt-auto flex justify-between w-full items-center">
                    <span className="font-bold text-indigo-600">₹{product.price}</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                      Stock: {product.stock}
                    </span>
                  </div>
                </button>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center text-gray-500 py-8">
                  No products found.
                </div>
              )}
            </div>
          </div>

          {/* Right: Cart */}
          <div className="w-1/2 md:w-2/5 flex flex-col bg-white">
            <div className="p-4 border-b">
              <input
                type="text"
                placeholder="Customer Name (Optional)"
                className="w-full border-b border-gray-300 p-2 text-sm focus:border-indigo-500 focus:outline-none"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <ShoppingCart className="h-12 w-12 mb-2 opacity-20" />
                  <p>Cart is empty</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product_id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">₹{item.price} x {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-white rounded border">
                        <button onClick={() => updateQuantity(item.product_id, -1)} className="p-1 hover:bg-gray-100">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product_id, 1)} className="p-1 hover:bg-gray-100">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-sm font-bold w-16 text-right">₹{item.price * item.quantity}</p>
                      <button onClick={() => removeFromCart(item.product_id)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Discount (₹)</span>
                <input
                  type="number"
                  min="0"
                  className="w-20 text-right rounded border border-gray-300 p-1 text-sm"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>₹{finalAmount.toFixed(2)}</span>
              </div>
              
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0 || isSubmitting}
                className="w-full rounded-md bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isSubmitting ? 'Processing...' : `Checkout (₹${finalAmount.toFixed(2)})`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
