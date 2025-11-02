import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./Overview.module.sass";
import TooltipGlodal from "../../../components/TooltipGlodal";
import Card from "../../../components/Card";
import Dropdown from "../../../components/Dropdown";
import Icon from "../../../components/Icon";
import Tooltip from "../../../components/Tooltip";
import Balance from "../../../components/Balance";
import Chart from "./Chart";
import { getDashboardStats, getSalesData } from "../../../services/analyticsService";
import { getCustomerStats } from "../../../services/customerService";

const intervals = ["This week", "This month", "This year"];

const Overview = ({ className }) => {
  const [sorting, setSorting] = useState(intervals[0]);
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [sorting]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data: dashboardData } = await getDashboardStats();
      const { data: customerData } = await getCustomerStats();
      const { data: sales } = await getSalesData('week');

      const formattedSales = sales?.slice(0, 7).map((item, index) => ({
        name: (index + 1).toString(),
        earning: item.total_amount || 0,
      })) || [];

      setStats({
        revenue: dashboardData?.revenue || 0,
        customers: customerData?.total || 0,
        orders: dashboardData?.orders || 0,
      });
      setSalesData(formattedSales);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return value.toString();
  };

  const items = [
    {
      title: "Earning",
      counter: stats ? `$${formatCurrency(stats.revenue)}` : "...",
      icon: "activity",
      value: 37.8,
      background: "#edf8f2",
      chartColor: "#83BF6E",
      data: salesData.length > 0 ? salesData : [
        { name: "1", earning: 0 },
        { name: "2", earning: 0 },
        { name: "3", earning: 0 },
        { name: "4", earning: 0 },
        { name: "5", earning: 0 },
        { name: "6", earning: 0 },
        { name: "7", earning: 0 },
      ],
    },
    {
      title: "Customer",
      counter: stats ? stats.customers.toString() : "...",
      icon: "shopping-bag",
      value: -37.8,
      background: "#ecf9fe",
      chartColor: "#2A85FF",
      data: salesData.length > 0 ? salesData : [
        { name: "1", earning: 0 },
        { name: "2", earning: 0 },
        { name: "3", earning: 0 },
        { name: "4", earning: 0 },
        { name: "5", earning: 0 },
        { name: "6", earning: 0 },
        { name: "7", earning: 0 },
      ],
    },
    {
      title: "Orders",
      counter: stats ? stats.orders.toString() : "...",
      icon: "payment",
      value: 37.8,
      background: "#f2efff",
      chartColor: "#8E59FF",
      data: salesData.length > 0 ? salesData : [
        { name: "1", earning: 0 },
        { name: "2", earning: 0 },
        { name: "3", earning: 0 },
        { name: "4", earning: 0 },
        { name: "5", earning: 0 },
        { name: "6", earning: 0 },
        { name: "7", earning: 0 },
      ],
    },
  ];

  return (
    <>
      <Card
        className={cn(styles.card, className)}
        title="Overview"
        classTitle="title-purple"
        head={
          <Dropdown
            className={styles.dropdown}
            classDropdownHead={styles.dropdownHead}
            value={sorting}
            setValue={setSorting}
            options={intervals}
            small
          />
        }
      >
        <div className={styles.overview}>
          <div className={styles.list}>
            {items.map((x, index) => (
              <div
                className={styles.item}
                key={index}
                style={{ backgroundColor: x.background }}
              >
                <div className={styles.icon}>
                  <Icon name={x.icon} size="24" />{" "}
                </div>
                <div className={styles.line}>
                  <div className={styles.details}>
                    <div className={styles.category}>
                      {x.title}
                      <Tooltip
                        className={styles.tooltip}
                        title="Small description"
                        icon="info"
                        place="right"
                      />
                    </div>
                    <div className={styles.counter}>{x.counter}</div>
                    <div className={styles.indicator}>
                      <Balance className={styles.balance} value={x.value} />
                      <span>this week</span>
                    </div>
                  </div>
                  <Chart className={styles.chart} item={x} />
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
