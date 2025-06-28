import db from '../configs/db.js';
import CustomError from '../utils/errors.js';
import STATUS_CODE from '../utils/constants.js';


export async function getBill(billId) {
    const sql = `call GetBillDetail(?)`;
    const result = await db.query(sql, [billId]);
    return result[0][0];
} 

export async function ListDish(billId){
    const sql = `call GetDishInBill(?)`;
    const [result] = await db.query(sql, [billId]);
    return result[0];
}