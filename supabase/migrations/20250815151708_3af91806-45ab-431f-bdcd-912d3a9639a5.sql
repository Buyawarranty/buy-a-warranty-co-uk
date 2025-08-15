-- Remove the payment_type check constraint that's blocking the update
ALTER TABLE customer_policies DROP CONSTRAINT IF EXISTS customer_policies_payment_type_check;

-- Update payment types to use month-based naming consistently
UPDATE customers SET payment_type = '12months' WHERE payment_type = 'monthly';
UPDATE customers SET payment_type = '24months' WHERE payment_type = 'yearly';
UPDATE customers SET payment_type = '24months' WHERE payment_type = 'twoYear';
UPDATE customers SET payment_type = '36months' WHERE payment_type = 'threeYear';

UPDATE customer_policies SET payment_type = '12months' WHERE payment_type = 'monthly';
UPDATE customer_policies SET payment_type = '24months' WHERE payment_type = 'yearly';
UPDATE customer_policies SET payment_type = '24months' WHERE payment_type = 'twoYear';
UPDATE customer_policies SET payment_type = '36months' WHERE payment_type = 'threeYear';