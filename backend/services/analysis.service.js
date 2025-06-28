import db from "../configs/db.js";
import CustomError from "../utils/errors.js";
import STATUS_CODE from "../utils/constants.js";

/**
 * Generate a complete list of labels for each time type:
 *  - Daily: All days in p_month of p_year (1..31 as needed).
 *  - Monthly: The 3 months of p_quarter in p_year, e.g. [ 'January', 'February', 'March' ] if p_quarter = 1.
 *  - Quarterly: [ 'Q1', 'Q2', 'Q3', 'Q4' ].
 *  - Overall: Each year from p_start_year..p_end_year.
 */
function getAllLabels(timeType, { year, month, quarter, start_year, end_year }) {
    switch (timeType) {
      case 'Daily': {
        // Create array [1..lastDayOfMonth]
        // lastDayOfMonth can be found by new Date(year, month, 0).getDate() if month is 1-based.
        const lastDay = new Date(year, month, 0).getDate(); 
        // Example: if year=2024, month=2 => new Date(2024, 2, 0) => 2024-02-29 => getDate()=29
        const days = [];
        for (let d = 1; d <= lastDay; d++) {
          days.push(String(d)); // or zero-pad if you prefer "01","02", etc.
        }
        return days;
      }
  
      case 'Monthly': {
        // For a given quarter, we know 3 months. 
        // quarter=1 => Jan,Feb,Mar; quarter=2 => Apr,May,Jun, etc.
        // You can localize or change language as needed
        const allMonths = [
          'January', 'February', 'March',
          'April', 'May', 'June',
          'July', 'August', 'September',
          'October', 'November', 'December'
        ];
        const startIndex = (quarter - 1) * 3;  // e.g. quarter=1 => 0..2
        const endIndex   = startIndex + 2;
        return allMonths.slice(startIndex, endIndex + 1);
      }
  
      case 'Quarterly': {
        // Just Q1..Q4
        return [ '1', '2', '3', '4' ];
      }
  
      case 'Overall': {
        // Each year from startYear..endYear
        const labels = [];
        for (let y = start_year; y <= end_year; y++) {
          labels.push(String(y));
        }
        return labels;
      }
  
      default:
        // If we ever get an unrecognized type, return an empty array or throw
        return [];
    }
  }
  
function fillMissingLabels(allLabels, dbLabels, dbData) {
    // Create a map for quick lookup: label => data
    const dbMap = {};
    dbLabels.forEach((lbl, i) => {
        dbMap[lbl] = dbData[i];
    });

    const finalData = allLabels.map(lbl => {
        // If label not in dbMap, default to 0
        return dbMap[lbl] != null ? dbMap[lbl] : 0;
    });
    return finalData;
}

export async function getAnalysis({
  branch_id = '',
  time_type,
  month,
  year,
  quarter,
  start_year,
  end_year,
}) {
  
  const sql = `CALL GetAnalysis(?, ?, ?, ?, ?, ?, ?)`;
  const params = [
    branch_id,
    time_type,
    month || null,
    year || null,
    quarter || null,
    start_year || null,
    end_year || null
  ];
  
  const [results] = await db.query(sql, params);

  const row = results[0][0];
    // Step 1: get raw arrays from DB
    const dbLabels = JSON.parse(row.revenueLabels || '[]');  
    const dbData   = JSON.parse(row.revenueData   || '[]');


    // Step 2: compute the "full" label set
    const allLabels = getAllLabels(time_type, { 
    year, month, quarter, start_year, end_year 
    });

    // Step 3: fill missing labels
    const finalRevenueData = fillMissingLabels(allLabels, dbLabels, dbData);

    // throw new CustomError("NOT_IMPLEMENTED", "Not implemented", STATUS_CODE.SUCCESS, finalRevenueData);
    const dbServiceLabels = JSON.parse(row.serviceLabels || '[]');
    const dbServiceData   = JSON.parse(row.serviceData   || '[]');
    const finalServiceData = fillMissingLabels(allLabels, dbServiceLabels, dbServiceData);

    // Then build your final object
    return {
        totalRevenue: Math.round((row.totalRevenue || 0) * 100) / 100,
        orders: row.orders || 0,
        customers: row.customers || 0,
        revenueStats: {
            label: allLabels,  // use the full label set
            datasets: {
            label: "Revenue",
            data: finalRevenueData.map(num => Math.round(num * 100) / 100)
            }
        },
        ServicesRate: {
            label: allLabels,  // same set or different if you prefer
            datasets: {
            label: "Service Rate",
            data: finalServiceData.map(num => Math.round(num * 100) / 100)
            }
        }
    };
}
