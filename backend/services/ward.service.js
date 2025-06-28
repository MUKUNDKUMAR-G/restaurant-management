import db from "../configs/db.js";
export async function getWardsByDistrict(district_id) {
  const [rows] = await db.query("SELECT ward_id, ward_name FROM wards WHERE district_id = ?", [district_id]);
  return rows;
} 