import db from "../configs/db.js";
export async function getDistrictsByRegion(region_id) {
  const [rows] = await db.query("SELECT district_id, district_name FROM districts WHERE region_id = ?", [region_id]);
  return rows;
} 