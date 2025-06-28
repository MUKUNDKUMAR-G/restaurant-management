import CustomError from "../utils/errors.js";
import STATUS_CODE from "../utils/constants.js";
import formatResponse from "../utils/formatresponse.js";
import { searchMenu as searchMenuService } from "../services/menu.service.js";
import { checkBranchExists } from "../services/check.service.js";
import { getMenuByBranch } from "../services/menu.service.js";
import db from "../configs/db.js";

// ...existing code...

export const searchMenu = async (req, res, next) => {
  try {
    // Always return all dishes
    const [listDish] = await db.query(
      "SELECT dish_id, dish_name, price, image_link, description FROM dishes"
    );
    const data = {
      listDish: listDish.map((dish) => ({
        dish_id: dish.dish_id,
        dish_name: dish.dish_name,
        price: dish.price,
        image_link: dish.image_link,
        description: dish.description,
      })),
      pagination: {
        currentPage: 1,
        pageSize: listDish.length,
        totalPages: 1,
        hasMore: false,
      },
    };
    return formatResponse(
      res,
      "Search Menu",
      "Menu retrieved successfully",
      STATUS_CODE.SUCCESS,
      data
    );
  } catch (error) {
    console.error("Error in searchMenu:", error);
    next(error);
  }
};
