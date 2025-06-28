import db from "../configs/db.js";

export const createDishReview = async ({
  user_id,
  dish_id,
  rating,
  comment,
}) => {
  const callProcedure = "CALL CreateDishReview(?, ?, ?, ?, @success);";
  const selectSuccess = "SELECT @success as success;";

  await db.query(callProcedure, [user_id, dish_id, rating, comment]);
  const [rows] = await db.query(selectSuccess);

  return rows[0].success;
};

export const createDish = async ({
  dish_name,
  price,
  description,
  category_name,
  image_link,
}) => {
  const callProcedure = "CALL CreateDish(?, ?, ?, ?, ?);";

  const [rows] = await db.query(callProcedure, [
    dish_name,
    price,
    description,
    category_name,
    image_link,
  ]);
  const newDish = rows[0][0];
  // Automatically add the new dish to the menu for all branches
  const [branches] = await db.query("SELECT branch_id FROM branches");
  for (const branch of branches) {
    await db.query(
      "INSERT INTO menu (branch_id, dish_id, is_ship, is_serve) VALUES (?, ?, 1, 1)",
      [branch.branch_id, newDish.dish_id]
    );
  }
  return newDish;
};

export const addDishToMenu = async ({ dish_id, branch_id, is_ship }) => {
  const callProcedure = "CALL AddDishToMenu(?, ?, ?);";

  await db.query(callProcedure, [dish_id, branch_id, is_ship]);
};

export const removeDishFromMenu = async (dish_id, branch_id) => {
  const callProcedure = "CALL RemoveDishFromMenu(?, ?);";
  await db.query(callProcedure, [dish_id, branch_id]);
};

export async function updateDish(dishId, updateData) {
  const { dish_name, price, description, category_name, image_link } =
    updateData;
  const sql = `CALL UpdateDishInfo(?, ?, ?, ?, ?, ?)`;
  const params = [
    dishId,
    dish_name || null,
    price !== undefined ? price : null,
    description || null,
    category_name || null,
    image_link || null,
  ];
  const [result] = await db.query(sql, params);

  // Check if any rows were affected
  if (result.affectedRows === 0) {
    throw new CustomError("NOT_FOUND", "Dish not found", STATUS_CODE.NOT_FOUND);
  }

  return;
}

// Add the searchDishes function
export async function searchDishes({ query = '', page = 1, limit = 10 }) {
    const p_query_name = 'dishes.dish_name';
    const p_query = query;
    const p_page = parseInt(page, 10) || 1;
    const p_limit = parseInt(limit, 10) || 10;
    const p_tableName = 'dishes';
    const p_orderByField = '';
    const p_orderByDirection = '';
    const p_category_name = '';
    const p_category = '';
    const p_id_name = 'dish_id';
    const p_selectFields = 'dish_id, dish_name, price, description, image_link, category_name';
    const p_joinClause = ''; // No joins needed as only the 'dishes' table is used
    const p_branch_name = '';
    const p_branch_id = '';

    let p_totalRecords = 0;

    const sql = `CALL GetDynamicItems(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @totalRecords);`;
    const params = [
        p_query_name,
        p_query,
        p_page,
        p_limit,
        p_tableName,
        p_orderByField,
        p_orderByDirection,
        p_category_name,
        p_category,
        p_branch_name,
        p_branch_id,
        p_id_name,
        p_selectFields,
        p_joinClause
    ];

    const [results] = await db.query(sql, params);

    // Retrieve the total records from the OUT parameter
    const [[{ totalRecords }]] = await db.query('SELECT @totalRecords as totalRecords;');
    p_totalRecords = totalRecords;

    return {
        dishes: results[0],
        totalRecords: p_totalRecords
    };
}

// Export the new function
// export { addDish, updateDish, searchDishes };

// export const removeDish = async (dish_id) => {
//     const callProcedure = 'CALL DeleteDish(?);';
//     await db.query(callProcedure, [dish_id]);
// };

export const GetDishById = async (dish_id) => {
    const Query = 'call GetDishDetail(?);';
    const rows = await db.query(Query, [dish_id]);
    return rows[0][0];
};

export async function getCategories() {
  const sql = `CALL GetCategory();`;
  const [result] = await db.query(sql);
  return result[0]; // Trả về danh sách các danh mục
}
