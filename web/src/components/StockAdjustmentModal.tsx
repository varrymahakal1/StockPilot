import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

const adjustmentSchema = z.object({
  quantity: z.coerce.number().int().positive('Quantity must be positive'),
  type: z.enum(['ADDITION', 'ADJUSTMENT']),
  newCost: z.any().optional(), // Allow any input, handle parsing manually or let coerce handle it
});

type AdjustmentFormData = z.infer<typeof adjustmentSchema>;

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product: any;
}

export default function StockAdjustmentModal({ isOpen, onClose, onSuccess, product }: StockAdjustmentModalProps) {
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<AdjustmentFormData>({
    resolver: zodResolver(adjustmentSchema) as any,
    defaultValues: {
      type: 'ADDITION',
      quantity: 1,
      newCost: ''
    }
  });

  const type = watch('type');

  const onSubmit = async (data: AdjustmentFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Fetch Org ID
      const { data: profile } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single();

      // Calculate new stock
      const change = data.type === 'ADDITION' ? data.quantity : -data.quantity;
      const newStock = product.stock + change;

      if (newStock < 0) {
        throw new Error('Insufficient stock for this adjustment');
      }

      let newAvgCost = product.cost;

      // Calculate Weighted Average Cost if new stock is added with a specific cost
      if (data.type === 'ADDITION' && data.newCost && Number(data.newCost) > 0) {
        const inputCost = Number(data.newCost);
        const currentTotalValue = product.stock * product.cost;
        const newStockValue = data.quantity * inputCost;
        
        // Avoid division by zero if starting from 0 stock
        if (newStock > 0) {
          newAvgCost = (currentTotalValue + newStockValue) / newStock;
        } else {
          newAvgCost = inputCost;
        }
      }

      // 1. Update Product Stock and Cost
      const { error: productError } = await supabase
        .from('products')
        .update({ 
          stock: newStock,
          cost: newAvgCost
        })
        .eq('id', product.id);

      if (productError) throw productError;

      // 2. Add to Ledger
      const { error: ledgerError } = await supabase
        .from('inventory_ledger')
        .insert([{
          user_id: user.id,
          organization_id: profile?.organization_id,
          product_id: product.id,
          transaction_type: data.type,
          quantity_change: change,
          stock_after: newStock,
        }]);

      if (ledgerError) throw ledgerError;

      // 3. Record Expense for Restock
      if (data.type === 'ADDITION') {
        const costPerUnit = (data.newCost && Number(data.newCost) > 0) ? Number(data.newCost) : product.cost;
        const expenseAmount = data.quantity * costPerUnit;
        
        if (expenseAmount > 0) {
          await supabase.from('financial_transactions').insert([{
            user_id: user.id,
            organization_id: profile?.organization_id,
            type: 'EXPENSE',
            amount: expenseAmount,
            description: `Restock: ${product.name} (+${data.quantity})`
          }]);
        }
      }

      toast.success('Stock updated successfully');
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl ring-1 ring-gray-200">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Adjust Stock: {product.name}
          </h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Adjustment Type</label>
            <select
              {...register('type')}
              className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="ADDITION">Restock (Add Stock)</option>
              <option value="ADJUSTMENT">Reduction (Damage/Loss/Correction)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              {...register('quantity')}
              className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            {errors.quantity && <p className="text-xs text-red-500">{errors.quantity.message}</p>}
          </div>

          {type === 'ADDITION' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">New Unit Cost (₹)</label>
              <input
                type="number"
                step="0.01"
                {...register('newCost')}
                placeholder={`Current Avg: ₹${product.cost.toFixed(2)}`}
                className="w-full rounded-md border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500">
                Leave blank to use current average cost. Entering a value will recalculate the weighted average cost.
              </p>
            </div>
          )}

          <div className="bg-gray-50 p-3 rounded-md flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Current Stock: <span className="font-bold">{product.stock}</span></span>
              <span className="text-sm text-gray-600">
                New Stock: <span className={`font-bold ${type === 'ADJUSTMENT' ? 'text-red-600' : 'text-green-600'}`}>
                  {type === 'ADDITION' ? product.stock + (Number(watch('quantity')) || 0) : product.stock - (Number(watch('quantity')) || 0)}
                </span>
              </span>
            </div>
            {type === 'ADDITION' && watch('newCost') && Number(watch('newCost')) > 0 && (
               <div className="text-xs text-blue-600 mt-1">
                 Est. New Avg Cost: ₹{
                   ((product.stock * product.cost + (Number(watch('quantity')) || 0) * Number(watch('newCost'))) / 
                   (product.stock + (Number(watch('quantity')) || 0))).toFixed(2)
                 }
               </div>
            )}
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
              {isSubmitting ? 'Updating...' : 'Update Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
