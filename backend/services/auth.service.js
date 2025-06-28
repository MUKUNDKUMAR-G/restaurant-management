import db from '../configs/db.js';

async function createUserInDb({ user_name, user_password, user_email, user_phone_number, user_address }) {
    const sql = 'CALL CreateUser(?,?,?,?,?)';
    const params = [user_name, user_password, user_email, user_phone_number, user_address];
    await db.execute(sql, params);
}
  
export { createUserInDb };