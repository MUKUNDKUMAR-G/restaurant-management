import { getWardsByDistrict } from "../services/ward.service.js";
export const GetWards = async (req, res) => {
  const { district_id } = req.query;
  if (!district_id) return res.status(400).json({ error: "district_id required" });
  const wards = await getWardsByDistrict(district_id);
  res.json({ data: wards });
}; 