import CustomError from "../utils/errors.js";
import STATUS_CODE from "../utils/constants.js";
import formatResponse from "../utils/formatresponse.js";

import {
    addDepartment as addDepartmentService,
    updateDepartment as updateDepartmentService,
    searchDepartments,
    getDepartment as getDepartmentService,
} from "../services/department.service.js";

export const addDepartment = async (req, res, next) => {
  const { department_name, salary } = req.body;

  // Validate required fields
  if (!department_name || salary === undefined) {
    throw new CustomError(
      "BAD_REQUEST",
      "Please provide all required fields",
      STATUS_CODE.BAD_REQUEST
    );
  }

  // Add department
  const department = await addDepartmentService({ department_name, salary });

  // Format response
  const data = {
    department_id: department.department_id,
    department_name: department.department_name,
    salary: department.salary,
  };

  return formatResponse(
    res,
    "Create Department",
    "Department created successfully",
    STATUS_CODE.CREATED,
    data
  );
};

export const updateDepartment = async (req, res, next) => {
  let { departmentId } = req.params;
  departmentId = parseInt(departmentId, 10);

  if (isNaN(departmentId)) {
    throw new CustomError(
      "BAD_REQUEST",
      "Invalid department ID",
      STATUS_CODE.BAD_REQUEST
    );
  }

  const { department_name, salary } = req.body;

  // Validate at least one field to update
  if (department_name === undefined && salary === undefined) {
    throw new CustomError(
      "BAD_REQUEST",
      "Please provide at least one field to update",
      STATUS_CODE.BAD_REQUEST
    );
  }

  // Prepare update data
  const updateData = {};
  if (department_name !== undefined)
    updateData.department_name = department_name;
  if (salary !== undefined) updateData.salary = salary;

  // Perform update
  await updateDepartmentService(departmentId, updateData);

  return formatResponse(
    res,
    "Update Department",
    "Department updated successfully",
    STATUS_CODE.SUCCESS,
    null
  );
};

export const getDepartment = async (req, res, next) => {
  const departments = await getDepartmentService();

  // Format response
  const data = departments.map((department) => ({
    department_id: department.department_id,
    department_name: department.department_name,
  }));

  return formatResponse(
    res,
    "Get All Departments",
    "Get all departments successfully",
    STATUS_CODE.SUCCESS,
    data
  );
};

// Add the searchDepartmentsController
export const searchDepartmentsController = async (req, res, next) => {
    const { query = '', page = 1, limit = 10, sort = 'department_name,asc' } = req.query;

    // Validate page and limit
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    if (isNaN(parsedPage) || parsedPage < 1) {
        throw new CustomError("BAD_REQUEST", "Invalid page number", STATUS_CODE.BAD_REQUEST, []);
    }
    if (isNaN(parsedLimit) || parsedLimit < 1) {
        throw new CustomError("BAD_REQUEST", "Invalid limit value", STATUS_CODE.BAD_REQUEST, []);
    }

    // Validate sort
    const [sortField, sortDirection] = sort.split(',');
    const validSortFields = ['department_name', 'salary'];
    const validSortDirections = ['asc', 'desc'];
    if (!validSortFields.includes(sortField) || !validSortDirections.includes(sortDirection.toLowerCase())) {
        throw new CustomError("BAD_REQUEST", "Invalid sort parameters", STATUS_CODE.BAD_REQUEST);
    }

    const { departments, totalRecords } = await searchDepartments({ query, page: parsedPage, limit: parsedLimit, sort });

    // Calculate pagination details
    const totalPages = Math.ceil(totalRecords / parsedLimit);
    const hasMore = parsedPage < totalPages;

    // if (parsedPage > totalPages && totalPages !== 0) {
    //     throw new CustomError("BAD_REQUEST", "Page number exceeds total pages", STATUS_CODE.BAD_REQUEST);
    // }

    const data = {
        departments: departments.map(dept => ({
            department_id: dept.department_id,
            department_name: dept.department_name,
            salary: dept.salary,
            people: dept.cnt
        })),
        pagination: {
            currentPage: parsedPage,
            pageSize: parsedLimit,
            totalPages: totalPages,
            hasMore: hasMore
        }
    };

    return formatResponse(res, "Search Departments", "Departments retrieved successfully", STATUS_CODE.SUCCESS, data);
};
