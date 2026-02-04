INSERT INTO financial_transactions (user_id, type, amount, description, created_at)
SELECT
  user_id,
  'EXPENSE',
  (stock * cost),
  'Initial Inventory: ' || name,
  created_at
FROM products
WHERE stock > 0
AND NOT EXISTS (
  SELECT 1 FROM financial_transactions ft
  WHERE ft.description = 'Initial Inventory: ' || products.name
);
