import db from "../configs/db.js";

export async function getRegions() {
  const sql = `CALL GetRegion()`;
  const [result] = await db.query(sql);
  return result[0]; // Trả về danh sách các vùng
}
