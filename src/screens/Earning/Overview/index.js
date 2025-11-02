import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./Overview.module.sass";
import TooltipGlodal from "../../../components/TooltipGlodal";
import Card from "../../../components/Card";
import Icon from "../../../components/Icon";
import Tooltip from "../../../components/Tooltip";
import Balance from "../../../components/Balance";
import { getOrderStats } from "../../../services/orderService";
import { numberWithCommas } from "../../../utils.js";

const Overview = ({ className }) => {
  const [stats, setStats] = useState({
    earnings: 0,
    balance: 0,
    totalSales: 0,
    earningsGrowth: 0,
    balanceGrowth: 0,
    salesGrowth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarningsData();
  }, []);

  const fetchEarningsData = async () => {
    setLoading(true);

    const { data, error } = await getOrderStats();

    if (!error && data) {
      // Calculate current week vs previous week growth
      // For now, using the revenue directly
      setStats({
        earnings: data.revenue || 0,
        balance: data.revenue * 0.4 || 0, // Assuming 40% balance of total revenue
        totalSales: data.revenue || 0,
        earningsGrowth: 37.8, // Placeholder for growth percentage
        balanceGrowth: -17.8, // Placeholder for growth percentage
        salesGrowth: 24.3, // Placeholder for growth percentage
      });
    }

    setLoading(false);
  };

  const items = [
    {
      title: "Earning",
      counter: loading ? "..." : `$${numberWithCommas(stats.earnings.toFixed(2))}`,
      icon: "activity",
      color: "#B5E4CA",
      tooltip: "Total earnings from completed orders",
      value: stats.earningsGrowth,
    },
    {
      title: "Balance",
      counter: loading ? "..." : `$${numberWithCommas(stats.balance.toFixed(2))}`,
      icon: "pie-chart",
      color: "#CABDFF",
      tooltip: "Current available balance",
      value: stats.balanceGrowth,
    },
    {
      title: "Total value of sales",
      counter: loading ? "..." : `$${numberWithCommas(stats.totalSales.toFixed(2))}`,
      icon: "shopping-bag",
      color: "#B1E5FC",
      tooltip: "Total value of all sales",
      value: stats.salesGrowth,
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
                  <div className={styles.indicator}>
                    <Balance className={styles.balance} value={x.value} />
                    <span>this week</span>
                  </div>
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
