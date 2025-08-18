-- Update 36-month pricing for Basic plans
UPDATE plans 
SET 
  pricing_matrix = pricing_matrix || jsonb_build_object(
    '36', jsonb_build_object(
      '0', jsonb_build_object('price', 82, 'excess', 'No Contribution'),
      '50', jsonb_build_object('price', 77, 'excess', '£50'),
      '100', jsonb_build_object('price', 66, 'excess', '£100'),
      '150', jsonb_build_object('price', 61, 'excess', '£150')
    )
  )
WHERE name = 'Basic' AND is_active = true;

-- Update 36-month pricing for Gold plans
UPDATE plans 
SET 
  pricing_matrix = pricing_matrix || jsonb_build_object(
    '36', jsonb_build_object(
      '0', jsonb_build_object('price', 90, 'excess', 'No Contribution'),
      '50', jsonb_build_object('price', 82, 'excess', '£50'),
      '100', jsonb_build_object('price', 71, 'excess', '£100'),
      '150', jsonb_build_object('price', 69, 'excess', '£150')
    )
  )
WHERE name = 'Gold' AND is_active = true;

-- Update 36-month pricing for Platinum plans
UPDATE plans 
SET 
  pricing_matrix = pricing_matrix || jsonb_build_object(
    '36', jsonb_build_object(
      '0', jsonb_build_object('price', 96, 'excess', 'No Contribution'),
      '50', jsonb_build_object('price', 87, 'excess', '£50'),
      '100', jsonb_build_object('price', 77, 'excess', '£100'),
      '150', jsonb_build_object('price', 71, 'excess', '£150')
    )
  )
WHERE name = 'Platinum' AND is_active = true;

-- Update 36-month pricing for PHEV
UPDATE special_vehicle_plans 
SET 
  pricing_matrix = pricing_matrix || jsonb_build_object(
    '36', jsonb_build_object(
      '0', jsonb_build_object('price', 90, 'excess', 'No Contribution'),
      '50', jsonb_build_object('price', 82, 'excess', '£50'),
      '100', jsonb_build_object('price', 71, 'excess', '£100'),
      '150', jsonb_build_object('price', 69, 'excess', '£150')
    )
  )
WHERE vehicle_type = 'PHEV' AND is_active = true;

-- Update 36-month pricing for EV
UPDATE special_vehicle_plans 
SET 
  pricing_matrix = pricing_matrix || jsonb_build_object(
    '36', jsonb_build_object(
      '0', jsonb_build_object('price', 90, 'excess', 'No Contribution'),
      '50', jsonb_build_object('price', 82, 'excess', '£50'),
      '100', jsonb_build_object('price', 71, 'excess', '£100'),
      '150', jsonb_build_object('price', 69, 'excess', '£150')
    )
  )
WHERE vehicle_type = 'EV' AND is_active = true;

-- Update 36-month pricing for MOTORBIKE
UPDATE special_vehicle_plans 
SET 
  pricing_matrix = pricing_matrix || jsonb_build_object(
    '36', jsonb_build_object(
      '0', jsonb_build_object('price', 90, 'excess', 'No Contribution'),
      '50', jsonb_build_object('price', 82, 'excess', '£50'),
      '100', jsonb_build_object('price', 71, 'excess', '£100'),
      '150', jsonb_build_object('price', 69, 'excess', '£150')
    )
  )
WHERE vehicle_type = 'MOTORBIKE' AND is_active = true;