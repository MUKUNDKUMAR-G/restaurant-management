import db from '../configs/db.js';

async function createReservationIfAvailable({branch_id, cus_name, phone_number, guests_number, arrival_time, arrival_date, notes, user_id}) {
    const query = `
        CALL CreateReservationIfAvailable(?, ?, ?, ?, ?, ?, ?, ?, @p_reservation_slip_id, @p_table_number);
    `;
    await db.query(query, [branch_id, cus_name, phone_number, guests_number, arrival_time, arrival_date, notes, user_id]);

    const [outParams] = await db.query(
        'SELECT @p_reservation_slip_id AS reservation_slip_id, @p_table_number AS table_number;'
    );
    return outParams[0];
}

async function CancelReservation(reservation_id) {
    const query = `
        CALL UpdateStatusReservation(?, 'canceled');
    `;
    await db.query(query, [reservation_id]);
}

async function UpdateStatusReservation(reservation_id, status) {
    const query = `
        CALL UpdateStatusReservation(?, ?);
    `;
    await db.query(query, [reservation_id, status]);
}

async function createReviewForReservation({reservation_slip_id, service_rating, location_rating, food_rating, price_rating, ambiance_rating}) {
    const query = `
        CALL CreateReviewForReservation(?, ?, ?, ?, ?, ?);
    `;
    await db.query(query, [reservation_slip_id, service_rating, location_rating, food_rating, price_rating, ambiance_rating]);
}

// Add the searchReservationSlipsByUser function
async function searchReservationSlipsByUser(userId, { query = '', page = 1, limit = 10 }) {
    const p_query_name = 'reservation_slip_id';
    const p_query = query;
    const p_page = parseInt(page, 10) || 1;
    const p_limit = parseInt(limit, 10) || 10;
    const p_tableName = 'reservation_slips';
    const p_orderByField = '';
    const p_orderByDirection = '';
    const p_category_name = 'online_account';
    const p_category = userId;
    const p_branch_name = '';
    const p_branch_id = '';
    const p_id_name = 'reservation_slip_id';
    const p_selectFields = 'reservation_slip_id, branch_id, cus_name, phone_number, guests_number, arrival_time, arrival_date, status, created_at, table_number';
    const p_joinClause = ''; // No joins needed as only the 'reservation_slips' table is used

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
        reservationSlips: results[0],
        totalRecords: p_totalRecords
    };
}

// Add the searchReservationSlipsByBranch function
async function searchReservationSlipsByBranch(branchId, { query = '', page = 1, limit = 10 }) {
    const p_query_name = 'reservation_slip_id';
    const p_query = query;
    const p_page = parseInt(page, 10) || 1;
    const p_limit = parseInt(limit, 10) || 10;
    const p_tableName = 'reservation_slips';
    const p_orderByField = 'created_at';
    const p_orderByDirection = 'DESC';
    const p_category_name = '';
    const p_category = '';
    const p_branch_name = 'branch_id';
    const p_branch_id = branchId;
    const p_id_name = 'reservation_slip_id';
    const p_selectFields = 'reservation_slip_id, branch_id, cus_name, phone_number, guests_number, arrival_time, arrival_date, status, created_at, table_number';
    const p_joinClause = ''; // No joins needed as only the 'reservation_slips' table is used

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
        reservationSlips: results[0],
        totalRecords: p_totalRecords
    };
}

export { createReservationIfAvailable, CancelReservation, createReviewForReservation, UpdateStatusReservation, searchReservationSlipsByUser, searchReservationSlipsByBranch };