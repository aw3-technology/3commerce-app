import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./Overview.module.sass";
import TooltipGlodal from "../../../components/TooltipGlodal";
import Card from "../../../components/Card";
import Icon from "../../../components/Icon";
import Tooltip from "../../../components/Tooltip";
import { getTransactions, getOrderStats } from "../../../services/orderService";
import { numberWithCommas } from "../../../utils.js";

const Overview = ({ className }) => {
  const [stats, setStats] = useState({
    funds: 0,
    earnings: 0,
    fees: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatementStats();
  }, []);

  const fetchStatementStats = async () => {
    setLoading(true);

    try {
      // Get order stats for earnings
      const { data: orderData } = await getOrderStats();

      // Get all transactions to calculate fees
      const { data: transactionData } = await getTransactions({ limit: 1000 });

      if (orderData) {
        const totalRevenue = orderData.revenue || 0;
        const platformFeePercentage = 0.10; // 10% platform fee
        const fees = totalRevenue * platformFeePercentage;
        const netEarnings = totalRevenue - fees;

        setStats({
          funds: totalRevenue,
          earnings: netEarnings,
          fees: fees,
        });
      }
    } catch (error) {
      console.error('Error fetching statement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const items = [
    {
      title: "Funds",
      counter: loading ? "..." : `$${numberWithCommas(stats.funds.toFixed(2))}`,
      icon: "activity",
      color: "#B5E4CA",
      tooltip: "Total funds from all transactions",
    },
    {
      title: "Earning",
      counter: loading ? "..." : `$${numberWithCommas(stats.earnings.toFixed(2))}`,
      icon: "pie-chart",
      color: "#CABDFF",
      tooltip: "Net earnings after fees",
    },
    {
      title: "Fees",
      counter: loading ? "..." : `$${numberWithCommas(stats.fees.toFixed(2))}`,
      icon: "donut-chart",
      color: "#B1E5FC",
      tooltip: "Platform and processing fees",
    },
  ];

  return (
    <>
      <Card className={cn(styles.card, className)}>
        <div className={styles.overview}>
          <div className={styles.list}>
            {items.map((x, index) => (
              <div className={styles.item} key={index}>
                <div
                  className={styles.icon}
                  style={{ backgroundColor: x.color }}
                >
                  <Icon name={x.icon} size="24" />
                </div>
                <div className={styles.details}>
                  <div className={styles.label}>
                    {x.title}
                    <Tooltip
                      className={styles.tooltip}
                      title={x.tooltip}
                      icon="info"
                      place="top"
                    />
                  </div>
                  <div className={styles.counter}>{x.counter}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
      <TooltipGlodal />
    </>
  );
};

export default Overview;
