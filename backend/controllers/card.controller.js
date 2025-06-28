import CustomError from '../utils/errors.js';
import STATUS_CODE from '../utils/constants.js';
import formatResponse from '../utils/formatresponse.js';
import { addMemberCard as addMemberCardService, updateMemberCard as updateMemberCardService, searchMemberCards } from '../services/card.service.js';
import { checkUserValid, getUserId } from '../services/check.service.js';

// ...existing code...

export const createMemberCard = async (req, res, next) => {
    const { member_id, member_name, member_phone_number, member_gender } = req.body;
    const branch_id = parseInt(req.params.branchId, 10);

    // Validate required fields
    if (
        !member_id ||
        !member_name ||
        !member_phone_number ||
        !member_gender ||
        !branch_id
    ) {
        throw new CustomError("BAD_REQUEST", "Please provide all required fields", STATUS_CODE.BAD_REQUEST);
    }

    // Validate member_gender
    const validGenders = ['Male', 'Female', 'Other'];
    if (!validGenders.includes(member_gender)) {
        throw new CustomError("BAD_REQUEST", "Invalid member_gender value", STATUS_CODE.BAD_REQUEST);
    }

    // Add member card
    const memberCard = await addMemberCardService({
        member_id,
        member_name,
        member_phone_number,
        member_gender,
        card_issuer: req.user.user_id,
        branch_created: branch_id
    });

    // Format response
    const data = {
        member_card_id: memberCard.member_card_id,
        created_at: memberCard.created_at,
        updated_at: memberCard.updated_at,
        total_points: memberCard.total_points,
        card_issuer: memberCard.card_issuer,
        branch_created: memberCard.branch_created,
        card_type_id: memberCard.card_type_id,
        member_id: memberCard.member_id,
        member_name: memberCard.member_name,
        member_phone_number: memberCard.member_phone_number,
        member_gender: memberCard.member_gender,
        user_id: memberCard.user_id,
        is_active: memberCard.is_active
    };

    return formatResponse(res, "Create Member Card", "Member card created successfully", STATUS_CODE.CREATED, data);
};

export const updateMemberCard = async (req, res, next) => {
    const { member_id, member_name, member_phone_number, member_gender, user_email, is_active } = req.body;
    const cardId = parseInt(req.params.cardId, 10);

    // Validate required field: member_card_id
    if (!cardId) {
        throw new CustomError("BAD_REQUEST", "Please provide cardId in the URL", STATUS_CODE.BAD_REQUEST);
    }

    // Validate at least one field to update
    if (
        member_id === undefined &&
        member_name === undefined &&
        member_phone_number === undefined &&
        member_gender === undefined &&
        user_email === undefined &&
        is_active === undefined
    ) {
        throw new CustomError("BAD_REQUEST", "Please provide at least one field to update", STATUS_CODE.BAD_REQUEST);
    }

    // Validate member_gender if provided
    const validGenders = ['Male', 'Female', 'Other'];
    if (member_gender !== undefined && !validGenders.includes(member_gender)) {
        throw new CustomError("BAD_REQUEST", "Invalid member_gender value", STATUS_CODE.BAD_REQUEST);
    }

    // Get user_id from user_email
    let user_id;
    if (user_email !== undefined) {
        const user = await getUserId(user_email);
        user_id = user.user_id;
    }
    // // If user_id is provided, validate it
    // if (user_id !== undefined) {
    //     await checkUserValid(user_id);
    // }

    // Prepare update data
    const updateData = {
        member_card_id: cardId,
        member_id,
        member_name,
        member_phone_number,
        member_gender,
        user_id,
        is_active
    };

    // Perform update
    const updatedCard = await updateMemberCardService(updateData);

    // Format response
    const data = {
        member_card_id: updatedCard.member_card_id,
        created_at: updatedCard.created_at,
        updated_at: updatedCard.updated_at,
        total_points: updatedCard.total_points,
        card_issuer: updatedCard.card_issuer,
        branch_created: updatedCard.branch_created,
        card_type_id: updatedCard.card_type_id,
        member_id: updatedCard.member_id,
        member_name: updatedCard.member_name,
        member_phone_number: updatedCard.member_phone_number,
        member_gender: updatedCard.member_gender,
        user_id: updatedCard.user_id,
        is_active: updatedCard.is_active
    };

    return formatResponse(res, "Update Member Card", "Member card updated successfully", STATUS_CODE.SUCCESS, data);
};

// Add the searchMemberCardsController
export const searchMemberCardsController = async (req, res, next) => {
    const { query = '', page = 1, limit = 10 } = req.query;

    // Validate page and limit
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    if (isNaN(parsedPage) || parsedPage < 1) {
        throw new CustomError("BAD_REQUEST", "Invalid page number", STATUS_CODE.BAD_REQUEST, []);
    }
    if (isNaN(parsedLimit) || parsedLimit < 1) {
        throw new CustomError("BAD_REQUEST", "Invalid limit value", STATUS_CODE.BAD_REQUEST, []);
    }

    const { memberCards, totalRecords } = await searchMemberCards({ query, page: parsedPage, limit: parsedLimit });

    // Calculate pagination details
    const totalPages = Math.ceil(totalRecords / parsedLimit);
    const hasMore = parsedPage < totalPages;

    // if (parsedPage > totalPages && totalPages !== 0) {
    //     throw new CustomError("BAD_REQUEST", "Page number exceeds total pages", STATUS_CODE.BAD_REQUEST);
    // }

    const data = {
        memberCards: memberCards.map(card => ({
            member_card_id: card.member_card_id,
            member_id: card.member_id,
            total_points: card.total_points,
            member_name: card.member_name,
            member_phone_number: card.member_phone_number,
            member_gender: card.member_gender,
            card_issuer: card.card_issuer,
            branch_created: card.branch_created,
            is_active: card.is_active,
            created_at: card.created_at,
            card_type_id: card.card_type_id,
            card_type_name: card.card_type_name
        })),
        pagination: {
            currentPage: parsedPage,
            pageSize: parsedLimit,
            totalPages: totalPages,
            hasMore: hasMore
        }
    };

    return formatResponse(res, "Search Member Cards", "Member cards retrieved successfully", STATUS_CODE.SUCCESS, data);
};

// ...existing code...