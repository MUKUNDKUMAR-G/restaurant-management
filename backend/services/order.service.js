import db from '../configs/db.js';
import CustomError from '../utils/errors.js';
import STATUS_CODE from '../utils/constants.js';

async function createOrderInDb({ 
    branch_id, 
    user_id, 
    cus_name, 
    reservation_slip_id, 
    order_type, 
    status, 
    dishes, 
    delivery_address, 
    delivery_phone, 
    shipper, 
    delivery_notes,
    member_card_id
}) {
    // Robust validation for dishes
    if (!Array.isArray(dishes) || dishes.length === 0) {
        throw new CustomError("ORDER_CREATION_FAILED", "Order must contain at least one dish.", STATUS_CODE.BAD_REQUEST);
    }
    for (const dish of dishes) {
        if (!dish.dish_id || !dish.quantity || !dish.price) {
            throw new CustomError("ORDER_CREATION_FAILED", "Each dish must have dish_id, quantity, and price.", STATUS_CODE.BAD_REQUEST);
        }
    }
    // Log input for debugging
    console.log('createOrderInDb input:', { branch_id, user_id, dishes });
    // This function must ensure: orders, order_details, and bills are all created for every order!
    const sql = 'CALL CreateOrder(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @p_order_id, @p_delivery_id, @p_order_created_at)';
    const params = [
        branch_id,
        user_id,
        cus_name,
        reservation_slip_id,
        order_type,
        status,
        JSON.stringify(dishes),
        delivery_address,
        delivery_phone,
        shipper,
        delivery_notes,
        member_card_id
    ];
    const [rows] = await db.execute(sql, params);
    // Handle OUT parameters as needed
    const [outParams] = await db.execute(
        'SELECT @p_order_id AS order_id, @p_delivery_id AS delivery_id, @p_order_created_at AS order_created_at'
    );
    // Debug log for troubleshooting
    console.log('CreateOrder output:', outParams[0]);
    // Check if order_id is present
    if (!outParams[0] || !outParams[0].order_id) {
        throw new CustomError("ORDER_CREATION_FAILED", "Order was not created properly (no order_id returned)", STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
    // Optionally, check if bill exists for this order
    const [billRows] = await db.query('SELECT * FROM bills WHERE order_id = ?', [outParams[0].order_id]);
    if (!billRows || billRows.length === 0) {
        throw new CustomError("BILL_CREATION_FAILED", "Bill was not created for this order. Please check the stored procedure logic.", STATUS_CODE.INTERNAL_SERVER_ERROR);
    }
    return outParams[0];
}


const getRandomEmployeeIdByDepartment = async (departmentName, branchId) => {
    const callProc = 'CALL GetRandomEmployeeByDepartment(?, ?, @p_employee_id)';
    await db.query(callProc, [departmentName, branchId]);

    const getOutput = 'SELECT @p_employee_id AS employee_id';
    const [rows] = await db.query(getOutput);

    return rows[0].employee_id;
};

async function updateOrderStatus(order_id, newStatus) {
    const sql = `CALL UpdateOrderStatus(?, ?)`;
    const params = [order_id, newStatus];
    const [result] = await db.query(sql, params);
    
    // Check if any rows were affected
    if (result.affectedRows === 0) {
        throw new CustomError("NOT_FOUND", "Order not found", STATUS_CODE.NOT_FOUND);
    }

    return;
}

export async function getDishesInOnlineOrderById(order_id){
    const sql = `CALL GetDishesInOrder(?)`;
    const [result] = await db.query(sql, [order_id]);
    return result[0];
}
export async function GetOnlineOrderDetails(order_id) {
    const sql = `CALL GetOrderOnlineById(?)`;
    const [result] = await db.query(sql, [order_id]);
    return result[0][0];
}

async function searchOrdersByUser(user_id, { query, page, limit}) {
    const p_query_name = 'orders.order_id';
    const p_query = query;
    const p_page = parseInt(page, 10) || 1;
    const p_limit = parseInt(limit, 10) || 10;
    const p_tableName = 'orders';
    const p_orderByField = '';
    const p_orderByDirection = '';
    const p_category_name = 'orders.order_type';
    const p_category = 'delivery';
    const p_id_name = 'order_id';
    const p_selectFields = 'orders.order_id, orders.branch_id, orders.online_user_id, orders.order_type, orders.status, orders.created_at, bills.total_amount_with_benefits';
    const p_joinClause = 'JOIN online_account o ON o.user_id = orders.online_user_id  JOIN bills on bills.order_id = orders.order_id'; // No joins needed as only the 'orders' table is used
    const p_branch_name = 'o.user_id'; 
    const p_branch_id = user_id; 

    let p_totalRecords = 0;

    const sql = `CALL GetDynamicItems(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @totalRecords);`;
    const params = [
        p_query_name,
        p_query,
        p_page,
        p_limit,
        p_tableName,
        p_orderByField,
        p_orderByDirection,
        p_category_name,
        p_category,
        p_branch_name,
        p_branch_id,
        p_id_name,
        p_selectFields,
        p_joinClause
    ];

    const [results] = await db.query(sql, params);

    // Retrieve the total records from the OUT parameter
    const [[{ totalRecords }]] = await db.query('SELECT @totalRecords as totalRecords;');
    p_totalRecords = totalRecords;

    return {
        orders: results[0],
        totalRecords: p_totalRecords
    };

}

// Add the searchOrdersByBranch function
async function searchOrdersByBranch(branchId, { query = '', page = 1, limit = 10 }) {
    const p_query_name = 'orders.order_id';
    const p_query = query;
    const p_page = parseInt(page, 10) || 1;
    const p_limit = parseInt(limit, 10) || 10;
    const p_tableName = 'orders';
    const p_orderByField = 'orders.created_at';
    const p_orderByDirection = 'DESC';
    const p_category_name = '';
    const p_category = '';
    const p_id_name = 'orders.order_id';
    const p_selectFields = 'orders.order_id, orders.branch_id, orders.online_user_id, orders.order_type, orders.status, orders.created_at, bills.total_amount_with_benefits';
    const p_joinClause = 'LEFT JOIN bills on bills.order_id = orders.order_id'; // Use LEFT JOIN to include all orders
    const p_branch_name = 'orders.branch_id';
    const p_branch_id = branchId;

    let p_totalRecords = 0;

    const sql = `CALL GetDynamicItems(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @totalRecords);`;
    const params = [
        p_query_name,
        p_query,
        p_page,
        p_limit,
        p_tableName,
        p_orderByField,
        p_orderByDirection,
        p_category_name,
        p_category,
        p_branch_name,
        p_branch_id,
        p_id_name,
        p_selectFields,
        p_joinClause
    ];

    const [results] = await db.query(sql, params);

    // Retrieve the total records from the OUT parameter
    const [[{ totalRecords }]] = await db.query('SELECT @totalRecords as totalRecords;');
    p_totalRecords = totalRecords;

    return {
        orders: results[0],
        totalRecords: p_totalRecords
    };
}

// Add the searchBills function
async function searchBills({ query = '', category = '', page = 1, limit = 10 }) {
    const p_query_name = 'bills.bill_id';
    const p_query = query;
    const p_page = parseInt(page, 10) || 1;
    const p_limit = parseInt(limit, 10) || 10;
    const p_tableName = 'bills';
    const p_orderByField = 'bills.created_at';
    const p_orderByDirection = 'DESC';
    const p_category_name = 'orders.order_type';
    const p_category = category;
    const p_id_name = 'bills.bill_id';
    const p_selectFields = 'bills.bill_id, bills.order_id, bills.total_amount, bills.total_amount_with_benefits, bills.created_at, orders.order_type';
    const p_joinClause = 'JOIN orders ON bills.order_id = orders.order_id';
    const p_branch_name = '';
    const p_branch_id = '';

    let p_totalRecords = 0;

    const sql = `CALL GetDynamicItems(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @totalRecords);`;
    const params = [
        p_query_name,
        p_query,
        p_page,
        p_limit,
        p_tableName,
        p_orderByField,
        p_orderByDirection,
        p_category_name,
        p_category,
        p_branch_name,
        p_branch_id,
        p_id_name,
        p_selectFields,
        p_joinClause
    ];

    const [results] = await db.query(sql, params);

    // Retrieve the total records from the OUT parameter
    const [[{ totalRecords }]] = await db.query('SELECT @totalRecords as totalRecords;');
    p_totalRecords = totalRecords;

    return {
        bills: results[0],
        totalRecords: p_totalRecords
    };
}

export { createOrderInDb, getRandomEmployeeIdByDepartment, updateOrderStatus, searchOrdersByUser, searchOrdersByBranch, searchBills };
