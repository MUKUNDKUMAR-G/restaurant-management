import db from '../configs/db.js';
import CustomError from '../utils/errors.js';
import STATUS_CODE from '../utils/constants.js';
import e from 'express';

export async function checkReservationExists(reservation_id) {
    const reservationCheckSql = 'CALL check_reservation_exists(?)';
    const [reservationRows] = await db.query(reservationCheckSql, [reservation_id]);
    if (reservationRows[0].length === 0) {
        throw new CustomError("BAD_REQUEST", "Reservation does not exist", STATUS_CODE.BAD_REQUEST);
    }
}

export async function checkBranchExists(branch_id) {
    const branchCheckSql = 'CALL check_branch_exists(?)';
    const [branchRows] = await db.query(branchCheckSql, [branch_id]);
    if (branchRows[0].length === 0) {
        throw new CustomError("BAD_REQUEST", "Branch does not exist", STATUS_CODE.BAD_REQUEST);
    }
}

export async function checkDishExists(dish_id) {
    const dishCheckSql = 'CALL check_dish_exists(?)';
    const [dishRows] = await db.query(dishCheckSql, [dish_id]);
    if (dishRows[0].length === 0) {
        throw new CustomError("BAD_REQUEST", "Dish does not exist", STATUS_CODE.BAD_REQUEST);
    } 
}

export const checkMenu = async (dish_id, branch_id) => {
    const callProcedure = 'CALL check_menu_exists(?, ?);';
    const [rows] = await db.query(callProcedure, [dish_id, branch_id]);
    if (rows[0].length === 0 || rows[0][0].is_serve == 0) {
        throw new CustomError("NOT_FOUND", "Dish not found in the specified branch's menu", STATUS_CODE.NOT_FOUND);
    }
};

export async function checkEmployeeExists(employee_id) {
    const sql = `CALL CheckEmployeeExists(?)`;
    const params = [employee_id];
    const [rows] = await db.query(sql, params);
    if (rows[0].length === 0) {
        throw new CustomError("NOT_FOUND", "Employee does not exist or has already quit", STATUS_CODE.NOT_FOUND);
    }
}

export async function checkUserValid(user_id) {
    const sql = `CALL CheckUserValidAndNotAdminOrStaff(?)`;
    const params = [user_id];
    const [rows] = await db.query(sql, params);
    if (rows[0].length === 0) {
        throw new CustomError("BAD_REQUEST", "Invalid user_id or user is admin/staff", STATUS_CODE.BAD_REQUEST);
    }
 }

 export async function getUserId(user_email) {
    const sql = `CALL GetUserId(?)`;
    const params = [user_email];
    const [rows] = await db.query(sql, params);
    return rows[0][0];
    
 }

export async function checkUserExists(user_id) {
    const sql = `CALL CheckUserExists(?)`;
    const params = [user_id];
    const [rows] = await db.query(sql, params);
    if (rows[0].length === 0) {
        throw new CustomError("BAD_REQUEST", "User does not exist", STATUS_CODE.BAD_REQUEST);
    }
}