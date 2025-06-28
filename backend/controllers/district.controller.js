import { getDistrictsByRegion } from "../services/district.service.js";
export const GetDistricts = async (req, res) => {
  const { region_id } = req.query;
  if (!region_id) return res.status(400).json({ error: "region_id required" });
  const districts = await getDistrictsByRegion(region_id);
  res.json({ data: districts });
}; 