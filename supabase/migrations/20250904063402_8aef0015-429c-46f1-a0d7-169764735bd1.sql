-- Update pricing matrix for warranty plans to match new structure
-- The new structure includes voluntary excess, claim limits, and duration-based pricing

-- Update Basic plan pricing matrix
UPDATE plans 
SET pricing_matrix = '{
  "pricing": {
    "0": {
      "750": {
        "1_year": 467,
        "2_years": 897,
        "3_years": 1347
      },
      "1250": {
        "1_year": 497,
        "2_years": 937,
        "3_years": 1397
      },
      "2000": {
        "1_year": 587,
        "2_years": 1027,
        "3_years": 1497
      }
    },
    "50": {
      "750": {
        "1_year": 437,
        "2_years": 827,
        "3_years": 1247
      },
      "1250": {
        "1_year": 457,
        "2_years": 877,
        "3_years": 1297
      },
      "2000": {
        "1_year": 547,
        "2_years": 957,
        "3_years": 1397
      }
    },
    "100": {
      "750": {
        "1_year": 387,
        "2_years": 737,
        "3_years": 1097
      },
      "1250": {
        "1_year": 417,
        "2_years": 787,
        "3_years": 1177
      },
      "2000": {
        "1_year": 507,
        "2_years": 877,
        "3_years": 1277
      }
    },
    "150": {
      "750": {
        "1_year": 367,
        "2_years": 697,
        "3_years": 1047
      },
      "1250": {
        "1_year": 387,
        "2_years": 737,
        "3_years": 1097
      },
      "2000": {
        "1_year": 477,
        "2_years": 827,
        "3_years": 1197
      }
    }
  }
}'::jsonb,
yearly_price = 467,
two_yearly_price = 897,
three_yearly_price = 1347,
updated_at = NOW()
WHERE name = 'Basic';

-- Update Gold plan pricing matrix with same structure
UPDATE plans 
SET pricing_matrix = '{
  "pricing": {
    "0": {
      "750": {
        "1_year": 467,
        "2_years": 897,
        "3_years": 1347
      },
      "1250": {
        "1_year": 497,
        "2_years": 937,
        "3_years": 1397
      },
      "2000": {
        "1_year": 587,
        "2_years": 1027,
        "3_years": 1497
      }
    },
    "50": {
      "750": {
        "1_year": 437,
        "2_years": 827,
        "3_years": 1247
      },
      "1250": {
        "1_year": 457,
        "2_years": 877,
        "3_years": 1297
      },
      "2000": {
        "1_year": 547,
        "2_years": 957,
        "3_years": 1397
      }
    },
    "100": {
      "750": {
        "1_year": 387,
        "2_years": 737,
        "3_years": 1097
      },
      "1250": {
        "1_year": 417,
        "2_years": 787,
        "3_years": 1177
      },
      "2000": {
        "1_year": 507,
        "2_years": 877,
        "3_years": 1277
      }
    },
    "150": {
      "750": {
        "1_year": 367,
        "2_years": 697,
        "3_years": 1047
      },
      "1250": {
        "1_year": 387,
        "2_years": 737,
        "3_years": 1097
      },
      "2000": {
        "1_year": 477,
        "2_years": 827,
        "3_years": 1197
      }
    }
  }
}'::jsonb,
yearly_price = 467,
two_yearly_price = 897,
three_yearly_price = 1347,
updated_at = NOW()
WHERE name = 'Gold';