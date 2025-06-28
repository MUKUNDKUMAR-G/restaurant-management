import db from "../configs/db.js";
import CustomError from "../utils/errors.js";

// Add the searchEmployees function
export async function searchEmployees({
  query = "",
  branch_id = "",
  department_id = "",
  page = 1,
  limit = 10,
}) {
  const p_query_name = "employees.employee_id";
  const p_query = query;
  const p_page = parseInt(page, 10) || 1;
  const p_limit = parseInt(limit, 10) || 10;
  const p_tableName = "employees";
  const p_orderByField = "employee_branches.department_id";
  const p_orderByDirection = "DESC";
  const p_category_name = "employee_branches.department_id";
  const p_category = department_id;
  const p_id_name = "employee_id";
  const p_selectFields =
    "employees.employee_id, employees.employee_name, employees.employee_email, employees.date_of_birth, employees.gender, employees.employee_phone_number, employees.employee_address, employees.employee_rating, employees.hire_date, employees.quit_date, employee_branches.branch_id, employee_branches.department_id, employee_branches.start_date, employee_branches.end_date, departments.salary, departments.department_name";
  const p_joinClause =
    "JOIN employee_branches ON employees.current_work_id = employee_branches.employee_branches_id JOIN departments ON employee_branches.department_id = departments.department_id";
  const p_branch_name = "employee_branches.branch_id";
  const p_branch_id = branch_id;

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
    p_joinClause,
  ];

  const [results] = await db.query(sql, params);

  // Retrieve the total records from the OUT parameter
  const [[{ totalRecords }]] = await db.query(
    "SELECT @totalRecords as totalRecords;"
  );
  p_totalRecords = totalRecords;

  return {
    employees: results[0],
    totalRecords: p_totalRecords,
  };
}

export async function addEmployee(employeeData) {
  const {
    employee_name,
    employee_email,
    date_of_birth,
    gender,
    employee_phone_number,
    employee_address,
    branch_name,
    department_name
  } = employeeData;

  // Start a transaction
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    // 1. Create the employee record
    const createEmployeeSql = `CALL CreateEmployee(?, ?, ?, ?, ?, ?)`;
    const createEmployeeParams = [
    employee_name,
    employee_email,
    date_of_birth,
    gender,
    employee_phone_number,
    employee_address,
  ];
    const [createResult] = await connection.query(createEmployeeSql, createEmployeeParams);
    const employee = createResult[0][0];

    // 2. Get branch_id and department_id
    const getBranchIdSql = `CALL GetBranchId(?)`;
    const [branchRows] = await connection.query(getBranchIdSql, [branch_name]);
    const branch_id = branchRows[0][0].branch_id;

    const getDepartmentIdSql = `CALL GetDepartmentId(?)`;
    const [departmentRows] = await connection.query(getDepartmentIdSql, [department_name]);
    const department_id = departmentRows[0][0].department_id;

    // 3. Special case: If the department is 'Manager'
    if (department_name === "Manager") {
      const dethroneManagerSql = `CALL DethroneCurrentManager(?)`;
      await connection.query(dethroneManagerSql, [branch_id]);
    }

    // 4. Create employee_branches record
    const insertBranchSql = `CALL InsertEmployeeBranchRecord(?, ?, ?)`;
    const [branchResult] = await connection.query(insertBranchSql, [
      employee.employee_id,
      branch_id,
      department_id,
    ]);
    const newEmployeeBranchesId = branchResult[0][0].new_employee_branches_id;

    // 5. Update current_work_id on employees
    const setCurrentWorkSql = `CALL SetCurrentWorkId(?, ?)`;
    await connection.query(setCurrentWorkSql, [employee.employee_id, newEmployeeBranchesId]);

    // Commit the transaction
    await connection.commit();

  return employee;
  } catch (error) {
    // Rollback in case of error
    await connection.rollback();
    throw error;
  } finally {
    // Release the connection
    connection.release();
  }
}

export async function deleteEmployee(employeeId) {
  const sql = `CALL UpdateEmployeeQuitDate(?)`;
  const params = [employeeId];
  const [result] = await db.query(sql, params);

  // Check if any rows were affected
  if (result.affectedRows === 0) {
    throw new CustomError(
      "NOT_FOUND",
      "Employee not found",
      STATUS_CODE.NOT_FOUND
    );
  }

  return;
}

export async function updateEmployee(employeeId, updateData) {
  /*
      updateData may include keys:
      {
        employee_name,
        employee_email,
        date_of_birth,
        gender,
        employee_phone_number,
        employee_address,
        branch_name,
        department_name
      }
    */

  // 1. Update basic employee information first
  const sqlUpdateEmployee = `CALL UpdateEmployeeInfo(?, ?, ?, ?, ?, ?)`;
  const paramsEmployee = [
    employeeId,
    updateData.employee_name || null,
    updateData.employee_email || null,
    updateData.date_of_birth || null,
    updateData.gender || null,
    updateData.employee_phone_number || null,
  ];
  await db.query(sqlUpdateEmployee, paramsEmployee);

  // 2. If no branch or department data provided, just update private info
  const hasBranch = updateData.branch_name !== undefined;
  const hasDepartment = updateData.department_name !== undefined;

  if (!hasBranch && !hasDepartment) {
    // No further steps needed
    return;
  }

  // 3. If we reach here, either branch or department or both are provided
  //    Step 1: Set end_date for the current employee_branches record
  const closeBranchSql = `CALL UpdateEndDateEmployeeBranch(?)`;
  await db.query(closeBranchSql, [employeeId]);

  // 4. If branch_id is null => set current_work_id to null and exit
  if (updateData.branch_name === null) {
    const removeCurrentWorkSql = `CALL SetCurrentWorkNull(?)`;
    await db.query(removeCurrentWorkSql, [employeeId]);
    return;
  }

  // 4.5. Get the branch_id and department_id from the provided branch_name and department_name
  if (updateData.branch_name) {
    const getBranchIdSql = `CALL GetBranchId(?)`;
    const [branchRows] = await db.query(getBranchIdSql, [
      updateData.branch_name,
    ]);
    updateData.branch_id = branchRows[0][0].branch_id;
  }

  if (updateData.department_name) {
    const getDepartmentIdSql = `CALL GetDepartmentId(?)`;
    const [departmentRows] = await db.query(getDepartmentIdSql, [
      updateData.department_name,
    ]);
    updateData.department_id = departmentRows[0][0].department_id;
  }

  // 5. Special case: If the new department_name is 'Manager'
  //    a) Find current manager of the new branch and let them do the "step 4"
  //    b) Then proceed to re-assign the employee
  if (updateData.department_name === "Manager") {
    const dethroneManagerSql = `CALL DethroneCurrentManager(?)`;
    await db.query(dethroneManagerSql, [updateData.branch_id]);
  }

  // 6. Insert a new record in employee_branches with start_date = NOW()
  const sqlNewBranch = `CALL InsertEmployeeBranchRecord(?, ?, ?)`;
  const paramsNewBranch = [
    employeeId,
    updateData.branch_id,
    updateData.department_id,
  ];
  const [rows] = await db.query(sqlNewBranch, paramsNewBranch);
  // newEmployeeBranchesId is the primary key from the newly inserted record
  const newEmployeeBranchesId = rows[0][0].new_employee_branches_id;

  // 7. Update current_work_id on employees to this new ID
  const setCurrentWorkSql = `CALL SetCurrentWorkId(?, ?)`;
  await db.query(setCurrentWorkSql, [employeeId, newEmployeeBranchesId]);

  // Ensure current_work_id is always set to the latest employee_branches record
  const [latestBranchRows] = await db.query(
    `SELECT employee_branches_id FROM employee_branches WHERE employee_id = ? ORDER BY start_date DESC LIMIT 1`,
    [employeeId]
  );
  if (latestBranchRows && latestBranchRows.length > 0) {
    const latestId = latestBranchRows[0].employee_branches_id;
    await db.query(`UPDATE employees SET current_work_id = ? WHERE employee_id = ?`, [latestId, employeeId]);
  }
}

export async function getEmployeeInformation(employeeId) {
  const sql = `CALL GetEmployeeInformation(?)`;
  const [result] = await db.query(sql, [employeeId]);
  return result[0][0];
}

export async function getEmployeeDetails(employeeId) {
  const sql = `CALL GetEmployeeDetailsById(?)`;
  const [result] = await db.query(sql, [employeeId]);
  return result[0][0];
}