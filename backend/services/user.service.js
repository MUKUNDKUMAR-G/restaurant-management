import db from "../configs/db.js";
import CustomError from "../utils/errors.js";
import STATUS_CODE from "../utils/constants.js";

export async function updateUser(userId, updateData) {
  const { user_name, user_email, user_address, user_phone_number } = updateData;
  const sql = `CALL UpdateUserInfo(?, ?, ?, ?, ?)`;
  const params = [
    userId,
    user_name || null,
    user_email || null,
    user_address || null,
    user_phone_number || null,
  ];
  const [result] = await db.query(sql, params);

  // Check if any rows were affected
  if (result.affectedRows === 0) {
    throw new CustomError("NOT_FOUND", "User not found", STATUS_CODE.NOT_FOUND);
  }

  return;
}

export async function updateUserPassword(userId, newHashedPassword) {
  const sql = `CALL UpdateUserPassword(?, ?)`;
  const params = [userId, newHashedPassword];
  const [result] = await db.query(sql, params);

  // Check if any rows were affected
  if (result.affectedRows === 0) {
    throw new CustomError("NOT_FOUND", "User not found", STATUS_CODE.NOT_FOUND);
  }

  return;
}

export async function getUser(userId) {
  const sql = `CALL GetUserInformation(?)`;
  const [result] = await db.query(sql, [userId]);
  return result[0][0];
}
