-- Update 24-month and 36-month pricing for PHEV
UPDATE special_vehicle_plans 
SET 
  pricing_matrix = jsonb_build_object(
    '12', jsonb_build_object(
      '0', jsonb_build_object('price', 34, 'excess', 'No Contribution'),
      '50', jsonb_build_object('price', 31, 'excess', '£50'),
      '100', jsonb_build_object('price', 27, 'excess', '£100'),
      '150', jsonb_build_object('price', 27, 'excess', '£150')
    ),
    '24', jsonb_build_object(
      '0', jsonb_build_object('price', 61, 'excess', 'No Contribution'),
      '50', jsonb_build_object('price', 56, 'excess', '£50'),
      '100', jsonb_build_object('price', 49, 'excess', '£100'),
      '150', jsonb_build_object('price', 47, 'excess', '£150')
    ),
    '36', jsonb_build_object(
      '0', jsonb_build_object('price', 90, 'excess', 'No Contribution'),
      '50', jsonb_build_object('price', 82, 'excess', '£50'),
      '100', jsonb_build_object('price', 71, 'excess', '£100'),
      '150', jsonb_build_object('price', 69, 'excess', '£150')
    )
  )
WHERE vehicle_type = 'PHEV';

-- Update 24-month and 36-month pricing for EV
UPDATE special_vehicle_plans 
SET 
  pricing_matrix = jsonb_build_object(
    '12', jsonb_build_object(
      '0', jsonb_build_object('price', 34, 'excess', 'No Contribution'),
      '50', jsonb_build_object('price', 31, 'excess', '£50'),
      '100', jsonb_build_object('price', 27, 'excess', '£100'),
      '150', jsonb_build_object('price', 27, 'excess', '£150')
    ),
    '24', jsonb_build_object(
      '0', jsonb_build_object('price', 61, 'excess', 'No Contribution'),
      '50', jsonb_build_object('price', 56, 'excess', '£50'),
      '100', jsonb_build_object('price', 49, 'excess', '£100'),
      '150', jsonb_build_object('price', 47, 'excess', '£150')
    ),
    '36', jsonb_build_object(
      '0', jsonb_build_object('price', 90, 'excess', 'No Contribution'),
      '50', jsonb_build_object('price', 82, 'excess', '£50'),
      '100', jsonb_build_object('price', 71, 'excess', '£100'),
      '150', jsonb_build_object('price', 69, 'excess', '£150')
    )
  )
WHERE vehicle_type = 'EV';