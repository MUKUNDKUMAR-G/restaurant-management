import CustomError from "../utils/errors.js";
import STATUS_CODE from "../utils/constants.js";
import formatResponse from "../utils/formatresponse.js";
import { getAnalysis } from "../services/analysis.service.js";
import db from "../configs/db.js";

// Append the getAnalysisController
export const getAnalysisController = async (req, res) => {
  const {
    branch_id = '',
    time_type,
    month,
    year,
    quarter,
    start_year,
    end_year
  } = req.query;

  // Minimal validation: ensure time_type is present
  if (!time_type) {
    throw new CustomError(
      "BAD_REQUEST",
      "Parameter 'time_type' is required",
      STATUS_CODE.BAD_REQUEST
    );
  }

  // Call the service
  const analysisData = await getAnalysis({
    branch_id,
    time_type,
    month,
    year,
    quarter,
    start_year,
    end_year
  });

  return formatResponse(
    res,
    "Get Analysis",
    "Analysis retrieved successfully",
    STATUS_CODE.SUCCESS,
    analysisData
  );
};

export const getModernAnalytics = async (req, res) => {
  console.log("=== MODERN ANALYTICS ENDPOINT HIT ===", req.method, req.path);
  try {
    // 1. Summary (per branch)
    const [summaryRows] = await db.query(`
      SELECT
        o.branch_id,
        b.branch_name,
        COUNT(DISTINCT o.order_id) AS total_orders,
        SUM(bills.total_amount_with_benefits) AS total_revenue,
        SUM(COALESCE(r.guests_number, 1)) AS total_customers
      FROM orders o
      JOIN branches b ON o.branch_id = b.branch_id
      LEFT JOIN bills ON o.order_id = bills.order_id
      LEFT JOIN reservation_slips r ON o.reservation_slip_id = r.reservation_slip_id
      GROUP BY o.branch_id, b.branch_name
      ORDER BY total_revenue DESC
    `);

    console.log("SUMMARY ROWS:", summaryRows);

    // 2. Revenue over time (last 30 days)
    const [revenueRows] = await db.query(`
      SELECT DATE(o.created_at) as date, SUM(b.total_amount_with_benefits) as revenue
      FROM orders o
      LEFT JOIN bills b ON o.order_id = b.order_id
      WHERE o.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(o.created_at)
      ORDER BY date ASC
    `);

    // 3. Orders by branch
    const [branchRows] = await db.query(`
      SELECT o.branch_id, br.branch_name, COUNT(o.order_id) as orders
      FROM orders o
      JOIN branches br ON o.branch_id = br.branch_id
      GROUP BY o.branch_id, br.branch_name
      ORDER BY orders DESC
    `);

    // 4. Top dishes (last 30 days)
    const [dishRows] = await db.query(`
      SELECT d.dish_name, SUM(od.quantity) as total_orders
      FROM order_details od
      JOIN dishes d ON od.dish_id = d.dish_id
      WHERE od.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY d.dish_name
      ORDER BY total_orders DESC
      LIMIT 5
    `);

    // 5. Orders list (last 30 days)
    const [ordersList] = await db.query(`
      SELECT o.order_id, br.branch_name, b.total_amount_with_benefits as amount, b.status, o.created_at
      FROM orders o
      LEFT JOIN bills b ON o.order_id = b.order_id
      JOIN branches br ON o.branch_id = br.branch_id
      WHERE o.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      ORDER BY o.created_at DESC
      LIMIT 50
    `);

    return res.json({
      summary: summaryRows,
      revenue_over_time: revenueRows,
      orders_by_branch: branchRows,
      top_dishes: dishRows,
      orders_list: ordersList
    });
  } catch (err) {
    console.error("Modern analytics error:", err);
    return res.status(500).json({ error: "Failed to fetch analytics" });
  }
};