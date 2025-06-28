CREATE DATABASE SuShiXX;

USE SuShiXX;

CREATE TABLE `regions` (
  `region_id` INT PRIMARY KEY,
  `region_name` VARCHAR(255)
);

CREATE TABLE `branches` (
  `branch_id` INT PRIMARY KEY AUTO_INCREMENT,
  `branch_name` VARCHAR(255),
  `address` VARCHAR(255),
  `email` VARCHAR(255),
  `open_time` TIME,
  `close_time` TIME,
  `phone_number` VARCHAR(30),
  `has_car_park` BOOL,
  `has_motorbike_park` BOOL,
  `table_amount` INT,
  `region_id` INT,
  `manager_id` INT
);
-- ALTER TABLE branches MODIFY open_time TIME;
-- ALTER TABLE branches MODIFY close_time TIME;

CREATE TABLE `dishes` (
  `dish_id` INT PRIMARY KEY AUTO_INCREMENT,
  `dish_name` VARCHAR(255),
  `price` FLOAT DEFAULT 0,
  `category_name` VARCHAR(255),
  `image_link` VARCHAR(255),
  `description` TEXT
);

CREATE TABLE `review_dishes` (
  `dish_id` INT,
  `rating` FLOAT,
  `user_id` INT,
  `comment` TEXT,
  PRIMARY KEY (`dish_id`, `user_id`)
);

CREATE TABLE `member_cards` (
  `member_card_id` INT PRIMARY KEY AUTO_INCREMENT,
  `created_at` DATETIME,
  `updated_at` DATETIME,
  `total_points` INT DEFAULT 0,
  `card_issuer` INT,
  `branch_created` INT,
  `card_type_id` INT DEFAULT 0,
  `member_id` INT COMMENT 'cccd',
  `member_name` VARCHAR(50),
  `member_phone_number` VARCHAR(30),
  `member_gender` ENUM('Male','Female','Other'),
  `user_id` INT,
  `is_active` BOOL DEFAULT TRUE,
  UNIQUE KEY  `uk_member_cards_cccd` (`member_id`)
);

CREATE TABLE `card_types` (
  `card_type_id` INT PRIMARY KEY AUTO_INCREMENT,
  `card_type_name` ENUM('Membership','Silver','Gold') DEFAULT 'Membership',
  `upgrading_score` INT,
  `downgrading_score` INT,
  `discount` FLOAT,
  `description` VARCHAR(255)
);

CREATE TABLE `menu` (
  `branch_id` INT,
  `dish_id` INT,
  `is_ship` BOOL DEFAULT FALSE,
  `is_serve` BOOL DEFAULT TRUE,
  PRIMARY KEY (`branch_id`, `dish_id`)
);

CREATE TABLE `deliveries` (
  `delevery_id` INT PRIMARY KEY AUTO_INCREMENT,
  `order_id` INT,
  `branch_id` INT,
  `cus_name` VARCHAR(100),
  `address` VARCHAR(255),
  `phone_number` VARCHAR(30),
  `notes` TEXT,
  `status` ENUM('pending','in progress','completed','cancelled','returned'),
  `shipper` INT,
  `created_at` DATETIME
);

CREATE TABLE `online_account` (
  `user_id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_name` VARCHAR(255),
  `user_password` VARCHAR(255),
  `user_email` VARCHAR(255),
  `user_phone_number` VARCHAR(30),
  `user_address` VARCHAR(255),
  `is_staff` BOOL,
  `staff_id` INT,
  `staff_branch` INT,
  `is_admin` BOOL,
  `created_at` DATETIME,
  `update_at` DATETIME,
  `last_visited` DATETIME,
  `refresh_token` TEXT,
  UNIQUE KEY `uk_online_account_email` (`user_email`)
);


CREATE TABLE `reservation_slips` (
  `reservation_slip_id` INT PRIMARY KEY AUTO_INCREMENT,
  `cus_name` VARCHAR(100),
  `phone_number` VARCHAR(30),
  `status` ENUM('waiting_for_guest', 'table_in_use', 'completed', 'canceled'),
  `arrival_time` TIME,
  `arrival_date` DATE,
  `table_number` INT,
  `branch_id` INT,
  `guests_number` INT,
  `online_account` INT,
  `notes` TEXT,
  `member_card_id` INT,
  `waiter` INT,
  `created_at` DATETIME,
   UNIQUE KEY `unique_reservation_branch` (`reservation_slip_id`, `branch_id`)
);

CREATE TABLE `orders` (
  `order_id` INT PRIMARY KEY AUTO_INCREMENT,
  `branch_id` INT,
  `online_user_id` INT,
  `reservation_slip_id` INT DEFAULT NULL,
  `order_type` ENUM('dine-in','delivery'),
  `status` ENUM('waiting_for_guest','serving','billed','in_delivery','delivered', 'cancelled'),
  `created_at` DATETIME,
   UNIQUE KEY `unique_orders` (`order_id`, `branch_id`)
);

CREATE TABLE `order_details` (
  `order_id` INT,
  `branch_id` INT,
  `dish_id` INT,
  `quantity` INT,
  `price` FLOAT, 
  `serve_at` DATETIME,
  `created_at` DATETIME,
  `update_at` DATETIME,
  PRIMARY KEY (`order_id`, `dish_id`)
);

CREATE TABLE `bills` (
  `bill_id` INT PRIMARY KEY AUTO_INCREMENT,
  `order_id` INT,
  `total_amount` FLOAT,
  `total_amount_with_benefits` FLOAT,
  `status` ENUM('in progress','cancelled','paid', 'refund'),
  `created_at` DATETIME
);

CREATE TABLE `service_reviews` (
  `service_reviews_id` INT PRIMARY KEY AUTO_INCREMENT,
  `reservation_slip_id` INT,
  `service_rating` INT,
  `location_rating` INT,
  `food_rating` INT,
  `price_rating` INT,
  `ambiance_rating` INT,
  UNIQUE KEY `unique_reservation_review`(`reservation_slip_id`)
);

CREATE TABLE `employees` (
  `employee_id` INT PRIMARY KEY AUTO_INCREMENT,
  `employee_name` VARCHAR(255),
  `employee_email` VARCHAR(255),
  `date_of_birth` DATETIME,
  `gender` ENUM('Male','Female','Other'),
  `hire_date` DATETIME,
  `quit_date` DATETIME,
  `current_work_id` INT,
  `employee_phone_number` VARCHAR(30),
  `employee_address` VARCHAR(255),
  `employee_rating` FLOAT
);


CREATE TABLE `departments` (
  `department_id` INT PRIMARY KEY AUTO_INCREMENT,
  `department_name` VARCHAR(255),
  `salary` INT
);

CREATE TABLE `employee_branches` (
  `employee_branches_id` INT AUTO_INCREMENT,
  `employee_id` INT,
  `branch_id` INT,
  `department_id` INT,
  `start_date` DATETIME,
  `end_date` DATETIME,
  PRIMARY KEY (`employee_branches_id`)
);


CREATE TABLE `session` (
  `user_id` INT,
  `access_time` DATETIME,
  `duration` INT,
  PRIMARY KEY (`user_id`, `access_time`)
);

ALTER TABLE `reservation_slips` ADD FOREIGN KEY (`online_account`) REFERENCES `online_account`(`user_id`);

ALTER TABLE `review_dishes` ADD FOREIGN KEY (`user_id`) REFERENCES `online_account` (`user_id`);

ALTER TABLE `review_dishes` ADD FOREIGN KEY (`dish_id`) REFERENCES `dishes` (`dish_id`);

ALTER TABLE `member_cards` ADD FOREIGN KEY (`user_id`) REFERENCES `online_account` (`user_id`);

ALTER TABLE `online_account` ADD FOREIGN KEY (`staff_id`) REFERENCES `employees` (`employee_id`);

ALTER TABLE `online_account` ADD FOREIGN KEY (`staff_branch`) REFERENCES `branches` (`branch_id`);

ALTER TABLE `reservation_slips` ADD FOREIGN KEY (`waiter`) REFERENCES `employee_branches` (`employee_branches_id`);
 
ALTER TABLE `orders` ADD FOREIGN KEY (`online_user_id`) REFERENCES `online_account` (`user_id`);

ALTER TABLE `session` ADD FOREIGN KEY (`user_id`) REFERENCES `online_account` (`user_id`);

ALTER TABLE `orders` ADD FOREIGN KEY (`reservation_slip_id`, `branch_id`) REFERENCES `reservation_slips` (`reservation_slip_id`, `branch_id`);

ALTER TABLE `orders` ADD FOREIGN KEY (`branch_id`) REFERENCES `branches` (`branch_id`);

ALTER TABLE `member_cards` ADD FOREIGN KEY (`card_type_id`) REFERENCES `card_types` (`card_type_id`);

ALTER TABLE `deliveries` ADD FOREIGN KEY (`order_id`, `branch_id`) REFERENCES `orders` (`order_id`, `branch_id`);

ALTER TABLE `deliveries` ADD FOREIGN KEY (`shipper`) REFERENCES `employee_branches` (`employee_branches_id`);

ALTER TABLE `member_cards` ADD FOREIGN KEY (`card_issuer`) REFERENCES `employee_branches` (`employee_branches_id`);

ALTER TABLE `branches` ADD FOREIGN KEY (`region_id`) REFERENCES `regions` (`region_id`);

ALTER TABLE `menu` ADD FOREIGN KEY (`branch_id`) REFERENCES `branches` (`branch_id`);

ALTER TABLE `branches` ADD FOREIGN KEY (`manager_id`) REFERENCES `employee_branches` (`employee_branches_id`);

ALTER TABLE `reservation_slips` ADD FOREIGN KEY (`branch_id`) REFERENCES `branches` (`branch_id`);

ALTER TABLE `bills` ADD FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`);

ALTER TABLE `service_reviews` ADD FOREIGN KEY (`reservation_slip_id`) REFERENCES `reservation_slips` (`reservation_slip_id`);

ALTER TABLE `reservation_slips` ADD FOREIGN KEY (`member_card_id`) REFERENCES `member_cards` (`member_card_id`);

ALTER TABLE `employee_branches` ADD FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);

-- ALTER TABLE `employees` ADD FOREIGN KEY (`current_branch_id`) REFERENCES `branches` (`branch_id`); 
ALTER TABLE `employees` ADD FOREIGN KEY (`current_work_id`) REFERENCES `employee_branches` (`employee_branches_id`);


ALTER TABLE `employee_branches` ADD FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`);

ALTER TABLE `employee_branches` ADD FOREIGN KEY (`branch_id`) REFERENCES `branches` (`branch_id`);

ALTER TABLE `order_details` ADD FOREIGN KEY (`order_id`, `branch_id`) REFERENCES `orders` (`order_id`, `branch_id`);

ALTER TABLE `order_details` ADD FOREIGN KEY (`branch_id`, `dish_id`) REFERENCES `menu` (`branch_id`, `dish_id`);

ALTER TABLE `menu` ADD FOREIGN KEY (`dish_id`) REFERENCES `dishes` (`dish_id`);

SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));

SET SESSION sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

