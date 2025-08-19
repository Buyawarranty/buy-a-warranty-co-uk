-- Update Gold plan pricing to match Motorbike plan pricing exactly
UPDATE plans 
SET 
  monthly_price = 34,
  yearly_price = 408,
  three_yearly_price = 600.00,
  pricing_matrix = '{
    "monthly": {
      "0": 34,
      "50": 31,
      "100": 27,
      "150": 27
    },
    "yearly": {
      "0": 408,
      "50": 372,
      "100": 324,
      "150": 312
    },
    "24": {
      "0": {"price": 61, "excess": "No Contribution"},
      "50": {"price": 56, "excess": "£50"},
      "100": {"price": 49, "excess": "£100"},
      "150": {"price": 47, "excess": "£150"}
    },
    "36": {
      "0": {"price": 90, "excess": "No Contribution"},
      "50": {"price": 82, "excess": "£50"},
      "100": {"price": 71, "excess": "£100"},
      "150": {"price": 69, "excess": "£150"}
    }
  }'::jsonb,
  updated_at = now()
WHERE name = 'Gold';