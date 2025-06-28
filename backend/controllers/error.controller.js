import CustomError from '../utils/errors.js';
import STATUS_CODE from '../utils/constants.js';
import formatResponse from '../utils/formatresponse.js';

const globalErrorHandler = (err, _req, res, _next) => {
    // console.log("Error in global error handler:", err);
    if (err instanceof CustomError) {
      return formatResponse(res, err.name, err.message, err.status, err.data);
    }
    return formatResponse(
      res,
      "INTERNAL_SERVER_ERROR",
      err.message,
      STATUS_CODE.INTERNAL_SERVER_ERROR,
      {},
    );
};

export default globalErrorHandler;
