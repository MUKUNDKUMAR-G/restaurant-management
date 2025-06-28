USE SuShiXX;

DELIMITER $$

CREATE PROCEDURE CreateUser (
    IN p_user_name VARCHAR(255),
    IN p_user_password VARCHAR(255),
    IN p_user_email VARCHAR(255),
    IN p_user_phone_number VARCHAR(15),
    IN p_user_address TEXT
)
BEGIN
    -- Insert a new record into the Users table
    INSERT INTO `online_account` (
        user_name,
        user_password,
        user_email,
        user_phone_number,
        user_address,
        is_staff,
		staff_id,
		staff_branch,
        is_admin,
        created_at,
        last_visited
    ) VALUES (
        p_user_name,
        p_user_password,
        p_user_email,
        p_user_phone_number,
        p_user_address,
        FALSE,
        NULL,
        NULL,
        FALSE,
        NOW(),
        NOW()
    );
END$$

DELIMITER ;


DELIMITER $$

CREATE PROCEDURE GetRandomEmployeeByDepartment(
    IN p_department_name VARCHAR(255),
    IN p_branch_id INT,
    OUT p_employee_id INT
)
BEGIN
    SELECT eb.employee_id
    INTO p_employee_id
    FROM employee_branches eb
    JOIN departments d ON eb.department_id = d.department_id
    WHERE d.department_name = p_department_name AND eb.branch_id = p_branch_id
    ORDER BY RAND()
    LIMIT 1;
END$$

DELIMITER ;



DELIMITER $$

CREATE PROCEDURE CreateOrder(
    IN p_branch_id INT,
    IN p_user_id INT,
    IN p_cus_name VARCHAR(255),
    IN p_reservation_slip_id INT,
    IN p_order_type ENUM('dine-in','delivery'),
    IN p_status ENUM('waiting_for_guest','serving','billed','in_delivery','delivered', 'cancelled'),
    IN p_dishes JSON, -- JSON array of objects with dish_id and quantity
    IN p_delivery_address VARCHAR(255),
    IN p_delivery_phone VARCHAR(30),
    IN p_shipper INT,
    IN p_delivery_notes TEXT,
    IN p_member_card_id INT,
    OUT p_order_id INT,
    OUT p_delivery_id INT,
    OUT p_order_created_at DATETIME
)
BEGIN
    DECLARE v_total FLOAT DEFAULT 0;
    DECLARE v_discount FLOAT;
    DECLARE v_total_with_benefits FLOAT;
    DECLARE v_member_card_id INT;
    DECLARE v_delivery_id INT DEFAULT NULL;
    DECLARE v_dish_exists INT;
    DECLARE v_dish_id INT;
    DECLARE v_quantity INT;
    DECLARE v_price DECIMAL(10,2);
    DECLARE v_i INT DEFAULT 0;
    DECLARE v_dishes_length INT;

    -- Start transaction
    START TRANSACTION;

    -- Get the length of the dishes array
    SET v_dishes_length = JSON_LENGTH(p_dishes);

    -- Validate all dishes exist in menu before proceeding
    WHILE v_i < v_dishes_length DO
        SET v_dish_id = JSON_UNQUOTE(JSON_EXTRACT(p_dishes, CONCAT('$[', v_i, '].dish_id')));
        SET v_quantity = JSON_UNQUOTE(JSON_EXTRACT(p_dishes, CONCAT('$[', v_i, '].quantity')));
        SET v_price = JSON_UNQUOTE(JSON_EXTRACT(p_dishes, CONCAT('$[', v_i, '].price')));

        -- Check if dish exists in menu for this branch
        SELECT COUNT(*) INTO v_dish_exists
        FROM menu
        WHERE branch_id = p_branch_id AND dish_id = v_dish_id;

        IF v_dish_exists = 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = CONCAT('Dish ID ', CAST(v_dish_id AS CHAR), ' is not available in branch ', CAST(p_branch_id AS CHAR));
        END IF;

        SET v_i = v_i + 1;
    END WHILE;

    -- Insert a new order
    INSERT INTO orders(branch_id, online_user_id, reservation_slip_id, order_type, status, created_at)
    VALUES (p_branch_id, p_user_id, p_reservation_slip_id, p_order_type, p_status, NOW());

    -- Get the ID of the newly inserted order
    SET p_order_id = LAST_INSERT_ID();
    SET p_order_created_at = NOW();

    -- Reset counter for processing dishes
    SET v_i = 0;

    -- Process each dish
    WHILE v_i < v_dishes_length DO
        SET v_dish_id = JSON_UNQUOTE(JSON_EXTRACT(p_dishes, CONCAT('$[', v_i, '].dish_id')));
        SET v_quantity = JSON_UNQUOTE(JSON_EXTRACT(p_dishes, CONCAT('$[', v_i, '].quantity')));
        SET v_price = JSON_UNQUOTE(JSON_EXTRACT(p_dishes, CONCAT('$[', v_i, '].price')));

        -- Insert order details
        INSERT INTO order_details(order_id, branch_id, dish_id, quantity, price, created_at)
        VALUES (p_order_id, p_branch_id, v_dish_id, v_quantity, v_price, p_order_created_at);

        -- Update total amount
        SET v_total = v_total + (v_price * v_quantity);

        SET v_i = v_i + 1;
    END WHILE;

    -- Calculate total with benefits
    -- Find the user's member card and get the discount
    IF p_order_type = 'delivery' THEN
        SELECT member_card_id, discount INTO v_member_card_id, v_discount
        FROM member_cards JOIN card_types ON member_cards.card_type_id = card_types.card_type_id
        WHERE user_id = p_user_id AND is_active = TRUE;
    ELSE 
        SELECT member_card_id, discount INTO v_member_card_id, v_discount
        FROM member_cards JOIN card_types ON member_cards.card_type_id = card_types.card_type_id
        WHERE member_card_id = p_member_card_id;
    END IF;

    -- Apply discount
    IF v_discount IS NOT NULL THEN
        SET v_total_with_benefits = v_total * (1 - v_discount);
    ELSE
        SET v_total_with_benefits = v_total;
    END IF;

    -- Insert bill
    INSERT INTO bills(order_id, total_amount, total_amount_with_benefits, status, created_at)
    VALUES (p_order_id, v_total, v_total_with_benefits, 'paid', NOW());

    -- Handle delivery if order type is 'delivery'
    IF p_order_type = 'delivery' THEN
        INSERT INTO deliveries(order_id, branch_id, cus_name, address, phone_number, notes, status, created_at, shipper)
        VALUES (p_order_id, p_branch_id, p_cus_name, p_delivery_address, p_delivery_phone, p_delivery_notes, 'in progress', NOW(), p_shipper);
        SET v_delivery_id = LAST_INSERT_ID();
    ELSE -- Update the status of reservation
        UPDATE reservation_slips 
        SET status = 'completed'
        WHERE reservation_slip_id = p_reservation_slip_id;
    END IF;

    SET p_delivery_id = v_delivery_id;

    -- Commit transaction
    COMMIT;
    
    SELECT p_order_id, p_delivery_id, p_order_created_at;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE CreateReservationIfAvailable(
    IN p_branch_id INT,
    IN p_cus_name VARCHAR(255),
    IN p_phone_number VARCHAR(30),
    IN p_guests_number INT,
    IN p_arrival_time TIME,
    IN p_arrival_date DATE,
    IN p_notes TEXT,
    IN p_user_id INT,
    OUT p_reservation_slip_id INT,
    OUT p_table_number INT
)
BEGIN
    DECLARE v_table_count INT DEFAULT 0;
    DECLARE v_table_number INT DEFAULT 0;
    DECLARE v_found_table INT DEFAULT 0;

    -- Get the total number of tables in the branch
    SELECT table_amount INTO v_table_count FROM branches WHERE branch_id = p_branch_id;

    -- Loop through each table to check availability
    WHILE v_table_number < v_table_count AND v_found_table = 0 DO
        SET v_table_number = v_table_number + 1;

        -- Check if the table is reserved within the overlapping time frame
        IF NOT EXISTS (
            SELECT 1 FROM reservation_slips
            WHERE branch_id = p_branch_id
            AND table_number = v_table_number
            AND arrival_date = p_arrival_date
			AND status <> 'completed'
            AND status <> 'canceled'
            AND (
                (arrival_time + INTERVAL 2 HOUR > p_arrival_time AND arrival_time < p_arrival_time + INTERVAL 2 HOUR)
                OR (arrival_time < p_arrival_time + INTERVAL 2 HOUR AND arrival_time + INTERVAL 2 HOUR > p_arrival_time)
            )
        ) THEN
            SET v_found_table = 1;
        END IF;
    END WHILE;

    -- If a table is found, create the reservation
    IF v_found_table = 1 THEN
        INSERT INTO reservation_slips (cus_name, phone_number, guests_number, arrival_time, arrival_date, table_number, branch_id, notes, created_at, status, online_account)
        VALUES (p_cus_name, p_phone_number, p_guests_number, p_arrival_time, p_arrival_date, v_table_number, p_branch_id, p_notes, NOW(), 'waiting_for_guest', p_user_id);

        SET p_reservation_slip_id = LAST_INSERT_ID();
        SET p_table_number = v_table_number;

    ELSE
        -- If no table is available, set the output parameters to indicate failure
        SET p_reservation_slip_id = -1; -- No reservation created
        SET p_table_number = -1; -- No table available

    END IF;
END$$

DELIMITER ;


DELIMITER $$

CREATE PROCEDURE UpdateStatusReservation (
    IN p_reservation_slip_id INT,
    IN p_status ENUM('waiting_for_guest', 'table_in_use', 'completed', 'canceled')
)
BEGIN
    -- Update the status to 'canceled'
    UPDATE `reservation_slips`
    SET `status` = p_status
    WHERE `reservation_slip_id` = p_reservation_slip_id;

END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE CreateReviewForReservation(
    IN p_reservation_slip_id INT,
    IN p_service_rating INT,
    IN p_location_rating INT,
    IN p_food_rating INT,
    IN p_price_rating INT,
    IN p_ambiance_rating INT
)
BEGIN
    -- Insert the review into the service_reviews table
    INSERT INTO service_reviews (
        reservation_slip_id, 
        service_rating, 
        location_rating, 
        food_rating, 
        price_rating, 
        ambiance_rating
    )
    VALUES (
        p_reservation_slip_id, 
        p_service_rating, 
        p_location_rating, 
        p_food_rating, 
        p_price_rating, 
        p_ambiance_rating
    );
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE check_reservation_exists(
    IN p_reservation_slip_id INT
)
BEGIN
    -- Check if the reservation slip ID exists in the reservation_slips table
    SELECT reservation_slip_id
    FROM reservation_slips
    WHERE reservation_slip_id = p_reservation_slip_id;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE check_branch_exists(
    IN p_branch_id INT
)
BEGIN
    -- Check if the branch ID exists in the branches table
    SELECT branch_id
    FROM branches
    WHERE branch_id = p_branch_id;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE CreateDishReview(
    IN p_user_id INT,
    IN p_dish_id INT,
    IN p_rating INT,
    IN p_comment TEXT,
    OUT success BOOL
)
BEGIN
    DECLARE existing_review_count INT DEFAULT 0;

    -- Check if a review by this user for this dish already exists
    SELECT COUNT(*) INTO existing_review_count
    FROM review_dishes
    WHERE user_id = p_user_id AND dish_id = p_dish_id;

    IF existing_review_count = 0 THEN
        -- No existing review, insert the new review
        INSERT INTO review_dishes (user_id, dish_id, rating, comment)
        VALUES (p_user_id, p_dish_id, p_rating, p_comment);
        SET success = TRUE;
    ELSE
        -- A review already exists, set the review_id to -1 to indicate failure
        SET success = FALSE;
    END IF;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE check_dish_exists(
    IN p_dish_id INT
)
BEGIN
    -- Check if the reservation slip ID exists in the reservation_slips table
    SELECT dish_id
    FROM dishes
    WHERE dish_id = p_dish_id;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE CreateDish(
    IN p_dish_name VARCHAR(255),
    IN p_price FLOAT,
    IN p_description TEXT,
    IN p_category_name VARCHAR(255),
    IN p_image_link VARCHAR(255)
)
BEGIN
	DECLARE v_dish_id INT DEFAULT 0;
    INSERT INTO dishes (dish_name, price, description, category_name, image_link)
    VALUES (p_dish_name, p_price, p_description, p_category_name, p_image_link);
    
    SET v_dish_id = LAST_INSERT_ID();

    SELECT dish_id, dish_name, price, description, category_name, image_link
    FROM dishes
    WHERE dish_id = v_dish_id;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE AddDishToMenu(
    IN p_dish_id INT,
    IN p_branch_id INT,
    IN p_is_ship BOOL
)
BEGIN
    -- Check if the dish already exists in the menu for the branch
    IF EXISTS (
        SELECT 1 FROM menu
        WHERE dish_id = p_dish_id AND branch_id = p_branch_id
    ) THEN
        -- If it exists, update is_serve based on the provided value
        UPDATE menu
        SET is_serve = 1, is_ship = p_is_ship
        WHERE dish_id = p_dish_id AND branch_id = p_branch_id;
    ELSE
        -- If it does not exist, insert the new record
        INSERT INTO menu (branch_id, dish_id, is_ship)
        VALUES (p_branch_id, p_dish_id, p_is_ship);
    END IF;
END$$

DELIMITER ;


DELIMITER $$

CREATE PROCEDURE check_menu_exists(
    IN p_dish_id INT,
    IN p_branch_id INT
)
BEGIN
    SELECT dish_id, branch_id, is_serve
    FROM menu
    WHERE dish_id = p_dish_id AND branch_id = p_branch_id;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE RemoveDishFromMenu(
    IN p_dish_id INT,
    IN p_branch_id INT
)
BEGIN
    UPDATE menu
    SET is_serve = 0
    WHERE dish_id = p_dish_id AND branch_id = p_branch_id;
END$$

DELIMITER ;

-- Stored Procedure: CreateEmployee
DELIMITER $$

CREATE PROCEDURE CreateEmployee (
    IN p_employee_name VARCHAR(255),
    IN p_employee_email VARCHAR(255),
    IN p_date_of_birth DATE,
    IN p_gender ENUM('Male','Female','Other'),
    IN p_employee_phone_number VARCHAR(30),
    IN p_employee_address VARCHAR(255)
)
BEGIN
    INSERT INTO employees (
        employee_name,
        employee_email,
        date_of_birth,
        gender,
        employee_phone_number,
        employee_address,
        current_work_id,
        hire_date,
        quit_date,
        employee_rating
    ) VALUES (
        p_employee_name,
        p_employee_email,
        p_date_of_birth,
        p_gender,
        p_employee_phone_number,
        p_employee_address,
        NULL,
        NOW(),
        NULL,
        0
    );

    SELECT * FROM employees WHERE employee_id = LAST_INSERT_ID();
END$$

DELIMITER ;


DELIMITER $$

CREATE PROCEDURE UpdateEmployeeQuitDate (
    IN p_employee_id INT
)
BEGIN
    UPDATE employees
    SET quit_date = NOW()
    WHERE employee_id = p_employee_id;
END$$

DELIMITER ;

-- Stored Procedure: CheckEmployeeExists
DELIMITER $$

CREATE PROCEDURE CheckEmployeeExists (
    IN p_employee_id INT
)
BEGIN
    SELECT employee_id 
    FROM employees 
    WHERE employee_id = p_employee_id AND quit_date IS NULL;
END$$

DELIMITER ;

-- Stored Procedure: CreateDepartment
DELIMITER $$

CREATE PROCEDURE CreateDepartment (
    IN p_department_name VARCHAR(255),
    IN p_salary INT
)
BEGIN
    INSERT INTO departments (
        department_name,
        salary
    ) VALUES (
        p_department_name,
        p_salary
    );

    -- Select the newly inserted department
    SELECT * FROM departments WHERE department_id = LAST_INSERT_ID();
END$$

DELIMITER ;

-- UpdateEmployeeInfo: partially updates employee information
DELIMITER $$
CREATE PROCEDURE UpdateEmployeeInfo (
    IN p_employee_id INT,
    IN p_employee_name VARCHAR(255),
    IN p_employee_email VARCHAR(255),
    IN p_date_of_birth DATETIME,
    IN p_gender ENUM('Male','Female','Other'),
    IN p_employee_phone_number VARCHAR(30)
)
BEGIN
    UPDATE employees
    SET
        employee_name = IFNULL(p_employee_name, employee_name),
        employee_email = IFNULL(p_employee_email, employee_email),
        date_of_birth = IFNULL(p_date_of_birth, date_of_birth),
        gender = IFNULL(p_gender, gender),
        employee_phone_number = IFNULL(p_employee_phone_number, employee_phone_number)
    WHERE employee_id = p_employee_id;
END$$
DELIMITER ;

-- UpdateEndDateEmployeeBranch: sets end_date = NOW() for the current working branch record
DELIMITER $$
CREATE PROCEDURE UpdateEndDateEmployeeBranch (
    IN p_employee_id INT
)
BEGIN
    UPDATE employee_branches
    SET end_date = NOW()
    WHERE employee_branches_id = (
        SELECT current_work_id FROM employees WHERE employee_id = p_employee_id
    )
    AND end_date IS NULL; -- Only update if not already ended
    
    UPDATE branches
	SET manager_id = NULL
    WHERE manager_id = p_employee_id;
END$$
DELIMITER ;

-- SetCurrentWorkNull: sets the employee's current_work_id to NULL
DELIMITER $$
CREATE PROCEDURE SetCurrentWorkNull (
    IN p_employee_id INT
)
BEGIN
    UPDATE employees
    SET current_work_id = NULL
    WHERE employee_id = p_employee_id;
END$$
DELIMITER ;

-- DethroneCurrentManager: find the manager of the specified branch, set end_date = NOW(), and remove their current_work_id
DELIMITER $$
CREATE PROCEDURE DethroneCurrentManager (
    IN p_branch_id INT
)
BEGIN
    -- Step 1: Identify the manager's employee_branches_id
    SELECT employee_branches_id INTO @old_manager_e_b_id
    FROM employee_branches
    WHERE branch_id = p_branch_id
      AND department_id = (
          SELECT department_id FROM departments WHERE department_name = 'Manager'
      )
      AND end_date IS NULL
    LIMIT 1;

    -- Step 2: If a manager was found, set their end_date
    IF @old_manager_e_b_id IS NOT NULL THEN
        UPDATE employee_branches
        SET end_date = NOW()
        WHERE employee_branches_id = @old_manager_e_b_id;

        -- Step 3: Clear the current_work_id on employees
        UPDATE employees
        SET current_work_id = NULL
        WHERE current_work_id = @old_manager_e_b_id;
        
    END IF;
END$$
DELIMITER ;

-- InsertEmployeeBranchRecord: inserts a new row in employee_branches with start_date = NOW(),
-- and returns the newly inserted employee_branches_id
DELIMITER $$
CREATE PROCEDURE InsertEmployeeBranchRecord (
    IN p_employee_id INT,
    IN p_branch_id INT,
    IN p_department_id INT
)
BEGIN
    INSERT INTO employee_branches (
        employee_id,
        branch_id,
        department_id,
        start_date
    ) VALUES (
        p_employee_id,
        p_branch_id,
        p_department_id,
        NOW()
    );

	-- Check if the department is for a Manager
    IF (SELECT department_name FROM departments WHERE department_id = p_department_id) = 'Manager' THEN
        -- Update the manager_id in the branches table
        UPDATE branches
        SET manager_id = p_employee_id
        WHERE branch_id = p_branch_id;
    END IF;
    
    SELECT LAST_INSERT_ID() AS new_employee_branches_id;
END$$
DELIMITER ;

-- SetCurrentWorkId: updates employees table to set current_work_id to the new record
DELIMITER $$
CREATE PROCEDURE SetCurrentWorkId (
    IN p_employee_id INT,
    IN p_employee_branches_id INT
)
BEGIN
    UPDATE employees
    SET current_work_id = p_employee_branches_id
    WHERE employee_id = p_employee_id;
END$$
DELIMITER ;

DELIMITER $$

CREATE PROCEDURE GetBranchId(IN p_branch_name VARCHAR(255))
BEGIN
    SELECT branch_id
    FROM branches
    WHERE branch_name = p_branch_name;
END $$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE GetDepartmentId(IN p_department_name VARCHAR(255))
BEGIN
    SELECT department_id
    FROM departments
    WHERE department_name = p_department_name;
END $$

DELIMITER ;

-- Stored Procedure: UpdateDepartmentInfo
DELIMITER $$

CREATE PROCEDURE UpdateDepartmentInfo (
    IN p_department_id INT,
    IN p_department_name VARCHAR(255),
    IN p_salary INT
)
BEGIN
    UPDATE departments
    SET
        department_name = IFNULL(p_department_name, department_name),
        salary = IFNULL(p_salary, salary)
    WHERE department_id = p_department_id;
END$$

DELIMITER ;

-- Stored Procedure: UpdateOrderStatus
DELIMITER $$

CREATE PROCEDURE UpdateOrderStatus (
    IN p_order_id INT,
    IN p_order_status VARCHAR(50)
)
BEGIN
    UPDATE orders
    SET
        status = p_order_status
    WHERE
        order_id = p_order_id;
END$$

DELIMITER ;

-- Stored Procedure: UpdateDishInfo
DELIMITER $$

CREATE PROCEDURE UpdateDishInfo (
    IN p_dish_id INT,
    IN p_dish_name VARCHAR(255),
    IN p_price INT,
    IN p_description TEXT,
    IN p_category_name VARCHAR(255),
    IN p_image_link VARCHAR(2083)
)
BEGIN
    UPDATE dishes
    SET
        dish_name = IFNULL(p_dish_name, dish_name),
        price = IFNULL(p_price, price),
        description = IFNULL(p_description, description),
        category_name = IFNULL(p_category_name, category_name),
        image_link = IFNULL(p_image_link, image_link)
    WHERE dish_id = p_dish_id;
END$$

DELIMITER ;

-- Stored Procedure: UpdateUserInfo
DELIMITER $$

CREATE PROCEDURE UpdateUserInfo (
    IN p_user_id INT,
    IN p_user_name VARCHAR(255),
    IN p_user_email VARCHAR(255),
    IN p_user_address VARCHAR(500),
    IN p_user_phone_number VARCHAR(20)
)
BEGIN
    UPDATE online_account
    SET
        user_name = IFNULL(p_user_name, user_name),
        user_email = IFNULL(p_user_email, user_email),
        user_address = IFNULL(p_user_address, user_address),
        user_phone_number = IFNULL(p_user_phone_number, user_phone_number),
        update_at = NOW()
    WHERE user_id = p_user_id;
END$$

DELIMITER ;

-- Stored Procedure: UpdateUserPassword
DELIMITER $$

CREATE PROCEDURE UpdateUserPassword (
    IN p_user_id INT,
    IN p_new_password VARCHAR(255)
)
BEGIN
    UPDATE online_account
    SET
        user_password = p_new_password
    WHERE user_id = p_user_id;
END$$

DELIMITER ;


-- Stored Procedure: CreateBranch
DELIMITER $$

CREATE PROCEDURE CreateBranch (
	IN p_region_id INT,
    IN p_branch_name VARCHAR(255),
    IN p_address VARCHAR(500),
    IN p_open_time TIME,
    IN p_close_time TIME,
    IN p_phone_number VARCHAR(20),
    IN p_email VARCHAR(255),
    IN p_has_car_park BOOLEAN,
    IN p_has_motorbike_park BOOLEAN,
    IN p_table_amount INT
)
BEGIN
    INSERT INTO branches (
		region_id,
        branch_name,
        address,
        open_time,
        close_time,
        phone_number,
        email,
        has_car_park,
        has_motorbike_park,
        table_amount
    ) VALUES (
		p_region_id,
        p_branch_name,
        p_address,
        p_open_time,
        p_close_time,
        p_phone_number,
        p_email,
        p_has_car_park,
        p_has_motorbike_park,
        p_table_amount
    );

    SELECT * FROM branches WHERE branch_id = LAST_INSERT_ID();
END$$

DELIMITER ;

-- Stored Procedure: UpdateBranchInfo
DELIMITER $$

CREATE PROCEDURE UpdateBranchInfo (
    IN p_branch_id INT,
    IN p_branch_name VARCHAR(255),
    IN p_address VARCHAR(500),
    IN p_open_time TIME,
    IN p_close_time TIME,
    IN p_phone_number VARCHAR(20),
    IN p_email VARCHAR(255),
    IN p_has_car_park BOOLEAN,
    IN p_has_motorbike_park BOOLEAN,
    IN p_table_amount INT
)
BEGIN
    UPDATE branches
    SET
        branch_name = IFNULL(p_branch_name, branch_name),
        address = IFNULL(p_address, address),
        open_time = IFNULL(p_open_time, open_time),
        close_time = IFNULL(p_close_time, close_time),
        phone_number = IFNULL(p_phone_number, phone_number),
        email = IFNULL(p_email, email),
        has_car_park = IFNULL(p_has_car_park, has_car_park),
        has_motorbike_park = IFNULL(p_has_motorbike_park, has_motorbike_park),
        table_amount = IFNULL(p_table_amount, table_amount)
    WHERE branch_id = p_branch_id;

    SELECT * FROM branches WHERE branch_id = p_branch_id;
END$$

DELIMITER ;

-- Stored Procedure: CreateMemberCard
DELIMITER $$

CREATE PROCEDURE CreateMemberCard (
    IN p_member_id INT,
    IN p_member_name VARCHAR(50),
    IN p_member_phone_number VARCHAR(30),
    IN p_member_gender ENUM('Male','Female','Other'),
    IN p_card_issuer INT,
    IN p_branch_created INT
)
BEGIN
    INSERT INTO member_cards (
        created_at,
        updated_at,
        total_points,
        card_issuer,
        branch_created,
        card_type_id,
        member_id,
        member_name,
        member_phone_number,
        member_gender,
        user_id,
        is_active
    ) VALUES (
        NOW(),
        NOW(),
        0,
        p_card_issuer,
        p_branch_created,
        1,
        p_member_id,
        p_member_name,
        p_member_phone_number,
        p_member_gender,
        NULL,
        TRUE
    );
    
    SELECT * FROM member_cards WHERE member_card_id = LAST_INSERT_ID();
END$$

DELIMITER ;

-- Stored Procedure: UpdateMemberCardInfo
DELIMITER $$

CREATE PROCEDURE UpdateMemberCardInfo (
    IN p_member_card_id INT,
    IN p_member_id INT,
    IN p_member_name VARCHAR(50),
    IN p_member_phone_number VARCHAR(30),
    IN p_member_gender ENUM('Male','Female','Other'),
    IN p_user_id INT,
    IN p_is_active BOOL
)
BEGIN
    UPDATE member_cards
    SET
        member_id = IFNULL(p_member_id, member_id),
        member_name = IFNULL(p_member_name, member_name),
        member_phone_number = IFNULL(p_member_phone_number, member_phone_number),
        member_gender = IFNULL(p_member_gender, member_gender),
        user_id = IFNULL(p_user_id, user_id),
        is_active = IFNULL(p_is_active, is_active),
        updated_at = NOW()
    WHERE member_card_id = p_member_card_id;

    SELECT * FROM member_cards WHERE member_card_id = p_member_card_id;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE CheckUserValidAndNotAdminOrStaff(IN userId INT)
BEGIN
    SELECT user_id
    FROM online_account
    WHERE user_id = userId
    AND is_admin = 0 AND is_staff = 0;
	
END $$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE GetDynamicItems(
    IN p_query_name VARCHAR(255),
    IN p_query VARCHAR(255),
    IN p_page INT,
    IN p_limit INT,
    IN p_tableName VARCHAR(255),
    IN p_orderByField VARCHAR(255),
    IN p_orderByDirection VARCHAR(4),
    IN p_category_name VARCHAR(255),
    IN p_category VARCHAR(255),
	IN p_branch_name VARCHAR(255),
    IN p_branch_id VARCHAR(255),
    IN p_id_name VARCHAR(255),
    -- NEW: Specify which columns to SELECT
    IN p_selectFields VARCHAR(1000),
    -- NEW: Optional JOIN clause, e.g. "LEFT JOIN other_table ON main_table.id = other_table.main_id"
    IN p_joinClause VARCHAR(1000),
    OUT p_totalRecords INT
)
BEGIN
    -- Initialize user-defined variables
    SET @start = (p_page - 1) * p_limit;
    SET @search = CONCAT('%', p_query, '%');
    SET @limit = p_limit;

    -- --------------------------------------------------------------------------
    -- 1) Build and execute the COUNT query
    -- --------------------------------------------------------------------------
    
    -- Using p_joinClause in the FROM part of the statement
    SET @sql_count = CONCAT(
        'SELECT COUNT(*) INTO @total FROM ', 
         p_tableName, ' ',
         IFNULL(p_joinClause, ''),  -- Safeguard if p_joinClause is NULL
        ' WHERE ', 
        p_query_name, ' LIKE ?'
    );

    -- Append category filter if provided
    IF p_category IS NOT NULL AND p_category <> '' THEN
        SET @sql_count = CONCAT(@sql_count, ' AND ', p_category_name, ' = ?');
    END IF;

    -- Append branch_id filter if provided
    IF p_branch_id IS NOT NULL AND p_branch_id <> '' THEN
        SET @sql_count = CONCAT(@sql_count, ' AND ', p_branch_name, ' = ?');
    END IF;

    -- Filter out soft-deleted employees
    IF p_tableName = 'employees' THEN
        SET @sql_count = CONCAT(@sql_count, ' AND employees.quit_date IS NULL');
    END IF;

    -- Prepare the COUNT statement
    PREPARE count_stmt FROM @sql_count;

    -- Execute the COUNT statement with appropriate parameters
    IF p_category IS NOT NULL AND p_category <> '' 
       AND p_branch_id IS NOT NULL AND p_branch_id <> '' THEN
        SET @category = p_category;
        SET @branch_id = p_branch_id;
        EXECUTE count_stmt USING @search, @category, @branch_id;
    ELSEIF p_category IS NOT NULL AND p_category <> '' THEN
        SET @category = p_category;
        EXECUTE count_stmt USING @search, @category;
    ELSEIF p_branch_id IS NOT NULL AND p_branch_id <> '' THEN
        SET @branch_id = p_branch_id;
        EXECUTE count_stmt USING @search, @branch_id;
    ELSE
        EXECUTE count_stmt USING @search;
    END IF;

    -- Deallocate the prepared COUNT statement
    DEALLOCATE PREPARE count_stmt;

    -- Assign the count result to the output parameter
    SET p_totalRecords = @total;

    -- --------------------------------------------------------------------------
    -- 2) Build and execute the SELECT query
    -- --------------------------------------------------------------------------

    -- Use p_selectFields and p_joinClause in the SELECT part
    -- If p_selectFields is empty, default to '*'
    SET @actualSelectFields = IF(p_selectFields IS NOT NULL AND p_selectFields <> '', p_selectFields, '*');

    SET @sql_select = CONCAT(
        'SELECT ', @actualSelectFields, 
        ' FROM ', p_tableName, ' ',
        IFNULL(p_joinClause, ''),  -- Safeguard if p_joinClause is NULL
        ' WHERE ', 
        p_query_name, ' LIKE ?'
    );

    -- Append category filter if provided
    IF p_category IS NOT NULL AND p_category <> '' THEN
        SET @sql_select = CONCAT(@sql_select, ' AND ', p_category_name, ' = ?');
    END IF;

    -- Append branch_id filter if provided
    IF p_branch_id IS NOT NULL AND p_branch_id <> '' THEN
        SET @sql_select = CONCAT(@sql_select, ' AND ', p_branch_name, ' = ?');
    END IF;

    -- Filter out soft-deleted employees
    IF p_tableName = 'employees' THEN
        SET @sql_select = CONCAT(@sql_select, ' AND employees.quit_date IS NULL');
    END IF;

    -- Append ORDER BY clause
    IF p_orderByField IS NOT NULL AND p_orderByField <> '' THEN
        SET @orderBy = CONCAT(' ORDER BY ', p_orderByField, ' ', p_orderByDirection);
    ELSE
        SET @orderBy = CONCAT(' ORDER BY ', p_id_name, ' ASC'); 
    END IF;

    SET @sql_select = CONCAT(@sql_select, @orderBy, ' LIMIT ?, ?');

    -- Prepare the SELECT statement
    PREPARE select_stmt FROM @sql_select;

    -- Execute the SELECT statement with appropriate parameters
    IF p_category IS NOT NULL AND p_category <> '' 
       AND p_branch_id IS NOT NULL AND p_branch_id <> '' THEN
        EXECUTE select_stmt USING @search, @category, @branch_id, @start, @limit;
    ELSEIF p_category IS NOT NULL AND p_category <> '' THEN
        EXECUTE select_stmt USING @search, @category, @start, @limit;
    ELSEIF p_branch_id IS NOT NULL AND p_branch_id <> '' THEN
        EXECUTE select_stmt USING @search, @branch_id, @start, @limit;
    ELSE
        EXECUTE select_stmt USING @search, @start, @limit;
    END IF;

    -- Deallocate the prepared SELECT statement
    DEALLOCATE PREPARE select_stmt;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE CheckUserExists(
    IN p_user_id INT
)
BEGIN
    -- Check if the reservation slip ID exists in the reservation_slips table
    SELECT user_id
    FROM online_account
    WHERE user_id = p_user_id;
END$$

DELIMITER ;


DELIMITER $$

CREATE PROCEDURE GetUserId(
	IN p_email VARCHAR(255)
)
BEGIN 
	SELECT user_id
    FROM online_account
    WHERE user_email = p_email;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE GetEmployeeInformation (
    IN inputEmployeeId INT
)
BEGIN
    SELECT 
        e.employee_id,
        e.employee_name,
        e.employee_email,
        e.date_of_birth,
        e.gender,
        e.hire_date,
        e.quit_date,
        eb.branch_id AS current_branch_id,
        b.branch_name AS current_branch_name,
        eb.department_id,
        d.department_name,
        d.salary,
        e.employee_phone_number,
        e.employee_address,
        e.employee_rating
    FROM 
        employees e
    LEFT JOIN 
        employee_branches eb ON e.current_work_id = eb.employee_branches_id
    LEFT JOIN 
        branches b ON eb.branch_id = b.branch_id
    LEFT JOIN 
        departments d ON eb.department_id = d.department_id
    WHERE 
        e.employee_id = inputEmployeeId;
END $$

DELIMITER ;

-- drop procedure GetEmployeeInformation;

DELIMITER $$

CREATE PROCEDURE getBranch()
BEGIN
    SELECT 
        branch_id,
        branch_name,
        address,
        open_time,
        close_time,
        phone_number,
        has_car_park,
        has_motorbike_park,
        table_amount,
        region_id,
        manager_id
    FROM branches;
END$$

DELIMITER ;

-- drop procedure getBranch;

DELIMITER $$

CREATE PROCEDURE getDepartment()
BEGIN
    SELECT 
		department_id,
        department_name 
    FROM 
        departments;
END $$

DELIMITER ;

-- drop procedure getDepartment;
DELIMITER $$
CREATE PROCEDURE GetEmployeeDetailsById (
    IN inputEmployeeId INT
)
BEGIN
    SELECT 
        e.employee_id,
        e.employee_name,
        e.gender,
        e.employee_phone_number,
        d.department_name,
        b.branch_name
    FROM 
        employees e
    LEFT JOIN 
        employee_branches eb ON e.current_work_id = eb.employee_branches_id
    LEFT JOIN 
        branches b ON eb.branch_id = b.branch_id
    LEFT JOIN 
        departments d ON eb.department_id = d.department_id
    WHERE 
        e.employee_id = inputEmployeeId;
END $$

DELIMITER ;

-- drop procedure GetEmployeeDetailsById;

-- Get dish Detail
DELIMITER $$
create procedure GetDishDetail(
	in dishID int
)
begin
	select * from dishes d where d.dish_id=dishID;
end$$




DELIMITER $$
-- GetBillDetail
CREATE PROCEDURE GetBillDetail (
    IN Bill_ID INT
)
BEGIN
    SELECT b.*, o.dish_id, d.dish_name, o.quantity, o.price
    FROM bills b
    JOIN order_details o ON o.order_id = b.order_id
    JOIN dishes d ON d.dish_id = o.dish_id
    WHERE b.bill_id = Bill_ID;
END$$

DELIMITER ;

DELIMITER $$
create procedure GetDishInBill(
	in bill_id int
)
begin
	SELECT d.dish_name, o.quantity, o.price 
    FROM bills b
    join order_details o on o.order_id = b.order_id
    join dishes d on o.dish_id = d.dish_id
    WHERE b.bill_id = bill_id;
end$$
DELIMITER ;

-- Get Contract

DELIMITER $$
create procedure GetContract(
	in branch_ID int
)
begin
	select *
    from branches b
    where b.branch_id=branch_ID;
end$$
DELIMITER ;

-- Get UserInformation
DELIMITER $$
CREATE PROCEDURE GetUserInformation(
    IN UserID INT
)
BEGIN
    SELECT 
        o.user_name, 
        o.user_email, 
        o.user_address, 
        o.user_phone_number, 
        m.member_card_id, 
        (CASE 
            WHEN m.card_type_id = 1 THEN 'Membership'
            WHEN m.card_type_id = 2 THEN 'Silver'
            WHEN m.card_type_id = 3 THEN 'Gold'
            ELSE 'Unknown'
        END) AS card_level
    FROM online_account o
    LEFT JOIN member_cards m ON m.user_id = o.user_id
    WHERE o.user_id = UserID;
END $$
DELIMITER ;

-- Get order-online by id
DELIMITER $$
create procedure GetOrderOnlineById(
	in order_ID int
)
begin 
	select o.order_id,
    o.branch_id,
    o.order_type, 
    o.created_at, 
    o.status, 
    d.shipper, 
    b.total_amount_with_benefits
    from orders o
    join deliveries d on d.order_id = o.order_id
    join bills b on b.order_id = o.order_id
    where o.order_id = order_ID;
    
end$$
DELIMITER ;


-- Get dishes in order
DELIMITER $$
create procedure GetDishesInOrder(
	in order_ID int
)
begin 
	select d.dish_name, d.image_link, d.description, o.quantity, o.price
    from order_details o
    join dishes d on d.dish_id = o.dish_id
    where o.order_id = order_ID;
    
end$$
DELIMITER ;

DELIMITER $$

CREATE PROCEDURE GetAnalysis(
  IN p_branch_id INT,
  IN p_time_type VARCHAR(20),
  IN p_month INT,
  IN p_year INT,
  IN p_quarter INT,
  IN p_start_year INT,
  IN p_end_year INT
)
BEGIN
    DECLARE v_start_date DATE;
    DECLARE v_end_date DATE;

    /*
      1. Compute date ranges for v_start_date and v_end_date
      2. We'll do separate grouping logic (CASE-based) inside subqueries
    */

    IF p_time_type = 'Daily' THEN
        IF p_month IS NULL OR p_year IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For Daily reports, month and year are required.';
        END IF;
        SET v_start_date = MAKEDATE(p_year, 1) + INTERVAL (p_month - 1) MONTH;
        SET v_end_date   = LAST_DAY(v_start_date);
    ELSEIF p_time_type = 'Monthly' THEN
        IF p_year IS NULL OR p_quarter IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For Monthly reports, year and quarter are required.';
        END IF;
        SET v_start_date = STR_TO_DATE(CONCAT(p_year, '-', (p_quarter - 1) * 3 + 1, '-01'), '%Y-%m-%d');
        SET v_end_date   = LAST_DAY(DATE_ADD(v_start_date, INTERVAL 2 MONTH));
    ELSEIF p_time_type = 'Quarterly' THEN
        IF p_year IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For Quarterly reports, year is required.';
        END IF;
        SET v_start_date = MAKEDATE(p_year, 1);
        SET v_end_date   = LAST_DAY(DATE_ADD(v_start_date, INTERVAL 11 MONTH));
    ELSEIF p_time_type = 'Overall' THEN
        IF p_start_year IS NULL OR p_end_year IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'For Overall reports, start_year and end_year are required.';
        END IF;
        SET v_start_date = MAKEDATE(p_start_year, 1);
        SET v_end_date   = LAST_DAY(MAKEDATE(p_end_year, 1) + INTERVAL 11 MONTH);
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid time_type parameter.';
    END IF;

    /*
      3. Aggregate Metrics: totalRevenue, orders, customers
    */
    SELECT
        SUM(COALESCE(b.total_amount_with_benefits, 0)) AS totalRevenue,
        COUNT(o.order_id) AS orders,
        SUM(COALESCE(r.guests_number, 1)) AS customers
    INTO
        @totalRevenue,
        @orders,
        @customers
    FROM orders o
    LEFT JOIN reservation_slips r
           ON o.reservation_slip_id = r.reservation_slip_id
    LEFT JOIN bills b
           ON o.order_id = b.order_id
    WHERE o.created_at BETWEEN v_start_date AND v_end_date
      AND o.branch_id = p_branch_id;

    /*
      4. Build Revenue Stats arrays (label, revenue).
         We'll do a sub-select grouped by day, month, quarter, or year
         based on p_time_type. Then in the outer select we use JSON_ARRAYAGG.
    */
    -- Sub-select to compute daily/monthly/quarterly/yearly sums
    IF p_time_type = 'Daily' THEN
        -- Daily grouping: use DATE_FORMAT as '%Y-%m-%d' or just day of month
        SELECT
          JSON_ARRAYAGG(sub.label) AS revenueLabelsJSON,
          JSON_ARRAYAGG(sub.revenue) AS revenueDataJSON
        INTO
          @revenueLabelsJSON,
          @revenueDataJSON
        FROM (
          SELECT
            DATE_FORMAT(o.created_at, '%d') AS label,  -- day of month
            SUM(COALESCE(b.total_amount_with_benefits, 0)) AS revenue
          FROM orders o
          LEFT JOIN bills b ON o.order_id = b.order_id
          WHERE o.created_at BETWEEN v_start_date AND v_end_date
            AND o.branch_id = p_branch_id
          GROUP BY DATE_FORMAT(o.created_at, '%d')
        ) AS sub;

    ELSEIF p_time_type = 'Monthly' THEN
        -- Monthly grouping: use DATE_FORMAT as '%m' or '%b' or '%M'
        SELECT
          JSON_ARRAYAGG(sub.label) AS revenueLabelsJSON,
          JSON_ARRAYAGG(sub.revenue) AS revenueDataJSON
        INTO
          @revenueLabelsJSON,
          @revenueDataJSON
        FROM (
          SELECT
            DATE_FORMAT(o.created_at, '%M') AS label,  -- Full month name
            SUM(COALESCE(b.total_amount_with_benefits, 0)) AS revenue
          FROM orders o
          LEFT JOIN bills b ON o.order_id = b.order_id
          WHERE o.created_at BETWEEN v_start_date AND v_end_date
            AND o.branch_id = p_branch_id
          GROUP BY DATE_FORMAT(o.created_at, '%M')
        ) AS sub;

    ELSEIF p_time_type = 'Quarterly' THEN
        SELECT
          JSON_ARRAYAGG(sub.label) AS revenueLabelsJSON,
          JSON_ARRAYAGG(sub.revenue) AS revenueDataJSON
        INTO
          @revenueLabelsJSON,
          @revenueDataJSON
        FROM (
          SELECT
            QUARTER(o.created_at) AS label,
            SUM(COALESCE(b.total_amount_with_benefits, 0)) AS revenue
          FROM orders o
          LEFT JOIN bills b ON o.order_id = b.order_id
          WHERE o.created_at BETWEEN v_start_date AND v_end_date
            AND o.branch_id = p_branch_id
          GROUP BY QUARTER(o.created_at)
        ) AS sub;

    ELSEIF p_time_type = 'Overall' THEN
        SELECT
          JSON_ARRAYAGG(sub.label) AS revenueLabelsJSON,
          JSON_ARRAYAGG(sub.revenue) AS revenueDataJSON
        INTO
          @revenueLabelsJSON,
          @revenueDataJSON
        FROM (
          SELECT
            DATE_FORMAT(o.created_at, '%Y') AS label,
            SUM(COALESCE(b.total_amount_with_benefits, 0)) AS revenue
          FROM orders o
          LEFT JOIN bills b ON o.order_id = b.order_id
          WHERE o.created_at BETWEEN v_start_date AND v_end_date
            AND o.branch_id = p_branch_id
          GROUP BY DATE_FORMAT(o.created_at, '%Y')
        ) AS sub;
    END IF;

    /*
      5. Build Services Rate Stats arrays (label, service_rate).
         Very similar approach with sub-select + JSON_ARRAYAGG.
    */
    IF p_time_type = 'Daily' THEN
        SELECT
          JSON_ARRAYAGG(sub.label) AS serviceLabelsJSON,
          JSON_ARRAYAGG(sub.service_rate) AS serviceDataJSON
        INTO
          @serviceLabelsJSON,
          @serviceDataJSON
        FROM (
          SELECT
            DATE_FORMAT(o.created_at, '%d') AS label,
            ROUND(AVG(
              (COALESCE(sr.service_rating, 5) +
               COALESCE(sr.location_rating, 5) +
               COALESCE(sr.food_rating, 5) +
               COALESCE(sr.price_rating, 5) +
               COALESCE(sr.ambiance_rating, 5)) / 5
            ), 2) AS service_rate
          FROM orders o
          LEFT JOIN reservation_slips r ON o.reservation_slip_id = r.reservation_slip_id
          LEFT JOIN service_reviews sr ON sr.reservation_slip_id = r.reservation_slip_id
          LEFT JOIN bills b ON o.order_id = b.order_id
          WHERE o.created_at BETWEEN v_start_date AND v_end_date
            AND o.branch_id = p_branch_id
          GROUP BY DATE_FORMAT(o.created_at, '%d')
        ) AS sub;

    ELSEIF p_time_type = 'Monthly' THEN
        SELECT
          JSON_ARRAYAGG(sub.label ) AS serviceLabelsJSON,
          JSON_ARRAYAGG(sub.service_rate ) AS serviceDataJSON
        INTO
          @serviceLabelsJSON,
          @serviceDataJSON
        FROM (
          SELECT
            DATE_FORMAT(o.created_at, '%M') AS label,
            ROUND(AVG(
              (COALESCE(sr.service_rating, 5) +
               COALESCE(sr.location_rating, 5) +
               COALESCE(sr.food_rating, 5) +
               COALESCE(sr.price_rating, 5) +
               COALESCE(sr.ambiance_rating, 5)) / 5
            ), 2) AS service_rate
          FROM orders o
          LEFT JOIN reservation_slips r ON o.reservation_slip_id = r.reservation_slip_id
          LEFT JOIN service_reviews sr ON sr.reservation_slip_id = r.reservation_slip_id
          LEFT JOIN bills b ON o.order_id = b.order_id
          WHERE o.created_at BETWEEN v_start_date AND v_end_date
            AND o.branch_id = p_branch_id
          GROUP BY DATE_FORMAT(o.created_at, '%M')
        ) AS sub;

    ELSEIF p_time_type = 'Quarterly' THEN
        SELECT
          JSON_ARRAYAGG(sub.label) AS serviceLabelsJSON,
          JSON_ARRAYAGG(sub.service_rate) AS serviceDataJSON
        INTO
          @serviceLabelsJSON,
          @serviceDataJSON
        FROM (
          SELECT
            QUARTER(o.created_at) AS label,
            ROUND(AVG(
              (COALESCE(sr.service_rating, 5) +
               COALESCE(sr.location_rating, 5) +
               COALESCE(sr.food_rating, 5) +
               COALESCE(sr.price_rating, 5) +
               COALESCE(sr.ambiance_rating, 5)) / 5
            ), 2) AS service_rate
          FROM orders o
          LEFT JOIN reservation_slips r ON o.reservation_slip_id = r.reservation_slip_id
          LEFT JOIN service_reviews sr ON sr.reservation_slip_id = r.reservation_slip_id
          LEFT JOIN bills b ON o.order_id = b.order_id
          WHERE o.created_at BETWEEN v_start_date AND v_end_date
            AND o.branch_id = p_branch_id
          GROUP BY QUARTER(o.created_at)
        ) AS sub;

    ELSEIF p_time_type = 'Overall' THEN
        SELECT
          JSON_ARRAYAGG(sub.label ) AS serviceLabelsJSON,
          JSON_ARRAYAGG(sub.service_rate) AS serviceDataJSON
        INTO
          @serviceLabelsJSON,
          @serviceDataJSON
        FROM (
          SELECT
            DATE_FORMAT(o.created_at, '%Y') AS label,
            ROUND(AVG(
              (COALESCE(sr.service_rating, 5) +
               COALESCE(sr.location_rating, 5) +
               COALESCE(sr.food_rating, 5) +
               COALESCE(sr.price_rating, 5) +
               COALESCE(sr.ambiance_rating, 5)) / 5
            ), 2) AS service_rate
          FROM orders o
          LEFT JOIN reservation_slips r ON o.reservation_slip_id = r.reservation_slip_id
          LEFT JOIN service_reviews sr ON sr.reservation_slip_id = r.reservation_slip_id
          LEFT JOIN bills b ON o.order_id = b.order_id
          WHERE o.created_at BETWEEN v_start_date AND v_end_date
            AND o.branch_id = p_branch_id
          GROUP BY DATE_FORMAT(o.created_at, '%Y')
        ) AS sub;
    END IF;

    /*
      6. Final Output
    */
    SELECT
        @totalRevenue       AS totalRevenue,
        @orders             AS orders,
        @customers          AS customers,
        @revenueLabelsJSON  AS revenueLabels,
        @revenueDataJSON    AS revenueData,
        @serviceLabelsJSON  AS serviceLabels,
        @serviceDataJSON    AS serviceData;

END$$

DELIMITER ;

-- Get category
DELIMITER $$

CREATE PROCEDURE GetCategory()
BEGIN
    SELECT DISTINCT category_name 
    FROM dishes 
    WHERE category_name IS NOT NULL;
END$$

DELIMITER ;

DELIMITER $$

-- Get region
CREATE PROCEDURE GetRegion()
BEGIN
    SELECT region_id, region_name
    FROM regions
    ORDER BY region_name;
END $$

DELIMITER ;

DELIMITER $$

DELIMITER $$

-- Get DishesNotInBranchMenu
CREATE PROCEDURE GetDishesNotInBranchMenu(IN input_branch_id INT)
BEGIN
    SELECT d.*
    FROM dishes d
    WHERE d.dish_id NOT IN (
        SELECT m.dish_id
        FROM menu m
        WHERE m.branch_id = input_branch_id AND m.is_serve = TRUE
    );
END $$

DELIMITER ;





