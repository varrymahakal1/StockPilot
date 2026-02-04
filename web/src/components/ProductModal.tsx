import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  size: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be positive'),
  cost: z.coerce.number().min(0, 'Cost must be positive'),
  stock: z.coerce.number().int().min(0, 'Stock must be positive'),
  min_stock: z.coerce.number().int().min(0, 'Min stock must be positive'),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productToEdit?: any;
}

export default function ProductModal({ isOpen, onClose, onSuccess, productToEdit }: ProductModalProps) {
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      price: 0,
      cost: 0,
      stock: 0,
      min_stock: 5
    }
  });

  useEffect(() => {
    if (productToEdit) {
      setValue('name', productToEdit.name);
      setValue('size', productToEdit.size || '');
      setValue('price', productToEdit.price);
      setValue('cost', productToEdit.cost);
      setValue('stock', productToEdit.stock);
      setValue('min_stock', productToEdit.min_stock);
    } else {
      reset({
        name: '',
        size: '',
        price: 0,
        cost: 0,
        stock: 0,
        min_stock: 5
      });
    }
  }, [productToEdit, setValue, reset, isOpen]);

  const onSubmit = async (data: ProductFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Fetch Org ID
      const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();

      if (productToEdit) {
        const { error } = await supabase
          .from('products')
          .update({ ...data })
          .eq('id', productToEdit.id);
        if (error) throw error;
        toast.success('Product updated');
      } else {
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert([{ ...data, user_id: user.id, organization_id: profile?.organization_id }])
          .select()
          .single();
        
        if (error) throw error;

        // Record Expense for Initial Stock
        if (data.stock > 0 && data.cost > 0) {
           await supabase.from('financial_transactions').insert([{
              user_id: user.id,
              organization_id: profile?.organization_id,
              type: 'EXPENSE',
              amount: data.stock * data.cost,
              description: `Initial Inventory: ${data.name}`
           }]);
           
           // Record in Ledger
           await supabase.from('inventory_ledger').insert([{
             user_id: user.id,
             organization_id: profile?.organization_id,
             product_id: newProduct.id,
             transaction_type: 'ADDITION',
             quantity_change: data.stock,
             stock_after: data.stock
           }]);
        }

        toast.success('Product created');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl ring-1 ring-gray-200">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {productToEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Product Name</label>
            <input
              {...register('name')}
              className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g. Cotton T-Shirt"
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Size / Variant</label>
              <input
                {...register('size')}
                className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="e.g. L"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Stock Quantity</label>
              <input
                type="number"
                {...register('stock')}
                className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              {errors.stock && <p className="text-xs text-red-500">{errors.stock.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Selling Price (₹)</label>
              <input
                type="number"
                step="0.01"
                {...register('price')}
                className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Cost Price (₹)</label>
              <input
                type="number"
                step="0.01"
                {...register('cost')}
                className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              {errors.cost && <p className="text-xs text-red-500">{errors.cost.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Low Stock Alert Level</label>
            <input
              type="number"
              {...register('min_stock')}
              className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
             {errors.min_stock && <p className="text-xs text-red-500">{errors.min_stock.message}</p>}
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
