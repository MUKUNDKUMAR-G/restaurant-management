import db from '../configs/db.js';
import CustomError from '../utils/errors.js';
import STATUS_CODE from '../utils/constants.js';

// Add the searchMemberCards function
async function searchMemberCards({ query = '', page = 1, limit = 10 }) {
    const p_query_name = 'member_cards.member_id';
    const p_query = query;
    const p_page = parseInt(page, 10) || 1;
    const p_limit = parseInt(limit, 10) || 10;
    const p_tableName = 'member_cards';
    const p_orderByField = 'member_cards.created_at';
    const p_orderByDirection = 'DESC';
    const p_category_name = '';
    const p_category = '';
    const p_id_name = 'member_cards.member_card_id';
    const p_selectFields = 'member_cards.member_card_id, member_cards.member_id, member_cards.member_name, member_cards.member_phone_number, member_cards.member_gender, member_cards.card_issuer, member_cards.branch_created, member_cards.is_active, member_cards.created_at, card_types.card_type_name, card_types.card_type_id, member_cards.total_points';
    const p_joinClause = 'JOIN card_types ON member_cards.card_type_id = card_types.card_type_id'; 
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
        memberCards: results[0],
        totalRecords: p_totalRecords
    };
}

async function addMemberCard(cardData) {
    const { member_id, member_name, member_phone_number, member_gender, card_issuer, branch_created } = cardData;
    const sql = `CALL CreateMemberCard(?, ?, ?, ?, ?, ?)`;
    const params = [member_id, member_name, member_phone_number, member_gender, card_issuer, branch_created];
    const [result] = await db.query(sql, params);
    const memberCard = result[0][0];
    return memberCard;
}

async function updateMemberCard(cardData) {
    const { member_card_id, member_id, member_name, member_phone_number, member_gender, user_id, is_active } = cardData;
    const sql = `CALL UpdateMemberCardInfo(?, ?, ?, ?, ?, ?, ?)`;
    const params = [
        member_card_id,
        member_id || null,
        member_name || null,
        member_phone_number || null,
        member_gender || null,
        user_id || null,
        is_active !== undefined ? is_active : null
    ];
    const [result] = await db.query(sql, params);
    const updatedCard = result[0][0];
    return updatedCard;
}

// Export the new function
export { addMemberCard, updateMemberCard, searchMemberCards };