import db from "../configs/db.js";
import CustomError from "../utils/errors.js";
import STATUS_CODE from "../utils/constants.js";

// Add the searchBranches function
export async function searchBranches({ query = '', page = 1, limit = 10, region_id = '' }) {
    const p_query_name = 'branch_name';
    const p_query = query;
    const p_page = parseInt(page, 10) || 1;
    const p_limit = parseInt(limit, 10) || 10;
    const p_tableName = 'branches';
    const p_orderByField = '';
    const p_orderByDirection = '';
    const p_category_name = 'region_id';
    const p_category = region_id;
    const p_id_name = 'branch_id';
    const p_selectFields = 'branch_id, region_id, branch_name, address, open_time, close_time, phone_number, email, has_car_park, has_motorbike_park, table_amount';
    const p_joinClause = ''; // No joins needed as only the 'branches' table is used
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
    console.log("Raw results from GetDynamicItems:", results);

    // Retrieve the total records from the OUT parameter
    const [[{ totalRecords }]] = await db.query('SELECT @totalRecords as totalRecords;');
    p_totalRecords = totalRecords;
    console.log("Total records from GetDynamicItems:", p_totalRecords);

    return {
        branches: results[0],
        totalRecords: p_totalRecords
    };
}

export async function addBranch(branchData) {
const {region_id, branch_name, address, open_time, close_time, phone_number, email, has_car_park, has_motorbike_park, table_amount } = branchData;
    const sql = `CALL CreateBranch(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [region_id, branch_name, address, open_time, close_time, phone_number, email, has_car_park, has_motorbike_park, table_amount];
    const [result] = await db.query(sql, params);
    const branch = result[0][0];
    return branch;
}

export async function updateBranch(branchData) {
    const { branch_id, branch_name, address, open_time, close_time, phone_number, email, has_car_park, has_motorbike_park, table_amount } = branchData;
    const sql = `CALL UpdateBranchInfo(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [branch_id, branch_name || null, address || null, open_time || null, close_time || null, phone_number || null, email || null, has_car_park !== undefined ? has_car_park : null, has_motorbike_park !== undefined ? has_motorbike_park : null, table_amount !== undefined ? table_amount : null];
    const [result] = await db.query(sql, params);
    
    // Check if any rows were affected
    if (result.affectedRows === 0) {
        throw new CustomError("NOT_FOUND", "Branch not found", STATUS_CODE.NOT_FOUND);
    }

  const updatedBranch = result[0][0];
  return updatedBranch;
}

// get all branches with branch_id, branch_name
export async function getBranch() {
  const sql = `CALL getBranch()`;
  const [result] = await db.query(sql);
  const branches = result[0];
  return branches;
}


export async function GetContract(branch_id){
    const sql = `CALL GetContract(?)`;
    const [result] = await db.query(sql, [branch_id]);
    return result[0][0];
}