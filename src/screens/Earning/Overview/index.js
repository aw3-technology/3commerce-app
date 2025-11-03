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
      // Calculate earnings metrics from real order data
      const earnings = data.revenue || 0;
      const balance = earnings * 0.4; // Assuming 40% balance of total revenue
      const totalSales = data.revenue || 0;

      setStats({
        earnings,
        balance,
        totalSales,
        earningsGrowth: 0, // TODO: Calculate from weekly comparison
        balanceGrowth: 0, // TODO: Calculate from weekly comparison
        salesGrowth: 0, // TODO: Calculate from weekly comparison
      });
    } else {
      // No data or error - show zeros
      setStats({
        earnings: 0,
        balance: 0,
        totalSales: 0,
        earningsGrowth: 0,
        balanceGrowth: 0,
        salesGrowth: 0,
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
