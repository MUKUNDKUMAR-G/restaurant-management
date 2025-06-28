import CustomError from '../utils/errors.js';
import STATUS_CODE from '../utils/constants.js';

async function verifyStaff(req, res, next) {
    const { is_staff, is_admin } = req.user;
    if (is_staff !== 1 && is_admin !== 1) {
        throw new CustomError("UNAUTHORIZED", "You are not authorized as STAFF to access this resource", STATUS_CODE.UNAUTHORIZED);
    }
    next();   
}

export default verifyStaff;