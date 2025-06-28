use sushixx
-- Upgrade and Maintain Membercard


DELIMITER $$

CREATE TRIGGER trg_upgrade_maintain_member_card_after_update
AFTER UPDATE ON bills
FOR EACH ROW
BEGIN
    DECLARE v_current_points INT;
    DECLARE v_new_points DECIMAL(10,2);
    DECLARE v_total_points DECIMAL(10,2);
    DECLARE v_current_rank INT;
    DECLARE v_achieved_date DATETIME;
    DECLARE v_user_id INT;

    -- Chỉ xử lý khi hóa đơn có trạng thái 'paid'
    IF NEW.status = 'paid' THEN
        -- Tính điểm từ hóa đơn
        SET v_new_points = NEW.total_amount / 5;

        -- Lấy user_id từ bảng orders
        SELECT o.online_user_id INTO v_user_id
        FROM orders o
        WHERE o.order_id = NEW.order_id
        LIMIT 1;

        -- Kiểm tra xem user_id có tồn tại không
        IF v_user_id IS NOT NULL THEN
            -- Lấy tổng điểm và loại thẻ hiện tại từ bảng member_cards
            SELECT c.total_points, c.card_type_id, c.updated_at 
            INTO v_current_points, v_current_rank, v_achieved_date
            FROM member_cards c
            WHERE c.user_id = v_user_id
            LIMIT 1;

            -- Cộng thêm điểm mới
            SET v_total_points = v_current_points + v_new_points;

            -- Cập nhật tổng điểm trong bảng member_cards
            UPDATE member_cards
            SET total_points = v_total_points
            WHERE user_id = v_user_id;

            -- Kiểm tra điều kiện nâng cấp/thấp cấp thẻ
            IF (v_current_rank = 1 AND v_total_points >= 100) THEN
                UPDATE member_cards
                SET card_type_id = 2, updated_at = NOW(), total_points = 0
                WHERE user_id = v_user_id;
            ELSEIF (v_current_rank = 2 AND v_total_points >= 100) THEN
                UPDATE member_cards
                SET card_type_id = 3, updated_at = NOW(), total_points = 0
                WHERE user_id = v_user_id;
            ELSEIF (v_current_rank = 2 AND v_total_points < 50 AND TIMESTAMPDIFF(YEAR, v_achieved_date, NOW()) >= 1) THEN
                UPDATE member_cards
                SET card_type_id = 1, updated_at = NOW(), total_points = 0
                WHERE user_id = v_user_id;
            ELSEIF (v_current_rank = 3 AND v_total_points < 50 AND TIMESTAMPDIFF(YEAR, v_achieved_date, NOW()) >= 1) THEN
                UPDATE member_cards
                SET card_type_id = 1, updated_at = NOW(), total_points = 0
                WHERE user_id = v_user_id;
            ELSEIF (v_total_points = 50 AND TIMESTAMPDIFF(YEAR, v_achieved_date, NOW()) >= 1) THEN
                UPDATE member_cards
                SET updated_at = NOW(), total_points = 0
                WHERE user_id = v_user_id;
            END IF;
        END IF;
    END IF;
END$$

DELIMITER ;


DELIMITER $$

CREATE TRIGGER trg_upgrade_maintain_member_card_after_insert
AFTER INSERT ON bills
FOR EACH ROW
BEGIN
    DECLARE v_current_points INT;
    DECLARE v_new_points DECIMAL(10,2);
    DECLARE v_total_points DECIMAL(10,2);
    DECLARE v_current_rank INT;
    DECLARE v_achieved_date DATETIME;
    DECLARE v_user_id INT;

    -- Chỉ xử lý khi hóa đơn có trạng thái 'paid'
    IF NEW.status = 'paid' THEN
        -- Tính điểm từ hóa đơn
        SET v_new_points = NEW.total_amount / 5;

        -- Lấy user_id từ bảng orders
        SELECT o.online_user_id INTO v_user_id
        FROM orders o
        WHERE o.order_id = NEW.order_id
        LIMIT 1;

        -- Kiểm tra xem user_id có tồn tại không
        IF v_user_id IS NOT NULL THEN
            -- Lấy tổng điểm và loại thẻ hiện tại từ bảng member_cards
            SELECT c.total_points, c.card_type_id, c.updated_at 
            INTO v_current_points, v_current_rank, v_achieved_date
            FROM member_cards c
            WHERE c.user_id = v_user_id
            LIMIT 1;

            -- Cộng thêm điểm mới
            SET v_total_points = v_current_points + v_new_points;

            -- Cập nhật tổng điểm trong bảng member_cards
            UPDATE member_cards
            SET total_points = v_total_points
            WHERE user_id = v_user_id;

            -- Kiểm tra điều kiện nâng cấp/thấp cấp thẻ
            IF (v_current_rank = 1 AND v_total_points >= 100) THEN
                UPDATE member_cards
                SET card_type_id = 2, updated_at = NOW(), total_points = 0
                WHERE user_id = v_user_id;
            ELSEIF (v_current_rank = 2 AND v_total_points >= 100) THEN
                UPDATE member_cards
                SET card_type_id = 3, updated_at = NOW(), total_points = 0
                WHERE user_id = v_user_id;
            ELSEIF (v_current_rank = 2 AND v_total_points < 50 AND TIMESTAMPDIFF(YEAR, v_achieved_date, NOW()) >= 1) THEN
                UPDATE member_cards
                SET card_type_id = 1, updated_at = NOW(), total_points = 0
                WHERE user_id = v_user_id;
            ELSEIF (v_current_rank = 3 AND v_total_points < 50 AND TIMESTAMPDIFF(YEAR, v_achieved_date, NOW()) >= 1) THEN
                UPDATE member_cards
                SET card_type_id = 1, updated_at = NOW(), total_points = 0
                WHERE user_id = v_user_id;
            ELSEIF (v_total_points = 50 AND TIMESTAMPDIFF(YEAR, v_achieved_date, NOW()) >= 1) THEN
                UPDATE member_cards
                SET updated_at = NOW(), total_points = 0
                WHERE user_id = v_user_id;
            END IF;
        END IF;
    END IF;
END$$

DELIMITER ;




-- Update status cho các quan hệ
DELIMITER $$

CREATE TRIGGER after_update_delivery_status
AFTER UPDATE ON deliveries
FOR EACH ROW
BEGIN
    -- Nếu trạng thái mới là 'completed', cập nhật orders.status = 'delivered'
    IF NEW.status = 'completed' THEN
        UPDATE orders SET status = 'delivered'
        WHERE order_id = NEW.order_id;
    
    -- Nếu trạng thái mới là 'cancelled', cập nhật orders.status = 'cancelled'
    ELSEIF NEW.status = 'canceled' THEN
        UPDATE orders SET status = 'cancelled'
        WHERE order_id = NEW.order_id;
        
		UPDATE bills SET status = 'refunded' 
        WHERE order_id = NEW.order_id;
        
    ELSEIF NEW.status = 'pending' THEN
        UPDATE orders SET status = 'billed'
        WHERE order_id = NEW.order_id;
        
	ELSEIF NEW.status = 'in progress' THEN
        UPDATE orders SET status = 'in_delivery'
        WHERE order_id = NEW.order_id;
	END IF;
	IF OLD.status = 'cancelled'  AND NEW.status <> 'cancelled' THEN
		UPDATE bills SET status = 'paid'
        WHERE order_id = NEW.order_id;
    END IF;
END$$

DELIMITER ;
