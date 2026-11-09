-- DEVELOPMENT FIXTURES ONLY. Names, descriptions and prices are sample catalog data.
INSERT INTO categories(slug, name) VALUES
('electronics', 'Electronics'), ('home-living', 'Home & living'), ('everyday', 'Everyday essentials'), ('outdoors', 'Outdoors') ON CONFLICT DO NOTHING;
INSERT INTO products(id, name, brand, description, price, category_slug, featured) VALUES
('00000000-0000-4000-8000-000000000001', 'Orbit wireless headphones', 'FORM', 'A little less noise. A lot more you. Over-ear wireless headphones with soft cushions, active noise cancellation and a clean, balanced sound.', 7990, 'electronics', true),
('00000000-0000-4000-8000-000000000002', 'Everyday carry backpack', 'ROAM', 'Your day, comfortably packed. A thoughtfully organized backpack with a padded laptop sleeve and water-resistant recycled fabric.', 2490, 'everyday', true),
('00000000-0000-4000-8000-000000000003', 'Pour-over coffee set', 'SLOW', 'Make room for a slower morning. A borosilicate glass carafe and reusable stainless steel filter for your daily coffee ritual.', 1890, 'home-living', true),
('00000000-0000-4000-8000-000000000004', 'Pocket Bluetooth speaker', 'FORM', 'Good sound goes anywhere. A compact, rechargeable speaker with a woven finish and a convenient carrying loop.', 3490, 'electronics', true),
('00000000-0000-4000-8000-000000000005', 'Studio desk lamp', 'HABITAT', 'A brighter corner for your best ideas. An adjustable metal desk lamp with warm LED lighting and a simple, timeless silhouette.', 2990, 'home-living', false),
('00000000-0000-4000-8000-000000000006', 'Trail insulated bottle', 'ROAM', 'Bring a little refreshment along. A reusable double-wall stainless steel bottle with a leak-resistant lid.', 1290, 'outdoors', true),
('00000000-0000-4000-8000-000000000007', 'Minimal everyday watch', 'HOUR', 'An easy companion for every day. A clean analog dial, stainless steel case and soft, interchangeable strap.', 4590, 'everyday', false),
('00000000-0000-4000-8000-000000000008', 'Instant film camera', 'FRAME', 'Keep the moments that matter. A simple instant camera with automatic exposure and a built-in selfie mirror.', 6990, 'electronics', false) ON CONFLICT DO NOTHING;
INSERT INTO product_images(product_id, position, url) VALUES
('00000000-0000-4000-8000-000000000001', 0, 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=85'),
('00000000-0000-4000-8000-000000000002', 0, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=85'),
('00000000-0000-4000-8000-000000000003', 0, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=700&q=85'),
('00000000-0000-4000-8000-000000000004', 0, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=700&q=85'),
('00000000-0000-4000-8000-000000000005', 0, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=85'),
('00000000-0000-4000-8000-000000000006', 0, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=700&q=85'),
('00000000-0000-4000-8000-000000000007', 0, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=85'),
('00000000-0000-4000-8000-000000000008', 0, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=700&q=85') ON CONFLICT DO NOTHING;
INSERT INTO product_specifications(product_id, name, value) VALUES
('00000000-0000-4000-8000-000000000001', 'Battery', 'Up to 40 hours'),
('00000000-0000-4000-8000-000000000001', 'Connectivity', 'Bluetooth 5.3'),
('00000000-0000-4000-8000-000000000001', 'Noise control', 'Active noise cancellation'),
('00000000-0000-4000-8000-000000000002', 'Capacity', '22 litres'),
('00000000-0000-4000-8000-000000000002', 'Laptop sleeve', 'Up to 15.6 inches'),
('00000000-0000-4000-8000-000000000003', 'Capacity', '600 ml'),
('00000000-0000-4000-8000-000000000003', 'Material', 'Borosilicate glass'),
('00000000-0000-4000-8000-000000000004', 'Battery', 'Up to 12 hours'),
('00000000-0000-4000-8000-000000000005', 'Light', 'Warm LED'),
('00000000-0000-4000-8000-000000000006', 'Capacity', '750 ml'),
('00000000-0000-4000-8000-000000000006', 'Material', 'Stainless steel'),
('00000000-0000-4000-8000-000000000007', 'Movement', 'Quartz'),
('00000000-0000-4000-8000-000000000008', 'Film', 'Instant mini (sold separately)') ON CONFLICT DO NOTHING;
