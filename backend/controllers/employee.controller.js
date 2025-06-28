import CustomError from "../utils/errors.js";
import STATUS_CODE from "../utils/constants.js";
import formatResponse from "../utils/formatresponse.js";

import {
  checkEmployeeExists,
  checkBranchExists,
} from "../services/check.service.js";

import {
  addEmployee as addEmployeeService,
  deleteEmployee as deleteEmployeeService,
  updateEmployee as updateEmployeeService,
  getEmployeeInformation as getEmployeeInformationService,
  searchEmployees,
  getEmployeeDetails as getEmployeeDetailsService,
} from "../services/employee.service.js";

export const addEmployee = async (req, res, next) => {
  const {
    employee_name,
    employee_email,
    date_of_birth,
    gender,
    employee_phone_number,
    employee_address,
    branch_name,
    department_name
  } = req.body;

  // Validate required fields
  if (
    !employee_name ||
    !employee_email ||
    !date_of_birth ||
    !gender ||
    !employee_phone_number ||
    !employee_address ||
    !branch_name ||
    !department_name
  ) {
    throw new CustomError(
      "BAD_REQUEST",
      "Please provide all required fields including branch and department",
      STATUS_CODE.BAD_REQUEST
    );
  }

  // Add employee
  const employee = await addEmployeeService({
    employee_name,
    employee_email,
    date_of_birth,
    gender,
    employee_phone_number,
    employee_address,
    branch_name,
    department_name
  });

  // Format response
  const data = {
    employee_id: employee.employee_id,
    employee_name: employee.employee_name,
    employee_email: employee.employee_email,
    date_of_birth: employee.date_of_birth,
    gender: employee.gender,
    employee_phone_number: employee.employee_phone_number,
    employee_address: employee.employee_address,
    hire_date: employee.hire_date,
    quit_date: employee.quit_date,
  };

  return formatResponse(
    res,
    "Add Staff Information",
    "Add staff successfully",
    STATUS_CODE.CREATED,
    data
  );
};

export const deleteEmployee = async (req, res, next) => {
  let { employeeId } = req.params;

  employeeId = parseInt(employeeId, 10);

  // Check if the employee exists and has not quit
  await checkEmployeeExists(employeeId);

  await deleteEmployeeService(employeeId);

  return formatResponse(
    res,
    "Delete Employee",
    "Employee deleted successfully",
    STATUS_CODE.SUCCESS,
    null
  );
};

export const updateEmployee = async (req, res, next) => {
  let { employeeId } = req.params;
  employeeId = parseInt(employeeId, 10);

  await checkEmployeeExists(employeeId);

  const updateData = req.body;

  // Perform update
  await updateEmployeeService(employeeId, updateData);

  return formatResponse(
    res,
    "Update Employee Information",
    "Employee updated successfully",
    STATUS_CODE.SUCCESS,
    null
  );
};

export const searchEmployeesController = async (req, res, next) => {
  const {
    query = "",
    branch_id = "",
    department_id = "",
    page = 1,
    limit = 10,
  } = req.query;

  // Validate page and limit
  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);

  if (isNaN(parsedPage) || parsedPage < 1) {
    throw new CustomError(
      "BAD_REQUEST",
      "Invalid page number",
      STATUS_CODE.BAD_REQUEST,
      []
    );
  }
  if (isNaN(parsedLimit) || parsedLimit < 1) {
    throw new CustomError(
      "BAD_REQUEST",
      "Invalid limit value",
      STATUS_CODE.BAD_REQUEST,
      []
    );
  }

  // Validate branch if provided
  if (branch_id) {
    await checkBranchExists(branch_id);
  }

  const { employees, totalRecords } = await searchEmployees({
    query,
    branch_id,
    department_id,
    page: parsedPage,
    limit: parsedLimit,
  });

  // Calculate pagination details
  const totalPages = Math.ceil(totalRecords / parsedLimit);
  const hasMore = parsedPage < totalPages;

  // if (parsedPage > totalPages && totalPages !== 0) {
  //   throw new CustomError(
  //     "BAD_REQUEST",
  //     "Page number exceeds total pages",
  //     STATUS_CODE.BAD_REQUEST
  //   );
  // }

  const data = {
    employees: employees.map((emp) => ({
      employee_id: emp.employee_id,
      employee_name: emp.employee_name,
      employee_email: emp.employee_email,
      date_of_birth: emp.date_of_birth,
      gender: emp.gender,
      employee_phone_number: emp.employee_phone_number,
      employee_address: emp.employee_address,
      employees_rating: emp.employee_rating,
      hire_date: emp.start_date,
      quit_date: emp.end_date,
      employee_salary: emp.salary,
      branch_id: emp.branch_id,
      department_id: emp.department_id,
      department_name: emp.department_name,
      start_date_branch: emp.start_date,
      end_date_branch: emp.end_date,
    })),
    pagination: {
      currentPage: parsedPage,
      pageSize: parsedLimit,
      totalPages: totalPages,
      hasMore: hasMore,
    },
  };

  return formatResponse(
    res,
    "Search Employees",
    "Employees retrieved successfully",
    STATUS_CODE.SUCCESS,
    data
  );
};

export const getEmployeeInformation = async (req, res) => {
  const employeeId = req.user.staff_id;

  if (isNaN(employeeId)) {
    throw new CustomError(
      "BAD_REQUEST",
      "Invalid employee ID",
      STATUS_CODE.BAD_REQUEST
    );
  }

  const employee = await getEmployeeInformationService(employeeId);

  return formatResponse(
    res,
    "Get Employee Information",
    "Employee information retrieved successfully",
    STATUS_CODE.SUCCESS,
    employee
  );
};

export const getEmployeeDetails = async (req, res) => {
  const { employeeId } = req.params;
  if (isNaN(employeeId)) {
    throw new CustomError(
      "BAD_REQUEST",
      "Invalid employee ID",
      STATUS_CODE.BAD_REQUEST
    );
  }
  const employee = await getEmployeeDetailsService(employeeId);
  return formatResponse(
    res,
    "Get Employee Information",
    "Employee information retrieved successfully",
    STATUS_CODE.SUCCESS,
    employee
  );
};
