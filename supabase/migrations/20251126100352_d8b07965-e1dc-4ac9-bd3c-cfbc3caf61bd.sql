
-- Insert default warranty plans for all vehicle types
INSERT INTO special_vehicle_plans (
  name,
  vehicle_type,
  coverage,
  monthly_price,
  yearly_price,
  two_yearly_price,
  three_yearly_price,
  is_active
) VALUES
-- Car Plans (Standard Vehicles)
('Platinum', 'car', 'Comprehensive coverage for all mechanical and electrical parts', 79.99, 799.00, 1499.00, 2199.00, true),
('Gold', 'car', 'Extensive coverage for major components', 59.99, 599.00, 1099.00, 1599.00, true),
('Silver', 'car', 'Essential coverage for key components', 39.99, 399.00, 699.00, 999.00, true),

-- Van Plans
('Platinum', 'van', 'Comprehensive coverage for all mechanical and electrical parts', 99.99, 999.00, 1899.00, 2799.00, true),
('Gold', 'van', 'Extensive coverage for major components', 79.99, 799.00, 1499.00, 2199.00, true),
('Silver', 'van', 'Essential coverage for key components', 59.99, 599.00, 1099.00, 1599.00, true),

-- Hybrid Vehicle Plans
('Platinum', 'hybrid', 'Comprehensive coverage including hybrid-specific components', 89.99, 899.00, 1699.00, 2499.00, true),
('Gold', 'hybrid', 'Extensive coverage for major components and hybrid systems', 69.99, 699.00, 1299.00, 1899.00, true),
('Silver', 'hybrid', 'Essential coverage for key components', 49.99, 499.00, 899.00, 1299.00, true),

-- Electric Vehicle Plans
('Platinum', 'electric', 'Comprehensive coverage including EV-specific components', 99.99, 999.00, 1899.00, 2799.00, true),
('Gold', 'electric', 'Extensive coverage for major EV components', 79.99, 799.00, 1499.00, 2199.00, true),
('Silver', 'electric', 'Essential coverage for key EV components', 59.99, 599.00, 1099.00, 1599.00, true),

-- Jaguar specific plans (luxury pricing)
('Platinum', 'jaguar', 'Comprehensive coverage for all Jaguar mechanical and electrical parts', 129.99, 1299.00, 2499.00, 3699.00, true),
('Gold', 'jaguar', 'Extensive coverage for major Jaguar components', 99.99, 999.00, 1899.00, 2799.00, true),
('Silver', 'jaguar', 'Essential coverage for key Jaguar components', 79.99, 799.00, 1499.00, 2199.00, true);
