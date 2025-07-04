-- Fix 1: Correct card_types table structure and data
DELETE FROM card_types;
ALTER TABLE card_types AUTO_INCREMENT = 1;
INSERT INTO card_types (card_type_id, card_type_name, upgrading_score, downgrading_score, discount, description) VALUES
(1, 'Membership', 100, 0, 0.00, 'Basic membership card'),
(2, 'Silver', 200, 100, 0.05, 'Silver tier with 5% discount'),
(3, 'Gold', 500, 200, 0.10, 'Premium Gold tier with 10% discount');

DELETE FROM dishes;
ALTER TABLE dishes AUTO_INCREMENT = 1;
INSERT INTO dishes (dish_name, price, category_name, image_link, description) VALUES
('Masala Maki Roll', 280, 'Sushi Rolls', 'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg?auto=compress&cs=tinysrgb&w=800', 'Spicy potato and paneer sushi roll with Indian spices'),
('Tandoori Salmon Sushi', 320, 'Sashimi', 'https://images.pexels.com/photos/248444/pexels-photo-248444.jpeg?auto=compress&cs=tinysrgb&w=800', 'Fresh salmon marinated in tandoori spices'),
('Butter Chicken Sushi', 290, 'Fusion Rolls', 'https://images.pexels.com/photos/6249524/pexels-photo-6249524.jpeg?auto=compress&cs=tinysrgb&w=800', 'Classic butter chicken in sushi form'),
('Pani Puri Sushi', 220, 'Innovative', 'https://images.pexels.com/photos/4253312/pexels-photo-4253312.jpeg?auto=compress&cs=tinysrgb&w=800', 'Creative fusion of pani puri and sushi'),
('Biryani Sushi', 250, 'Fusion Rolls', 'https://images.pexels.com/photos/8951443/pexels-photo-8951443.jpeg?auto=compress&cs=tinysrgb&w=800', 'Hyderabadi biryani in sushi format'),
('Chaat Tempura', 180, 'Starters', 'https://images.pexels.com/photos/5718024/pexels-photo-5718024.jpeg?auto=compress&cs=tinysrgb&w=800', 'Crispy tempura with Indian chaat flavors'),
('Mango Lassi Mousse', 150, 'Desserts', 'https://images.pexels.com/photos/6249942/pexels-photo-6249942.jpeg?auto=compress&cs=tinysrgb&w=800', 'Deconstructed mango lassi dessert'),
('Gulab Jamun Cheesecake', 170, 'Desserts', 'https://images.pexels.com/photos/4686818/pexels-photo-4686818.jpeg?auto=compress&cs=tinysrgb&w=800', 'Fusion dessert combining Japanese and Indian sweets'),
('Masala Chai Crème Brûlée', 160, 'Desserts', 'https://images.pexels.com/photos/8477523/pexels-photo-8477523.jpeg?auto=compress&cs=tinysrgb&w=800', 'Indian spiced tea flavored dessert'),
('Samosushi', 200, 'Fusion Rolls', 'https://images.pexels.com/photos/4393668/pexels-photo-4393668.jpeg?auto=compress&cs=tinysrgb&w=800', 'Sushi shaped like samosa with spiced filling'),
('Curry Leaf Nigiri', 240, 'Nigiri', 'https://images.pexels.com/photos/916925/pexels-photo-916925.jpeg?auto=compress&cs=tinysrgb&w=800', 'Fresh tuna with curry leaf and coconut rice'),
('Dosa Temaki', 260, 'Hand Rolls', 'https://images.pexels.com/photos/5718139/pexels-photo-5718139.jpeg?auto=compress&cs=tinysrgb&w=800', 'Crispy dosa cone filled with spiced vegetables and rice'),
('Rajma Maki', 230, 'Sushi Rolls', 'https://images.pexels.com/photos/5718158/pexels-photo-5718158.jpeg?auto=compress&cs=tinysrgb&w=800', 'Kidney bean curry wrapped in sushi rice and nori'),
('Palak Paneer Sashimi', 280, 'Sashimi', 'https://images.pexels.com/photos/6249929/pexels-photo-6249929.jpeg?auto=compress&cs=tinysrgb&w=800', 'Paneer slices with spinach puree and wasabi'),
('Chole Bhature Bowl', 210, 'Rice Bowls', 'https://images.pexels.com/photos/8477528/pexels-photo-8477528.jpeg?auto=compress&cs=tinysrgb&w=800', 'Chickpea curry over sushi rice with fried naan chips'),
('Aloo Gobi Maki', 190, 'Vegetarian Rolls', 'https://images.pexels.com/photos/5718040/pexels-photo-5718040.jpeg?auto=compress&cs=tinysrgb&w=800', 'Spiced potato and cauliflower in seaweed wrap'),
('Keema Sushi Pizza', 340, 'Fusion Specials', 'https://images.pexels.com/photos/4393442/pexels-photo-4393442.jpeg?auto=compress&cs=tinysrgb&w=800', 'Crispy rice base topped with spiced minced lamb'),
('Rasmalai Mochi', 140, 'Desserts', 'https://images.pexels.com/photos/6249518/pexels-photo-6249518.jpeg?auto=compress&cs=tinysrgb&w=800', 'Sweet mochi filled with cardamom-flavored cream'),
('Jalebi Tempura', 130, 'Desserts', 'https://images.pexels.com/photos/8477532/pexels-photo-8477532.jpeg?auto=compress&cs=tinysrgb&w=800', 'Crispy tempura batter with jalebi syrup drizzle'),
('Korma Chirashi Bowl', 380, 'Rice Bowls', 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&w=800', 'Assorted sashimi over coconut korma rice'),
('Tikka Masala Roll', 300, 'Fusion Rolls', 'https://images.pexels.com/photos/4253325/pexels-photo-4253325.jpeg?auto=compress&cs=tinysrgb&w=800', 'Grilled chicken tikka in masala sauce roll'),
('Idli Slider', 160, 'Appetizers', 'https://images.pexels.com/photos/5718089/pexels-photo-5718089.jpeg?auto=compress&cs=tinysrgb&w=800', 'Mini idlis with sambar and coconut chutney'),
('Bhel Puri Salad', 180, 'Salads', 'https://images.pexels.com/photos/6249935/pexels-photo-6249935.jpeg?auto=compress&cs=tinysrgb&w=800', 'Deconstructed bhel puri with fresh greens'),
('Kulfi Ice Cream Roll', 120, 'Desserts', 'https://images.pexels.com/photos/4686831/pexels-photo-4686831.jpeg?auto=compress&cs=tinysrgb&w=800', 'Traditional kulfi wrapped in sweet crepe'),
('Paneer Tikka Sushi Sandwich', 250, 'Fusion Specials', 'https://images.pexels.com/photos/8951457/pexels-photo-8951457.jpeg?auto=compress&cs=tinysrgb&w=800', 'Grilled paneer between compressed sushi rice'),
('Mutton Biryani Bowl', 420, 'Rice Bowls', 'https://images.pexels.com/photos/5718012/pexels-photo-5718012.jpeg?auto=compress&cs=tinysrgb&w=800', 'Slow-cooked mutton over fragrant basmati and sushi rice'),
('Gujiya Gyoza', 170, 'Appetizers', 'https://images.pexels.com/photos/4393451/pexels-photo-4393451.jpeg?auto=compress&cs=tinysrgb&w=800', 'Sweet filled dumplings with khoya and nuts'),
('Vada Pav Bao', 140, 'Street Food Fusion', 'https://images.pexels.com/photos/5718156/pexels-photo-5718156.jpeg?auto=compress&cs=tinysrgb&w=800', 'Spiced potato fritter in soft steamed bun'),
('Masala Dosa Wrap', 220, 'Wraps', 'https://images.pexels.com/photos/6249947/pexels-photo-6249947.jpeg?auto=compress&cs=tinysrgb&w=800', 'Crispy dosa filled with potato masala and sushi rice');

DELETE FROM regions;
INSERT INTO regions (region_id, region_name) VALUES
(1, 'Mumbai'),
(2, 'Delhi'),
(3, 'Bangalore'),
(4, 'Hyderabad'),
(5, 'Chennai'),
(6, 'Kolkata'),
(7, 'Pune');

DELETE FROM departments;
ALTER TABLE departments AUTO_INCREMENT = 1;
INSERT INTO departments (department_id, department_name, salary) VALUES
(1, 'Restaurant Manager', 75000),
(2, 'Sushi Chef', 45000),
(3, 'Head Chef', 60000),
(4, 'Accounts', 35000),
(5, 'Waiter', 25000),
(6, 'Host/Hostess', 22000),
(7, 'Cleaning Staff', 18000),
(8, 'Delivery Staff', 20000);

-- Fix 2: Insert employees BEFORE online_account (to fix foreign key constraint)
DELETE FROM employees;
ALTER TABLE employees AUTO_INCREMENT = 1;
INSERT INTO employees (employee_id, employee_name, employee_email, date_of_birth, gender, hire_date, quit_date, current_work_id, employee_phone_number, employee_address, employee_rating) VALUES
(1, 'Rajiv Malhotra', 'rajiv.m@example.com', '1990-05-15', 'Male', '2020-01-10', NULL, NULL, '919988776611', '12, Palm Avenue, Mumbai', 4.5),
(2, 'Sunita Reddy', 'sunita.r@example.com', '1992-08-22', 'Female', '2021-03-15', NULL, NULL, '919977665522', '34, Green Park, Delhi', 4.2),
(3, 'Arun Kumar', 'arun.k@example.com', '1988-11-05', 'Male', '2019-06-20', NULL, NULL, '919966554433', '5th Cross, Koramangala, Bangalore', 4.7),
(4, 'Priyanka Sharma', 'priyanka.s@example.com', '1995-02-18', 'Female', '2022-01-05', NULL, NULL, '919955443322', '45, Jubilee Hills, Hyderabad', 4.3),
(5, 'Vikram Patel', 'vikram.p@example.com', '1993-07-30', 'Male', '2021-09-12', NULL, NULL, '919944332211', '78, Andheri East, Mumbai', 4.0);

-- Fix 3: Insert branches BEFORE employee_branches (needed for staff_branch reference)
DELETE FROM branches;
ALTER TABLE branches AUTO_INCREMENT = 1;
INSERT INTO branches (branch_id, branch_name, address, email, open_time, close_time, phone_number, has_car_park, has_motorbike_park, table_amount, region_id, manager_id) VALUES
(1, 'SushiX Bandra', '201, Linking Road, Bandra West, Mumbai', 'bandra@sushix.in', '11:00:00', '23:00:00', '02226458976', 1, 1, 20, 1, NULL),
(2, 'SushiX Connaught Place', '34, Inner Circle, Connaught Place, Delhi', 'cp@sushix.in', '11:00:00', '23:00:00', '01133567890', 0, 1, 25, 2, NULL),
(3, 'SushiX Koramangala', '5th Block, 80 Feet Road, Koramangala, Bangalore', 'koramangala@sushix.in', '11:00:00', '23:00:00', '08025678901', 1, 1, 18, 3, NULL),
(4, 'SushiX Jubilee Hills', 'Road No. 36, Jubilee Hills, Hyderabad', 'jubileehills@sushix.in', '11:00:00', '23:00:00', '04027890123', 1, 1, 15, 4, NULL);

DELETE FROM employee_branches;
ALTER TABLE employee_branches AUTO_INCREMENT = 1;
INSERT INTO employee_branches (employee_branches_id, employee_id, branch_id, department_id, start_date, end_date) VALUES
(1, 1, 1, 1, '2020-01-10', NULL), -- Rajiv - Manager Bandra
(2, 2, 2, 1, '2021-03-15', NULL), -- Sunita - Manager CP
(3, 3, 3, 3, '2019-06-20', NULL), -- Arun - Head Chef Bangalore
(4, 4, 4, 2, '2022-01-05', NULL), -- Priyanka - Sushi Chef Hyderabad
(5, 5, 1, 5, '2021-09-12', NULL); -- Vikram - Waiter Bandra

-- Fix 4: Now insert online_account with correct staff_id references
DELETE FROM online_account;
ALTER TABLE online_account AUTO_INCREMENT = 1;
INSERT INTO online_account (user_name, user_password, user_email, user_phone_number, user_address, is_staff, staff_id, staff_branch, is_admin, created_at, update_at, last_visited, refresh_token) VALUES
('rahulsharma', 'Rahul@123', 'rahul.sharma@example.com', '919876543210', '201, Silver Heights, Andheri East, Mumbai', 0, NULL, NULL, 0, NOW(), NOW(), NOW(), NULL),
('priyapatel', 'Priya#456', 'priya.patel@example.com', '919887766554', '34, Green Park, Delhi', 0, NULL, NULL, 0, NOW(), NOW(), NOW(), NULL),
('amitsingh', 'Amit$789', 'amit.singh@example.com', '919776655443', '5th Cross, Koramangala, Bangalore', 0, NULL, NULL, 0, NOW(), NOW(), NOW(), NULL),
('nehaverma', 'Neha!2023', 'neha.verma@example.com', '919988776655', '12/A, Jubilee Hills, Hyderabad', 0, NULL, NULL, 0, NOW(), NOW(), NOW(), NULL),
('staff_arjun', 'Staff@123', 'arjun.k@example.com', '919876543211', 'Staff Quarters, SushiX HQ', 1, 1, 1, 0, NOW(), NOW(), NOW(), NULL),
('admin_meera', 'Admin@456', 'meera.a@example.com', '919876543212', 'Admin Block, SushiX HQ', 1, 2, 1, 1, NOW(), NOW(), NOW(), NULL);

DELETE FROM member_cards;
ALTER TABLE member_cards AUTO_INCREMENT = 1;
INSERT INTO member_cards (member_card_id, created_at, updated_at, total_points, card_issuer, branch_created, card_type_id, member_id, member_name, member_phone_number, member_gender, user_id, is_active) VALUES
(1, NOW(), NOW(), 150, 1, 1, 2, 100001, 'Rahul Sharma', '919876543210', 'Male', 1, 1),
(2, NOW(), NOW(), 520, 2, 2, 3, 100002, 'Priya Patel', '919887766554', 'Female', 2, 1),
(3, NOW(), NOW(), 850, 1, 1, 3, 100003, 'Amit Singh', '919776655443', 'Male', 3, 1),
(4, NOW(), NOW(), 75, 3, 3, 1, 100004, 'Neha Verma', '919988776655', 'Female', 4, 1),
(5, NOW(), NOW(), 320, 4, 4, 2, 100005, 'Sanjay Gupta', '919955443322', 'Male', NULL, 1);

DELETE FROM reservation_slips;
ALTER TABLE reservation_slips AUTO_INCREMENT = 1;
INSERT INTO reservation_slips (reservation_slip_id, cus_name, phone_number, status, arrival_time, arrival_date, table_number, branch_id, guests_number, notes, member_card_id, waiter, created_at, online_account) VALUES
(1, 'Rahul Sharma', '919876543210', 'completed', '19:30:00', '2023-12-15', 5, 1, 4, 'Anniversary celebration', 1, 5, NOW(), 1),
(2, 'Priya Patel', '919887766554', 'table_in_use', '20:00:00', '2023-12-20', 8, 2, 6, 'Family dinner', 2, NULL, NOW(), 2),
(3, 'Amit Singh', '919776655443', 'waiting_for_guest', '21:00:00', '2023-12-18', 3, 3, 2, 'Business meeting', 3, NULL, NOW(), 3),
(4, 'Neha Verma', '919988776655', 'canceled', '20:30:00', '2023-12-22', 10, 4, 5, NULL, 4, NULL, NOW(), 4),
(5, 'Sanjay Gupta', '919955443322', 'completed', '19:00:00', '2023-12-10', 2, 1, 3, 'Birthday party', 5, 5, NOW(), NULL);

DELETE FROM orders;
ALTER TABLE orders AUTO_INCREMENT = 1;
INSERT INTO orders (order_id, branch_id, online_user_id, reservation_slip_id, order_type, status, created_at) VALUES
(1, 1, 1, 1, 'dine-in', 'billed', '2023-12-15 19:30:00'),
(2, 2, 2, 2, 'dine-in', 'serving', '2023-12-20 20:00:00'),
(3, 3, 3, 3, 'dine-in', 'serving', '2023-12-18 21:00:00'),
(4, 4, 4, 4, 'dine-in', 'cancelled', '2023-12-22 20:30:00'),
(5, 1, NULL, NULL, 'delivery', 'delivered', '2023-12-10 18:30:00'),
(6, 2, NULL, NULL, 'delivery', 'delivered', '2023-12-12 19:15:00');

DELETE FROM order_details;
INSERT INTO order_details (order_id, branch_id, dish_id, quantity, price, serve_at, created_at, update_at) VALUES
(1, 1, 1, 2, 280, '2023-12-15 19:45:00', '2023-12-15 19:30:00', '2023-12-15 19:30:00'),
(1, 1, 3, 1, 290, '2023-12-15 19:45:00', '2023-12-15 19:30:00', '2023-12-15 19:30:00'),
(2, 2, 2, 3, 320, NULL, '2023-12-20 20:00:00', '2023-12-20 20:00:00'),
(2, 2, 4, 2, 220, NULL, '2023-12-20 20:00:00', '2023-12-20 20:00:00'),
(3, 3, 5, 2, 250, NULL, '2023-12-18 21:00:00', '2023-12-18 21:00:00'),
(5, 1, 6, 1, 180, NULL, '2023-12-10 18:30:00', '2023-12-10 18:30:00'),
(5, 1, 7, 2, 150, NULL, '2023-12-10 18:30:00', '2023-12-10 18:30:00'),
(6, 2, 8, 1, 170, NULL, '2023-12-12 19:15:00', '2023-12-12 19:15:00');

DELETE FROM menu;
INSERT INTO menu (branch_id, dish_id, is_ship, is_serve) VALUES
(1, 1, 1, 1), (1, 2, 1, 1), (1, 3, 1, 1), (1, 4, 0, 1), (1, 5, 0, 1),
(2, 1, 1, 1), (2, 2, 1, 1), (2, 3, 1, 1), (2, 6, 1, 1), (2, 7, 1, 1),
(3, 1, 1, 1), (3, 4, 1, 1), (3, 5, 1, 1), (3, 8, 1, 1), (3, 9, 1, 1),
(4, 2, 1, 1), (4, 3, 1, 1), (4, 6, 1, 1), (4, 9, 1, 1), (4, 10, 1, 1);

DELETE FROM bills;
ALTER TABLE bills AUTO_INCREMENT = 1;
INSERT INTO bills (order_id, total_amount, total_amount_with_benefits, status, created_at) VALUES
(1, 850, 807.50, 'paid', '2023-12-15 20:45:00'),
(2, 1400, 1330.00, 'in progress', '2023-12-20 21:30:00'),
(3, 500, 450.00, 'in progress', '2023-12-18 21:45:00'),
(5, 480, 480.00, 'paid', '2023-12-10 19:30:00'),
(6, 170, 161.50, 'paid', '2023-12-12 19:45:00');

DELETE FROM deliveries;
ALTER TABLE deliveries AUTO_INCREMENT = 1;
INSERT INTO deliveries (delevery_id, order_id, branch_id, cus_name, address, phone_number, notes, status, shipper, created_at) VALUES
(1, 5, 1, 'Ravi Deshpande', '203, Silver Oak Apartments, Andheri East, Mumbai', '919988776600', 'Ring bell twice', 'completed', 5, '2023-12-10 18:30:00'),
(2, 6, 2, 'Ananya Chatterjee', '45, Golf Links, New Delhi', '919977665500', 'Call before arrival', 'completed', NULL, '2023-12-12 19:15:00');

DELETE FROM service_reviews;
ALTER TABLE service_reviews AUTO_INCREMENT = 1;
INSERT INTO service_reviews (reservation_slip_id, service_rating, location_rating, food_rating, price_rating, ambiance_rating) VALUES
(1, 5, 4, 5, 4, 5),
(2, 4, 5, 4, 3, 4),
(3, 3, 4, 5, 4, 3);

DELETE FROM review_dishes;
INSERT INTO review_dishes (dish_id, rating, user_id, comment) VALUES
(1, 4.5, 1, 'Excellent fusion of flavors!'),
(2, 4.0, 2, 'Good but could be more spicy'),
(3, 5.0, 3, 'Perfect combination of butter chicken and sushi'),
(4, 3.5, 4, 'Innovative but needs better presentation'),
(5, 4.0, 1, 'Biryani in sushi form - interesting concept');

DELETE FROM session;
INSERT INTO session (user_id, access_time, duration) VALUES
(1, '2023-12-15 19:25:00', 3600),
(2, '2023-12-20 19:45:00', 2700),
(3, '2023-12-18 20:30:00', 4200),
(4, '2023-12-22 20:15:00', 1800);

-- Update current_work_id references
UPDATE employees SET current_work_id = 1 WHERE employee_id = 1;
UPDATE employees SET current_work_id = 2 WHERE employee_id = 2;
UPDATE employees SET current_work_id = 3 WHERE employee_id = 3;
UPDATE employees SET current_work_id = 4 WHERE employee_id = 4;
UPDATE employees SET current_work_id = 5 WHERE employee_id = 5;

-- Update manager references
UPDATE branches SET manager_id = 1 WHERE branch_id = 1;
UPDATE branches SET manager_id = 2 WHERE branch_id = 2;
UPDATE branches SET manager_id = 3 WHERE branch_id = 3;
UPDATE branches SET manager_id = 4 WHERE branch_id = 4;

-- Add districts and wards tables and data
CREATE TABLE IF NOT EXISTS districts (
  district_id INT PRIMARY KEY AUTO_INCREMENT,
  district_name VARCHAR(255),
  region_id INT,
  FOREIGN KEY (region_id) REFERENCES regions(region_id)
);
CREATE TABLE IF NOT EXISTS wards (
  ward_id INT PRIMARY KEY AUTO_INCREMENT,
  ward_name VARCHAR(255),
  district_id INT,
  FOREIGN KEY (district_id) REFERENCES districts(district_id)
);

-- Mumbai (region_id=1)
INSERT INTO districts (district_name, region_id) VALUES
('South Mumbai', 1), ('Western Suburbs', 1), ('Eastern Suburbs', 1);
INSERT INTO wards (ward_name, district_id) VALUES
('Colaba', 1), ('Fort', 1), ('Bandra', 2), ('Andheri', 2), ('Ghatkopar', 3), ('Mulund', 3);

-- Delhi (region_id=2)
INSERT INTO districts (district_name, region_id) VALUES
('Central Delhi', 2), ('South Delhi', 2), ('West Delhi', 2);
INSERT INTO wards (ward_name, district_id) VALUES
('Connaught Place', 4), ('Karol Bagh', 4), ('Saket', 5), ('Hauz Khas', 5), ('Janakpuri', 6), ('Punjabi Bagh', 6);

-- Bangalore (region_id=3)
INSERT INTO districts (district_name, region_id) VALUES
('Bangalore Urban', 3), ('Bangalore Rural', 3);
INSERT INTO wards (ward_name, district_id) VALUES
('Koramangala', 7), ('Indiranagar', 7), ('Devanahalli', 8), ('Hoskote', 8);

-- Hyderabad (region_id=4)
INSERT INTO districts (district_name, region_id) VALUES
('Central Hyderabad', 4), ('Secunderabad', 4);
INSERT INTO wards (ward_name, district_id) VALUES
('Jubilee Hills', 9), ('Banjara Hills', 9), ('Begumpet', 10), ('Trimulgherry', 10);

-- Chennai (region_id=5)
INSERT INTO districts (district_name, region_id) VALUES
('North Chennai', 5), ('South Chennai', 5);
INSERT INTO wards (ward_name, district_id) VALUES
('Tondiarpet', 11), ('Royapuram', 11), ('Adyar', 12), ('Velachery', 12);

-- Kolkata (region_id=6)
INSERT INTO districts (district_name, region_id) VALUES
('North Kolkata', 6), ('South Kolkata', 6);
INSERT INTO wards (ward_name, district_id) VALUES
('Shyambazar', 13), ('Dum Dum', 13), ('Garia', 14), ('Tollygunge', 14);

-- Pune (region_id=7)
INSERT INTO districts (district_name, region_id) VALUES
('Pune City', 7), ('Pimpri-Chinchwad', 7);
INSERT INTO wards (ward_name, district_id) VALUES
('Shivajinagar', 15), ('Kothrud', 15), ('Nigdi', 16), ('Akurdi', 16);