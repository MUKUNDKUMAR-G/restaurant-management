-- Add every dish to every branch in the menu table, skipping existing pairs
INSERT INTO menu (branch_id, dish_id, is_ship, is_serve)
SELECT b.branch_id, d.dish_id, 1, 1
FROM branches b
CROSS JOIN dishes d
WHERE NOT EXISTS (
  SELECT 1 FROM menu m WHERE m.branch_id = b.branch_id AND m.dish_id = d.dish_id
); 