// addUsers.js
import bcrypt from "bcryptjs";
import db from "./configs/db.js"; // Adjust path if needed

async function addUser({
  user_name,
  user_password,
  user_email,
  user_phone_number,
  user_address,
  is_staff,
  staff_id,
  staff_branch,
  is_admin,
}) {
  const hashedPassword = bcrypt.hashSync(user_password, 10);
  const sql = `
    INSERT INTO online_account
    (user_name, user_password, user_email, user_phone_number, user_address, is_staff, staff_id, staff_branch, is_admin, created_at, update_at, last_visited, refresh_token)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW(), NULL)
  `;
  await db.query(sql, [
    user_name,
    hashedPassword,
    user_email,
    user_phone_number,
    user_address,
    is_staff,
    staff_id,
    staff_branch,
    is_admin,
  ]);
  console.log(`User ${user_name} added!`);
}

async function main() {
  await addUser({
    user_name: "staff_sneha",
    user_password: "Sneha@123",
    user_email: "sneha.staff@example.com",
    user_phone_number: "919812345678",
    user_address: "Staff Quarters, Mumbai",
    is_staff: 1,
    staff_id: 3,
    staff_branch: 2,
    is_admin: 0,
  });

  await addUser({
    user_name: "admin_ravi",
    user_password: "Ravi@123",
    user_email: "ravi.admin@example.com",
    user_phone_number: "919812345679",
    user_address: "Admin Block, Mumbai HQ",
    is_staff: 1,
    staff_id: 4,
    staff_branch: 2,
    is_admin: 1,
  });

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});