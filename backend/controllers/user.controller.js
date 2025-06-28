import CustomError from "../utils/errors.js";
import STATUS_CODE from "../utils/constants.js";
import formatResponse from "../utils/formatresponse.js";
import bcrypt from "bcryptjs";
import db from "../configs/db.js";

import { updateUser as updateUserService, updateUserPassword as updateUserPasswordService, getUser } from '../services/user.service.js';

// ...existing code...

export const updateUser = async (req, res, next) => {
  const userId = req.user.user_id;
  // let { userId } = req.params;
  // userId = parseInt(userId, 10);

  if (isNaN(userId)) {
    throw new CustomError(
      "BAD_REQUEST",
      "Invalid user ID",
      STATUS_CODE.BAD_REQUEST
    );
  }

  const { user_name, user_email, user_address, user_phone_number } = req.body;

  // Validate at least one field to update
  if (
    user_name === undefined &&
    user_email === undefined &&
    user_address === undefined &&
    user_phone_number === undefined
  ) {
    throw new CustomError(
      "BAD_REQUEST",
      "Please provide at least one field to update",
      STATUS_CODE.BAD_REQUEST
    );
  }

  // Prepare update data
  const updateData = {};
  if (user_name !== undefined) updateData.user_name = user_name;
  if (user_email !== undefined) updateData.user_email = user_email;
  if (user_address !== undefined) updateData.user_address = user_address;
  if (user_phone_number !== undefined)
    updateData.user_phone_number = user_phone_number;

  // Perform update
  await updateUserService(userId, updateData);

  return formatResponse(
    res,
    "Update User Information",
    "User information updated successfully",
    STATUS_CODE.SUCCESS,
    null
  );
};

export const updateUserPassword = async (req, res, next) => {
  const userId = req.user.user_id;
  // let { userId } = req.params;
  // userId = parseInt(userId, 10);

  if (isNaN(userId)) {
    throw new CustomError(
      "BAD_REQUEST",
      "Invalid user ID",
      STATUS_CODE.BAD_REQUEST
    );
  }

  const { current_password, new_password } = req.body;

  // Validate required fields
  if (!current_password || !new_password) {
    throw new CustomError(
      "BAD_REQUEST",
      "Please provide both current and new passwords",
      STATUS_CODE.BAD_REQUEST
    );
  }

  // Retrieve the user's current hashed password from the database
  const userCheckSql =
    "SELECT user_password FROM online_account WHERE user_id = ? LIMIT 1";
  const [existingRows] = await db.query(userCheckSql, [userId]);

  if (existingRows.length === 0) {
    throw new CustomError(
      "NOT_FOUND",
      "User does not exist",
      STATUS_CODE.NOT_FOUND
    );
  }

  const user = existingRows[0];

  // Compare current_password with the hashed password in the database
  const isMatch = await bcrypt.compare(current_password, user.user_password);
  if (!isMatch) {
    throw new CustomError(
      "BAD_REQUEST",
      "Current password is incorrect",
      STATUS_CODE.BAD_REQUEST
    );
  }

  // Hash the new password
  const salt = bcrypt.genSaltSync(10);
  const hashedNewPassword = bcrypt.hashSync(new_password, salt);

  // Perform password update
  await updateUserPasswordService(userId, hashedNewPassword);

  return formatResponse(
    res,
    "Update Password",
    "Password updated successfully",
    STATUS_CODE.SUCCESS,
    null
  );
};

// ...existing code...
export const GetUser = async (req, res, next) => {
  const userId = req.user.user_id;
  if (isNaN(userId)) {
      throw new CustomError("BAD_REQUEST", "Invalid user ID", STATUS_CODE.BAD_REQUEST);
  }

  const rows = await getUser(userId);

  return formatResponse(res, "Get User Information", "Get user information successfully", STATUS_CODE.SUCCESS, rows);

};