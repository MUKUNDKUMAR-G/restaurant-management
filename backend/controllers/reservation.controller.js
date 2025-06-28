import CustomError from '../utils/errors.js';
import STATUS_CODE from '../utils/constants.js';
import formatResponse from '../utils/formatresponse.js';

import db from '../configs/db.js';

// import { createUserInDb } from '../services/auth.service.js';
import {
    createReservationIfAvailable,
    CancelReservation,
    createReviewForReservation,
    UpdateStatusReservation,
    searchReservationSlipsByUser,
    searchReservationSlipsByBranch
} from '../services/reservation.service.js';

import {
    checkReservationExists,
    checkBranchExists
} from '../services/check.service.js';

export const submitReservation = async (req, res) => {
    const { cus_name, phone_number, guests_number, arrival_time, arrival_date, notes } = req.body;
    const branch_id = parseInt(req.params.branchId, 10);

    // Check branch exists
    await checkBranchExists(branch_id);

    const reservation = await createReservationIfAvailable({
        branch_id,
        cus_name,
        phone_number,
        guests_number,
        arrival_time,
        arrival_date,
        notes,
        user_id: req.user.user_id
    });

    if(reservation.table_number == -1) {
        throw new CustomError("BAD_REQUEST", "No available table in this time frame", STATUS_CODE.BAD_REQUEST);
    }

    const data = {
        reservation_id: reservation.reservation_slip_id,
        table_number: reservation.table_number,
        cus_name,
        phone_number,
        guests_number,
        arrival_time,
        arrival_date,
        notes
    };

    return formatResponse(res, "Success", "Reservation submitted successfully", STATUS_CODE.CREATED, data);
};

export const deleteReservation = async (req, res) => {
    const reservation_slip_id = req.params.reservationSlipId;

    // Check reservation exists
    await checkReservationExists(reservation_slip_id);

    await CancelReservation(reservation_slip_id);

    return formatResponse(res, "Success", "Reservation deleted successfully", STATUS_CODE.SUCCESS, {});
}

export const updateReservation = async (req, res) => {
    const reservation_slip_id = req.params.reservationSlipId;
    const status = req.body.status;

    await checkReservationExists(reservation_slip_id);

    await UpdateStatusReservation(reservation_slip_id, status);

    return formatResponse(res, "Success", "Reservation updated successfully", STATUS_CODE.SUCCESS, {});
}

export const submitReview = async (req, res) => {
    const reservation_slip_id = req.params.reservationSlipId;
    const { service_rating, location_rating, food_rating, price_rating, ambiance_rating } = req.body;

    await checkReservationExists(reservation_slip_id);

    await createReviewForReservation({
        reservation_slip_id,
        service_rating,
        location_rating,
        food_rating,
        price_rating,
        ambiance_rating
    });

    const data = {
        reservation_slip_id,
        service_rating,
        location_rating,
        food_rating,
        price_rating,
        ambiance_rating
    };

    return formatResponse(res, "Success", "Review submitted successfully", STATUS_CODE.CREATED, data);
}

// Add the searchReservationSlipsController
export const searchReservationSlipsController = async (req, res, next) => {
    const { query = '', page = 1, limit = 10 } = req.query;
    const userId = req.user.user_id; 

    
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    if (isNaN(parsedPage) || parsedPage < 1) {
        throw new CustomError("BAD_REQUEST", "Invalid page number", STATUS_CODE.BAD_REQUEST, []);
    }
    if (isNaN(parsedLimit) || parsedLimit < 1) {
        throw new CustomError("BAD_REQUEST", "Invalid limit value", STATUS_CODE.BAD_REQUEST, []);
    }

    const { reservationSlips, totalRecords } = await searchReservationSlipsByUser(userId, { query, page: parsedPage, limit: parsedLimit });

    // Calculate pagination details
    const totalPages = Math.ceil(totalRecords / parsedLimit);
    const hasMore = parsedPage < totalPages;

    // if(parsedPage > totalPages) {
    //     throw new CustomError("BAD_REQUEST", "Invalid page number", STATUS_CODE.BAD_REQUEST, []);
    // }

    const data = {
        reservationSlips: reservationSlips.map(reservation => ({
            reservation_slip_id: reservation.reservation_slip_id,
            branch_id: reservation.branch_id,
            cus_name: reservation.cus_name,
            phone_number: reservation.phone_number,
            guests_number: reservation.guests_number,
            arrival_time: reservation.arrival_time,
            arrival_date: reservation.arrival_date,
            status: reservation.status,
            table_number: reservation.table_number || -1,
            created_at: reservation.created_at
        })),
        pagination: {
            currentPage: parsedPage,
            pageSize: parsedLimit,
            totalPages: totalPages,
            hasMore: hasMore
        }
    };

    return formatResponse(res, "Search Reservation Slips", "Reservation slips retrieved successfully", STATUS_CODE.SUCCESS, data);
};

// Add the searchReservationSlipsByBranchController
export const searchReservationSlipsByBranchController = async (req, res, next) => {
    const { query = '', page = 1, limit = 10 } = req.query;
    const { branchId } = req.params;

    // Validate branchId
    const parsedBranchId = parseInt(branchId, 10);


    // Validate page and limit
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    if (isNaN(parsedPage) || parsedPage < 1) {
        throw new CustomError("BAD_REQUEST", "Invalid page number", STATUS_CODE.BAD_REQUEST, []);
    }
    if (isNaN(parsedLimit) || parsedLimit < 1) {
        throw new CustomError("BAD_REQUEST", "Invalid limit value", STATUS_CODE.BAD_REQUEST, []);
    }

    const { reservationSlips, totalRecords } = await searchReservationSlipsByBranch(parsedBranchId, { query, page: parsedPage, limit: parsedLimit });

    // Calculate pagination details
    const totalPages = Math.ceil(totalRecords / parsedLimit);
    const hasMore = parsedPage < totalPages;

    // if (parsedPage > totalPages && totalPages !== 0) {
    //     throw new CustomError("BAD_REQUEST", "Page number exceeds total pages", STATUS_CODE.BAD_REQUEST);
    // }

    const data = {
        reservationSlips: reservationSlips.map(reservation => ({
            reservation_slip_id: reservation.reservation_slip_id,
            branch_id: reservation.branch_id,
            cus_name: reservation.cus_name,
            phone_number: reservation.phone_number,
            guests_number: reservation.guests_number,
            arrival_time: reservation.arrival_time,
            arrival_date: reservation.arrival_date,
            table_number: reservation.table_number || -1,
            status: reservation.status,
            created_at: reservation.created_at
        })),
        pagination: {
            currentPage: parsedPage,
            pageSize: parsedLimit,
            totalPages: totalPages,
            hasMore: hasMore
        }
    };

    return formatResponse(res, "Search Reservation Slips by Branch", "Reservation slips retrieved successfully", STATUS_CODE.SUCCESS, data);

};