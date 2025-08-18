-- Update 24-month pricing for Basic plans
UPDATE plans 
SET 
  pricing_matrix = pricing_matrix || jsonb_build_object(
    '24', jsonb_build_object(
      '0', jsonb_build_object('price', 56, 'excess', 'No Contribution'),
      '50', jsonb_build_object('price', 52, 'excess', '£50'),
      '100', jsonb_build_object('price', 45, 'excess', '£100'),
      '150', jsonb_build_object('price', 41, 'excess', '£150')
    )
  )
WHERE name = 'Basic' AND is_active = true;

-- Update 24-month pricing for Gold plans
UPDATE plans 
SET 
  pricing_matrix = pricing_matrix || jsonb_build_object(
    '24', jsonb_build_object(
      '0', jsonb_build_object('price', 61, 'excess', 'No Contribution'),
      '50', jsonb_build_object('price', 56, 'excess', '£50'),
      '100', jsonb_build_object('price', 49, 'excess', '£100'),
      '150', jsonb_build_object('price', 47, 'excess', '£150')
    )
  )
WHERE name = 'Gold' AND is_active = true;

-- Update 24-month pricing for Platinum plans
UPDATE plans 
SET 
  pricing_matrix = pricing_matrix || jsonb_build_object(
    '24', jsonb_build_object(
      '0', jsonb_build_object('price', 65, 'excess', 'No Contribution'),
      '50', jsonb_build_object('price', 59, 'excess', '£50'),
      '100', jsonb_build_object('price', 52, 'excess', '£100'),
      '150', jsonb_build_object('price', 49, 'excess', '£150')
    )
  )
WHERE name = 'Platinum' AND is_active = true;

-- Update 24-month pricing for PHEV
UPDATE special_vehicle_plans 
SET 
  pricing_matrix = pricing_matrix || jsonb_build_object(
    '24', jsonb_build_object(
      '0', jsonb_build_object('price', 61, 'excess', 'No Contribution'),
      '50', jsonb_build_object('price', 56, 'excess', '£50'),
      '100', jsonb_build_object('price', 49, 'excess', '£100'),
      '150', jsonb_build_object('price', 47, 'excess', '£150')
    )
  )
WHERE vehicle_type = 'PHEV' AND is_active = true;

-- Update 24-month pricing for EV
UPDATE special_vehicle_plans 
SET 
  pricing_matrix = pricing_matrix || jsonb_build_object(
    '24', jsonb_build_object(
      '0', jsonb_build_object('price', 61, 'excess', 'No Contribution'),
      '50', jsonb_build_object('price', 56, 'excess', '£50'),
      '100', jsonb_build_object('price', 49, 'excess', '£100'),
      '150', jsonb_build_object('price', 47, 'excess', '£150')
    )
  )
WHERE vehicle_type = 'EV' AND is_active = true;

-- Update 24-month pricing for MOTORBIKE
UPDATE special_vehicle_plans 
SET 
  pricing_matrix = pricing_matrix || jsonb_build_object(
    '24', jsonb_build_object(
      '0', jsonb_build_object('price', 61, 'excess', 'No Contribution'),
      '50', jsonb_build_object('price', 56, 'excess', '£50'),
      '100', jsonb_build_object('price', 49, 'excess', '£100'),
      '150', jsonb_build_object('price', 47, 'excess', '£150')
    )
  )
WHERE vehicle_type = 'MOTORBIKE' AND is_active = true;