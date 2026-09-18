/*
# Seed foods table with Nigerian dietary items

1. Overview
   Populates the `foods` table with 63 common Nigerian food items across
   seven categories: Swallows, Soups & Stews, Rice & Grains, Proteins,
   Breakfast & Drinks, Snacks & Street Food, and Common Foreign & Fast Foods.
   Calorie and macro estimates are based on standard Nigerian serving sizes.

2. Changes
   - Adds a UNIQUE constraint on `foods.name` so the seed is idempotent.
   - Inserts 63 rows with `ON CONFLICT (name) DO NOTHING` so re-running
     the migration does not create duplicates.

3. Data Notes
   - All calorie/macro values are approximate per single serving.
   - `serving_unit` reflects how Nigerians typically measure the food
     (e.g. "wrap" for swallows, "cooking spoon" for soups, "piece" for
     proteins, "cup" for drinks, "slice" for pizza).
   - `is_verified` defaults to true for all seeded items.
*/

-- Ensure idempotency: prevent duplicate food names on re-run
CREATE UNIQUE INDEX IF NOT EXISTS foods_name_unique_idx ON foods(name);

INSERT INTO foods (name, category, base_calories, serving_unit, protein_g, carbs_g, fat_g)
VALUES
  -- 1. Swallows (serving_unit: "wrap") — ~200-300g per wrap, carb-heavy
  ('Pounded Yam',          'Swallows', 320, 'wrap', 4.0,  75.0, 1.0),
  ('Eba (Garri)',          'Swallows', 250, 'wrap', 2.0,  60.0, 0.5),
  ('Amala',                'Swallows', 210, 'wrap', 3.0,  50.0, 0.5),
  ('Fufu',                 'Swallows', 260, 'wrap', 3.0,  62.0, 0.5),
  ('Wheat',                'Swallows', 270, 'wrap', 5.0,  58.0, 1.0),
  ('Semovita',             'Swallows', 280, 'wrap', 4.0,  65.0, 1.0),
  ('Tuwo Shinkafa',        'Swallows', 240, 'wrap', 3.0,  55.0, 0.5),

  -- 2. Soups & Stews (serving_unit: "cooking spoon" or "ladle")
  ('Egusi Soup',           'Soups & Stews', 180, 'cooking spoon', 8.0,  6.0, 14.0),
  ('Ogbono Soup',          'Soups & Stews', 170, 'cooking spoon', 7.0,  5.0, 13.0),
  ('Okra Soup',            'Soups & Stews',  80, 'cooking spoon', 4.0,  6.0,  5.0),
  ('Efo Riro',             'Soups & Stews', 120, 'cooking spoon', 5.0,  8.0,  8.0),
  ('Afang Soup',           'Soups & Stews', 130, 'cooking spoon', 6.0,  7.0,  9.0),
  ('Banga Soup',           'Soups & Stews', 150, 'cooking spoon', 4.0,  6.0, 12.0),
  ('Pepper Soup (Goat)',   'Soups & Stews', 100, 'ladle',         12.0, 3.0,  4.0),
  ('Pepper Soup (Fish)',   'Soups & Stews',  90, 'ladle',         10.0, 2.0,  3.0),
  ('Tomato Stew',          'Soups & Stews', 110, 'cooking spoon', 3.0,  8.0,  8.0),

  -- 3. Rice & Grains (serving_unit: "serving spoon" or "cup")
  ('Nigerian Jollof Rice', 'Rice & Grains', 400, 'serving spoon', 8.0,  65.0, 12.0),
  ('Fried Rice',           'Rice & Grains', 450, 'serving spoon', 7.0,  60.0, 18.0),
  ('Ofada Rice with Ayamase', 'Rice & Grains', 420, 'serving spoon', 9.0, 62.0, 14.0),
  ('White Rice',           'Rice & Grains', 260, 'cup',            5.0,  55.0,  1.0),
  ('Porridge Yam',         'Rice & Grains', 350, 'serving spoon', 6.0,  70.0,  8.0),
  ('Beans Porridge (Ewa Aganyin)', 'Rice & Grains', 300, 'serving spoon', 12.0, 50.0, 6.0),
  ('Coconut Rice',         'Rice & Grains', 380, 'serving spoon', 7.0,  58.0, 14.0),
  ('Masa (Rice Cake)',     'Rice & Grains', 220, 'piece',          4.0,  48.0,  3.0),

  -- 4. Proteins (serving_unit: "piece" or "portion")
  ('Suya (Beef)',          'Proteins', 250, 'portion', 20.0,  5.0, 16.0),
  ('Peppered Snail',       'Proteins', 120, 'piece',   16.0,  4.0,  4.0),
  ('Fried Beef',           'Proteins', 220, 'piece',    18.0,  2.0, 15.0),
  ('Asun (Peppered Goat)', 'Proteins', 280, 'portion',  22.0,  4.0, 18.0),
  ('Grilled Catfish',      'Proteins', 200, 'piece',    22.0,  2.0, 11.0),
  ('Fried Chicken',        'Proteins', 320, 'piece',    20.0,  8.0, 20.0),
  ('Boiled Egg',           'Proteins',  78, 'piece',     6.0,  0.6,  5.0),
  ('Hard-boiled Turkey',   'Proteins', 150, 'piece',    22.0,  0.0,  6.0),
  ('Fried Fish (Titus)',   'Proteins', 180, 'piece',    16.0,  3.0, 10.0),
  ('Stockfish (Okporoko)', 'Proteins', 120, 'piece',    25.0,  0.0,  2.0),
  ('Boli with Groundnut',  'Proteins', 350, 'portion',   6.0, 55.0, 12.0),

  -- 5. Breakfast & Drinks (serving_unit: "cup" or "bowl")
  ('Pap (Ogi/Koko)',       'Breakfast & Drinks', 150, 'cup',  3.0, 35.0, 0.5),
  ('Akara',                'Breakfast & Drinks', 200, 'piece', 8.0, 25.0, 8.0),
  ('Custard',              'Breakfast & Drinks', 180, 'bowl',  4.0, 38.0, 2.0),
  ('Oats',                 'Breakfast & Drinks', 150, 'bowl',  5.0, 27.0, 3.0),
  ('Kunu (Zaki)',          'Breakfast & Drinks', 130, 'cup',   2.0, 28.0, 1.0),
  ('Zobo (Unsweetened)',   'Breakfast & Drinks',  40, 'cup',  0.5, 10.0, 0.0),
  ('Zobo (Sweetened)',     'Breakfast & Drinks', 120, 'cup',  0.5, 30.0, 0.0),
  ('Tea/Milo with Milk',   'Breakfast & Drinks', 120, 'cup',  4.0, 18.0, 3.0),
  ('Moi Moi',              'Breakfast & Drinks', 200, 'piece', 9.0, 22.0, 8.0),
  ('Yam & Egg Sauce',      'Breakfast & Drinks', 350, 'bowl', 12.0, 55.0, 10.0),

  -- 6. Snacks & Street Food (serving_unit: "piece" or "pack")
  ('Puff-Puff',            'Snacks & Street Food', 150, 'piece', 2.0, 25.0,  5.0),
  ('Meat Pie',             'Snacks & Street Food', 300, 'piece', 8.0, 30.0, 16.0),
  ('Chin Chin',            'Snacks & Street Food', 130, 'piece', 2.0, 20.0,  5.0),
  ('Fried Plantain (Dodo)', 'Snacks & Street Food', 220, 'piece', 1.5, 35.0,  8.0),
  ('Boli (Roasted Plantain)', 'Snacks & Street Food', 180, 'piece', 1.5, 45.0,  1.0),
  ('Egg Roll',             'Snacks & Street Food', 280, 'piece', 6.0, 35.0, 12.0),
  ('Gala (Sausage Roll)',  'Snacks & Street Food', 200, 'pack',  5.0, 25.0,  9.0),
  ('Buns',                 'Snacks & Street Food', 160, 'piece', 3.0, 24.0,  6.0),
  ('Roasted Groundnut',    'Snacks & Street Food', 160, 'pack',  7.0,  6.0, 13.0),
  ('Kuli-Kuli',            'Snacks & Street Food', 150, 'pack',  8.0,  8.0,  9.0),

  -- 7. Common Foreign & Fast Foods in Nigeria (serving_unit: "slice", "portion", or "pack")
  ('Indomie (with Egg)',   'Fast Foods', 380, 'pack',    10.0, 55.0, 14.0),
  ('Beef Shawarma',        'Fast Foods', 450, 'portion', 18.0, 40.0, 24.0),
  ('Chicken Shawarma',     'Fast Foods', 420, 'portion', 20.0, 38.0, 20.0),
  ('Bolognese Pasta',      'Fast Foods', 480, 'portion', 14.0, 70.0, 14.0),
  ('Pepperoni Pizza',      'Fast Foods', 285, 'slice',   12.0, 36.0, 10.0),
  ('Cheeseburger',         'Fast Foods', 350, 'portion', 18.0, 30.0, 17.0),
  ('Pancakes',             'Fast Foods', 200, 'piece',    5.0, 35.0,  5.0),
  ('French Fries (Chips)', 'Fast Foods', 365, 'pack',     4.0, 48.0, 17.0)
ON CONFLICT (name) DO NOTHING;
