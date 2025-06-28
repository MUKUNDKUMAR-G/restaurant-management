import CustomError from '../utils/errors.js';
import STATUS_CODE from '../utils/constants.js';
import formatResponse from '../utils/formatresponse.js';

import db from '../configs/db.js';

import {
    createOrderInDb,
    getRandomEmployeeIdByDepartment,
    updateOrderStatus as updateOrderStatusService,
    searchOrdersByUser,
    searchOrdersByBranch,
    searchBills,
    getDishesInOnlineOrderById,
    GetOnlineOrderDetails
} from '../services/order.service.js';


import {
    checkBranchExists,
    checkReservationExists,
    checkUserExists
} from '../services/check.service.js';


export const submitOnline = async (req, res) => {
    const branch_id = parseInt(req.params.branchId, 10);
    const { cus_name, phone_number, address, notes, listDish } = req.body;
    
    // Validate required fields
    if (!cus_name || !phone_number || !address || !listDish) {
        throw new CustomError("BAD_REQUEST", "Please fill in all fields", STATUS_CODE.BAD_REQUEST);
    }

    // Check if branch exists
    await checkBranchExists(branch_id);

    const employee_id = await getRandomEmployeeIdByDepartment('Shipping', branch_id);

    const order = await createOrderInDb({
        branch_id: branch_id,
        user_id: req.user.user_id, 
        cus_name: cus_name,
        reservation_slip_id: null, 
        order_type: 'delivery', 
        status: 'in_delivery',
        dishes: listDish,
        delivery_address: address,
        delivery_phone: phone_number,
        shipper: employee_id,
        delivery_notes: notes,
        member_card_id: null
    });

    const data = {
        order_id: order.order_id,
        user_id: req.user.user_id,
        branch_id: branch_id,
        created_at: order.order_created_at,
        status: 'in_delivery',
        delivery_id: order.delivery_id,
        shipper: employee_id,
        address: address,
        notes: notes,
    };
    

    return formatResponse(res, "Success", "Order submitted successfully", STATUS_CODE.CREATED, data);
};


export const submitDineIn = async (req, res) => {
    const reservation_slip_id = parseInt(req.params.reservationSlipId, 10);
    const { cus_name, member_card_id, branch_id, listDish} = req.body;

    // Validate required fields
    if (!cus_name || !branch_id || !listDish ) {
        throw new CustomError("BAD_REQUEST", "Please fill in all fields", STATUS_CODE.BAD_REQUEST);
    }

    // Check if reservation exists
    await checkReservationExists(reservation_slip_id); 

    // Check if user is the waiter of this reservation
    // if (waiter != req.user.user_id) {
    //     throw new CustomError("UNAUTHORIZED", "You are not the waiter of this reservation", STATUS_CODE.UNAUTHORIZED);
    // }

    const order = await createOrderInDb({
        branch_id: branch_id,
        user_id: null,
        cus_name: cus_name,
        reservation_slip_id: reservation_slip_id,
        order_type: 'dine-in',
        status: 'billed',
        dishes: listDish,
        delivery_address: null,
        delivery_phone: null,
        shipper: null,
        delivery_notes: null,
        member_card_id: member_card_id
    });

    const data = {
        order_id: order.order_id,
        branch_id: branch_id,
        member_card_id: member_card_id,
        reservation_slip_id: reservation_slip_id,
        created_at: order.order_created_at
    };

    return formatResponse(res, "Success", "Dine-in order submitted successfully", STATUS_CODE.CREATED, data);
};

export const updateOrderStatus = async (req, res, next) => {
    const order_id = parseInt(req.params.orderId, 10);

    const { order_status } = req.body;


    // Validate required field
    if (!order_status) {
        throw new CustomError("BAD_REQUEST", "Please provide the order status", STATUS_CODE.BAD_REQUEST);
    }

    // Validate order_status value (assuming predefined statuses)
    const validStatuses = ['waiting_for_guest','serving','billed','in_delivery','delivered', 'cancelled'];
    if (!validStatuses.includes(order_status)) {
        throw new CustomError("BAD_REQUEST", "Invalid order status provided", STATUS_CODE.BAD_REQUEST);
    }

    // Perform update
    await updateOrderStatusService(order_id, order_status);

    return formatResponse(
        res,
        "Update Order Status",
        "Order status updated successfully",
        STATUS_CODE.SUCCESS,
        null
    );
};

// Add the searchOrdersByUser controller
export const searchOrdersByUserController = async (req, res, next) => {
    const { query = '', page = 1, limit = 10 } = req.query;

    // Validate userId
    const user_id = req.user.user_id;
    await checkUserExists(user_id);

    // Validate page and limit
    if (isNaN(parseInt(page, 10)) || parseInt(page, 10) < 1) {
        throw new CustomError("BAD_REQUEST", "Invalid page number", STATUS_CODE.BAD_REQUEST, []);
    }
    if (isNaN(parseInt(limit, 10)) || parseInt(limit, 10) < 1) {
        throw new CustomError("BAD_REQUEST", "Invalid limit value", STATUS_CODE.BAD_REQUEST, []);
    }

    const { orders, totalRecords } = await searchOrdersByUser(user_id, { query, page, limit });

    // Calculate pagination details
    const totalPages = Math.ceil(totalRecords / limit);
    // if (totalPages === 0) {
    //     throw new CustomError("NOT_FOUND", "No orders found", STATUS_CODE.NOT_FOUND, []);
    // }
    const hasMore = page < totalPages;

    // if (page > totalPages) {
    //     throw new CustomError("BAD_REQUEST", "Invalid page number", STATUS_CODE.BAD_REQUEST, []);
    // }

    const data = {
        orders: orders.map(order => ({
            order_id: order.order_id,
            total: order.total_amount_with_benefits,
            branch_id: order.branch_id,
            cus_name: order.cus_name,
            order_type: order.order_type,
            status: order.status,
            created_at: order.order_created_at,
        })),
        pagination: {
            currentPage: parseInt(page, 10),
            pageSize: parseInt(limit, 10),
            totalPages: totalPages,
            hasMore: hasMore
        }
    };

    return formatResponse(res, "Search Orders", "Orders retrieved successfully", STATUS_CODE.SUCCESS, data);
};

// Add the searchOrdersByBranchController
export const searchOrdersByBranchController = async (req, res, next) => {
    const { query = '', page = 1, limit = 10 } = req.query;
    const { branchId } = req.params;

    // Validate branchId
    const parsedBranchId = parseInt(branchId, 10);
    if (isNaN(parsedBranchId)) {
        throw new CustomError("BAD_REQUEST", "Invalid branch ID", STATUS_CODE.BAD_REQUEST);
    }

    // Validate page and limit
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    if (isNaN(parsedPage) || parsedPage < 1) {
        throw new CustomError("BAD_REQUEST", "Invalid page number", STATUS_CODE.BAD_REQUEST, []);
    }
    if (isNaN(parsedLimit) || parsedLimit < 1) {
        throw new CustomError("BAD_REQUEST", "Invalid limit value", STATUS_CODE.BAD_REQUEST, []);
    }

    const { orders, totalRecords } = await searchOrdersByBranch(parsedBranchId, { query, page: parsedPage, limit: parsedLimit });

    // Calculate pagination details
    const totalPages = Math.ceil(totalRecords / parsedLimit);
    const hasMore = parsedPage < totalPages;

    // if (parsedPage > totalPages && totalPages !== 0) {
    //     throw new CustomError("BAD_REQUEST", "Page number exceeds total pages", STATUS_CODE.BAD_REQUEST);
    // }

    const data = {
        orders: orders.map(order => ({
            order_id: order.order_id,
            branch_id: order.branch_id,
            online_user_id: order.online_user_id,
            order_type: order.order_type,
            total: order.total_amount_with_benefits,
            status: order.status,
            created_at: order.created_at,
        })),
        pagination: {
            currentPage: parsedPage,
            pageSize: parsedLimit,
            totalPages: totalPages,
            hasMore: hasMore
        }
    };

    return formatResponse(res, "Search Orders by Branch", "Orders retrieved successfully", STATUS_CODE.SUCCESS, data);

};

// Add the searchBillsController
export const searchBillsController = async (req, res, next) => {
    const { query = '', category = '', page = 1, limit = 10 } = req.query;

    // Validate category
    const validCategories = ['dine-in', 'delivery'];
    if (category && !validCategories.includes(category)) {
        throw new CustomError("BAD_REQUEST", "Invalid category provided", STATUS_CODE.BAD_REQUEST);
    }

    // Validate page and limit
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    if (isNaN(parsedPage) || parsedPage < 1) {
        throw new CustomError("BAD_REQUEST", "Invalid page number", STATUS_CODE.BAD_REQUEST, []);
    }
    if (isNaN(parsedLimit) || parsedLimit < 1) {
        throw new CustomError("BAD_REQUEST", "Invalid limit value", STATUS_CODE.BAD_REQUEST, []);
    }

    const { bills, totalRecords } = await searchBills({ query, category, page: parsedPage, limit: parsedLimit });

    // Calculate pagination details
    const totalPages = Math.ceil(totalRecords / parsedLimit);
    const hasMore = parsedPage < totalPages;

    // if (parsedPage > totalPages && totalPages !== 0) {
    //     throw new CustomError("BAD_REQUEST", "Page number exceeds total pages", STATUS_CODE.BAD_REQUEST);
    // }

    // throw new CustomError("NOT_FOUND", "No bills found", STATUS_CODE.NOT_FOUND, bills);

    const data = {
        bills: bills.map(bill => ({
            bill_id: bill.bill_id,
            order_id: bill.order_id,
            total_amount: bill.total_amount,
            total_amount_with_benefit: bill.total_amount_with_benefit,
            order_type: bill.order_type,
            created_at: bill.created_at,
        })),
        pagination: {
            currentPage: parsedPage,
            pageSize: parsedLimit,
            totalPages: totalPages,
            hasMore: hasMore
        }
    };

    return formatResponse(res, "Search Bills", "Bills retrieved successfully", STATUS_CODE.SUCCESS, data);
};

export const getOnlineOrderDetails = async (req, res, next) => {
    let { orderId } = req.params;
    orderId = parseInt(orderId, 10);
    const order = await GetOnlineOrderDetails(orderId);
    const rows = await getDishesInOnlineOrderById(orderId);
    if (!order) {
      return formatResponse(res, "Error", "Order not found", STATUS_CODE.NOT_FOUND, {});
    }
    if (!rows || rows.length === 0) {
      console.warn('No dishes found for order', orderId);
    }
    const data = {
        order_id: order.order_id,
        branch_id: order.branch_id,
        order_type: order.order_type,
        created_at: order.created_at,
        status: order.status,
        shipper: order.shipper,
        total_amount_with_benefits: order.total_amount_with_benefits,
        dishes: rows
    };
    return formatResponse(res, "Success", "Order details retrieved successfully", STATUS_CODE.SUCCESS, data);
};

