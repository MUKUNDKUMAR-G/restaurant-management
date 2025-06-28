import CustomError from '../utils/errors.js';
import STATUS_CODE from '../utils/constants.js';
import formatResponse from '../utils/formatresponse.js';
import { getBill, ListDish } from '../services/bill.service.js';


export const getBillDetail = async (req, res,next) => {
    let {billId} = req.params;
    billId = parseInt(billId,10);
    if(isNaN(billId)){
        throw new CustomError("BAD_REQUEST", "Bill ID is required", STATUS_CODE.BAD_REQUEST);
    }
    const row = await getBill(billId);
    const rows = row[0];
    console.log(rows);
    const dishes = await ListDish(billId);
    console.log(dishes);
    const data = {
        bill_id: rows.bill_id,
        order_id: rows.order_id,
        total_amount: rows.total_amount,
        total_amount_with_benefits: rows.total_amount_with_benefits,
        status: rows.status,
        created_at: rows.created_at,
        dishes: dishes
    };
    return formatResponse(res, "Success", "Bill retrieved successfully", STATUS_CODE.SUCCESS, data);
};