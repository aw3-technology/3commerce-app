import React, { useState, useEffect } from "react";
import styles from "./Table.module.sass";
import cn from "classnames";
import { numberWithCommas } from "../../../utils.js";
import { getAllOrders } from "../../../services/orderService";

const Table = () => {
  const [earningsData, setEarningsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDailyEarnings();
  }, []);

  const fetchDailyEarnings = async () => {
    setLoading(true);

    const { data, error } = await getAllOrders({ limit: 50 });

    if (!error && data) {
      // Group orders by date
      const dailyStats = {};

      data.forEach(order => {
        const date = new Date(order.created_at);
        const dateKey = date.toDateString();

        if (!dailyStats[dateKey]) {
          dailyStats[dateKey] = {
            date: dateKey,
            dateObj: date,
            sales: 0,
            earnings: 0,
            status: order.status === 'completed',
          };
        }

        dailyStats[dateKey].sales += 1;
        if (order.status === 'completed') {
          dailyStats[dateKey].earnings += order.total_amount || 0;
          dailyStats[dateKey].status = true;
        }
      });

      // Convert to array and sort by date (newest first)
      const sortedData = Object.values(dailyStats)
        .sort((a, b) => b.dateObj - a.dateObj)
        .slice(0, 7) // Show last 7 days
        .map(item => ({
          date: item.dateObj.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          }),
          status: item.status,
          sales: item.sales,
          earnings: item.earnings,
        }));

      setEarningsData(sortedData);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.table}>
          <div className={styles.row}>
            <div className={styles.col}>Date</div>
            <div className={styles.col}>Status</div>
            <div className={styles.col}>Product sales count</div>
            <div className={styles.col}>Earnings</div>
          </div>
          <div className={styles.row}>
            <div className={styles.col}>Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.table}>
        <div className={styles.row}>
          <div className={styles.col}>Date</div>
          <div className={styles.col}>Status</div>
          <div className={styles.col}>Product sales count</div>
          <div className={styles.col}>Earnings</div>
        </div>
        {earningsData.length > 0 ? (
          earningsData.map((x, index) => (
            <div className={styles.row} key={index}>
              <div className={styles.col}>{x.date}</div>
              <div className={styles.col}>
                {x.status ? (
                  <div
                    className={cn(
                      { "status-green-dark": x.status === true },
                      styles.status
                    )}
                  >
                    Paid
                  </div>
                ) : (
                  <div
                    className={cn(
                      { "status-yellow": x.status === false },
                      styles.status
                    )}
                  >
                    Pending
                  </div>
                )}
              </div>
              <div className={styles.col}>{x.sales}</div>
              <div className={styles.col}>
                ${numberWithCommas(x.earnings.toFixed(2))}
              </div>
            </div>
          ))
        ) : (
          <div className={styles.row}>
            <div className={styles.col}>No earnings data available</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Table;
