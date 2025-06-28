// ...existing code...
import db from '../configs/db.js';
import CustomError from '../utils/errors.js';
import STATUS_CODE from '../utils/constants.js';

// Add the searchDepartments function
export async function searchDepartments({ query = '', page = 1, limit = 10, sort = 'department_name,asc' }) {
    const [sortField, sortDirection] = sort.split(',');
    const validSortFields = ['department_name', 'salary'];
    const validSortDirections = ['asc', 'desc'];

    // Validate sort parameters
    if (!validSortFields.includes(sortField) || !validSortDirections.includes(sortDirection.toLowerCase())) {
        throw new CustomError("BAD_REQUEST", "Invalid sort parameters", STATUS_CODE.BAD_REQUEST);
    }

    const p_query_name = 'departments.department_name';
    const p_query = query;
    const p_page = parseInt(page, 10) || 1;
    const p_limit = parseInt(limit, 10) || 10;
    const p_tableName = 'departments';
    const p_orderByField = sortField;
    const p_orderByDirection = sortDirection.toUpperCase();
    const p_category_name = '';
    const p_category = '';
    const p_id_name = 'departments.department_id';
    const p_selectFields = 'departments.department_id, departments.department_name, departments.salary, (CASE WHEN eb.cnt IS NULL THEN 0 ELSE eb.cnt END) as cnt';
    const p_joinClause = 'LEFT JOIN (SELECT department_id, COUNT(*) AS cnt FROM employee_branches WHERE end_date IS NULL GROUP BY department_id) AS eb ON departments.department_id = eb.department_id'; // No joins needed as only the 'departments' table is used
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
        departments: results[0],
        totalRecords: p_totalRecords
    };
}

// ...existing code...

export async function addDepartment(departmentData) {
  const { department_name, salary } = departmentData;
  const sql = `CALL CreateDepartment(?, ?)`;
  const params = [department_name, salary];
  const [result] = await db.query(sql, params);
  const department = result[0][0];
  return department;
}

export async function updateDepartment(departmentId, updateData) {
  const { department_name, salary } = updateData;
  const sql = `CALL UpdateDepartmentInfo(?, ?, ?)`;
  const params = [
    departmentId,
    department_name || null,
    salary !== undefined ? salary : null,
  ];
  const [result] = await db.query(sql, params);

  // Check if any rows were affected
  if (result.affectedRows === 0) {
    throw new CustomError(
      "NOT_FOUND",
      "Department not found",
      STATUS_CODE.NOT_FOUND
    );
  }

  return;
}

// ...existing code...

// Export the new function
// export { addDepartment, updateDepartment, searchDepartments };

// ...existing code...

// get all departments with department_id, department_name
export async function getDepartment() {
  const sql = `CALL getDepartment()`;
  const [result] = await db.query(sql);
  const departments = result[0];
  return departments;
}
