import pkg from 'jsonwebtoken';
import CustomError from '../utils/errors.js';
import STATUS_CODE from '../utils/constants.js';
const { verify } = pkg;

const verifyToken = async (req, res, next) => {
  try {
    // Check if JWT_ACCESS_KEY is configured
    if (!process.env.JWT_ACCESS_KEY) {
      console.error('JWT_ACCESS_KEY is not configured');
      throw new CustomError(
        "INTERNAL_SERVER_ERROR",
        "Server configuration error",
        STATUS_CODE.INTERNAL_SERVER_ERROR
      );
    }

    const authorization = req.headers.authorization;
    if (!authorization) {
      throw new CustomError(
        "UNAUTHORIZED",
        "You are not authenticated!",
        STATUS_CODE.UNAUTHORIZED
      );
    }

    const accessToken = authorization.split(" ")[1];
    if (!accessToken) {
      throw new CustomError(
        "UNAUTHORIZED",
        "Invalid token format!",
        STATUS_CODE.UNAUTHORIZED
      );
    }

    const user = await new Promise((resolve, reject) => {
      verify(accessToken, process.env.JWT_ACCESS_KEY, (err, decoded) => {
        if (err) {
          if (err.name === "TokenExpiredError") {
            reject(new CustomError(
              "UNAUTHORIZED",
              "Token has expired!",
              STATUS_CODE.UNAUTHORIZED
            ));
          } else {
            reject(new CustomError(
              "FORBIDDEN",
              "Token is not valid!",
              STATUS_CODE.FORBIDDEN
            ));
          }
        }
        resolve(decoded);
      });
    });

    // Verify that the decoded token contains required user information
    if (!user || !user.user_id) {
      throw new CustomError(
        "FORBIDDEN",
        "Invalid token payload!",
        STATUS_CODE.FORBIDDEN
      );
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export default verifyToken;
