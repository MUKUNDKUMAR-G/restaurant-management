import { getRegions } from "../services/region.service.js";

const GetRegions = async (req, res) => {
  // Your logic here
  const regions = await getRegions();
  const data = {
    data: regions,
  };
  res.json(data);
};

export { GetRegions };
