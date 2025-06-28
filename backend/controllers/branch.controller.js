import CustomError from "../utils/errors.js";
import STATUS_CODE from "../utils/constants.js";
import formatResponse from "../utils/formatresponse.js";
import {
  addBranch as addBranchService,
  updateBranch as updateBranchService,
  searchBranches,
  getBranch as getBranchService,
  GetContract
} from "../services/branch.service.js";
import e from "express";
import { parse } from 'dotenv';

// ...existing code...

export const createBranch = async (req, res, next) => {
  const {
    region_id,
    branch_name,
    address,
    open_time,
    close_time,
    phone_number,
    email,
    has_car_park,
    has_motorbike_park,
    table_amount,
  } = req.body;

  // Validate required fields
  if (
    !branch_name ||
    !address ||
    !open_time ||
    !close_time ||
    !phone_number ||
    !region_id ||
    !email ||
    has_car_park === undefined ||
    has_motorbike_park === undefined ||
    table_amount === undefined
  ) {
    throw new CustomError(
      "BAD_REQUEST",
      "Please provide all required fields",
      STATUS_CODE.BAD_REQUEST
    );
  }

  // Add branch
  const branch = await addBranchService({
    region_id,
    branch_name,
    address,
    open_time,
    close_time,
    phone_number,
    email,
    has_car_park,
    has_motorbike_park,
    table_amount,
  });

  // Format response
  const data = {
    region: branch.region,
    branch_id: branch.branch_id,
    branch_name: branch.branch_name,
    address: branch.address,
    open_time: branch.open_time,
    close_time: branch.close_time,
    phone_number: branch.phone_number,
    email: branch.email,
    has_car_park: branch.has_car_park,
    has_motorbike_park: branch.has_motorbike_park,
    table_amount: branch.table_amount,
  };

  return formatResponse(
    res,
    "Create Branch",
    "Branch created successfully",
    STATUS_CODE.CREATED,
    data
  );
};

export const updateBranch = async (req, res, next) => {
  const branch_id = parseInt(req.params.branchId, 10);
  const {
    branch_name,
    address,
    open_time,
    close_time,
    phone_number,
    email,
    has_car_park,
    has_motorbike_park,
    table_amount,
  } = req.body;

  // Validate at least one field to update
  if (
    branch_name === undefined &&
    address === undefined &&
    open_time === undefined &&
    close_time === undefined &&
    phone_number === undefined &&
    email === undefined &&
    has_car_park === undefined &&
    has_motorbike_park === undefined &&
    table_amount === undefined
  ) {
    throw new CustomError(
      "BAD_REQUEST",
      "Please provide at least one field to update",
      STATUS_CODE.BAD_REQUEST
    );
  }

  // Prepare update data
  const updateData = {
    branch_id,
    branch_name,
    address,
    open_time,
    close_time,
    phone_number,
    email,
    has_car_park,
    has_motorbike_park,
    table_amount,
  };

  // Perform update
  const updatedBranch = await updateBranchService(updateData);

  // Format response
  const data = {
    branch_id: updatedBranch.branch_id,
    branch_name: updatedBranch.branch_name,
    address: updatedBranch.address,
    open_time: updatedBranch.open_time,
    close_time: updatedBranch.close_time,
    phone_number: updatedBranch.phone_number,
    email: updatedBranch.email,
    has_car_park: updatedBranch.has_car_park,
    has_motorbike_park: updatedBranch.has_motorbike_park,
    table_amount: updatedBranch.table_amount,
  };

  return formatResponse(
    res,
    "Update Branch",
    "Branch updated successfully",
    STATUS_CODE.SUCCESS,
    data
  );
};

// Add the searchBranchesController
export const searchBranchesController = async (req, res, next) => {
  const { query = "", page = 1, limit = 10, region_id = "" } = req.query;

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
      STATUS_CODE.BAD_REQUEST
    );
  }

  const { branches, totalRecords } = await searchBranches({
    query,
    page: parsedPage,
    limit: parsedLimit,
    region_id,
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
    branches: branches.map((branch) => ({
      branch_id: branch.branch_id,
      region_id: branch.region_id,
      branch_name: branch.branch_name,
      address: branch.address,
      open_time: branch.open_time,
      close_time: branch.close_time,
      phone_number: branch.phone_number,
      email: branch.email,
      has_car_park: branch.has_car_park,
      has_motorbike_park: branch.has_motorbike_park,
      table_amount: branch.table_amount,
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
    "Search Branches",
    "Branches retrieved successfully",
    STATUS_CODE.SUCCESS,
    data
  );
};

// ...existing code...
export const getBranch = async (req, res, next) => {
  try {
    const branches = await getBranchService();
    if (!branches || !Array.isArray(branches)) {
      return formatResponse(
        res,
        "Get Branches",
        "No branches found",
        STATUS_CODE.SUCCESS,
        []
      );
    }
    // Format response
    const data = branches.map((branch) => ({
      branch_id: branch.branch_id,
      branch_name: branch.branch_name,
      address: branch.address,
      open_time: branch.open_time,
      close_time: branch.close_time,
      phone_number: branch.phone_number,
      has_car_park: branch.has_car_park,
      has_motorbike_park: branch.has_motorbike_park,
      table_amount: branch.table_amount,
      region_id: branch.region_id,
      manager_id: branch.manager_id,
    }));

    return formatResponse(
      res,
      "Get Branches",
      "Branches retrieved successfully",
      STATUS_CODE.SUCCESS,
      data
    );
  } catch (error) {
    console.error("Error in getBranch:", error);
    next(error);
  }
};
export const getContract = async (req, res) =>{
    let {branchId} = req.params;
    branchId = parseInt(branchId, 10);
    if(isNaN(branchId)){
        throw new CustomError("BAD_REQUEST", "Invalid branch id", STATUS_CODE.BAD_REQUEST);
    }
    const contract = await GetContract(branchId);
    return formatResponse(res, "Get Contract", "Get contract successfully", STATUS_CODE.SUCCESS, contract);
}

// ...existing code...
