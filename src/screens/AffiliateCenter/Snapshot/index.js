import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./Snapshot.module.sass";
import Item from "./Item";
import Card from "../../../components/Card";
import Dropdown from "../../../components/Dropdown";
import Chart from "./Chart";
import { getAffiliateSnapshot } from "../../../services/affiliateService";

const intervals = ["Last 7 days", "This month", "All time"];

const Snapshot = ({ className }) => {
  const [sorting, setSorting] = useState(intervals[0]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAffiliateData();
  }, [sorting]);

  const fetchAffiliateData = async () => {
    setLoading(true);
    try {
      const period = sorting === "Last 7 days" ? "7days" : sorting === "This month" ? "month" : "all";
      const { data, error } = await getAffiliateSnapshot(period);

      if (!error && data) {
        setStats(data);
        setChartData(data.chartData || []);
      }
    } catch (error) {
      console.error("Error fetching affiliate data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
    return `$${value.toFixed(0)}`;
  };

  const nav = [
    {
      title: "Clicks",
      counter: stats ? stats.clicks.toString() : "...",
      icon: "mouse",
      color: "#B1E5FC",
      value: stats ? stats.clicksGrowth : 0,
    },
    {
      title: "Payouts",
      counter: stats ? formatCurrency(stats.payouts) : "...",
      icon: "activity",
      color: "#CABDFF",
      value: stats ? stats.payoutsGrowth : 0,
    },
  ];

  return (
    <Card
      className={cn(styles.card, className)}
      title="Snapshot"
      classTitle="title-red"
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
        <div className={styles.nav}>
          {nav.map((x, index) => (
            <Item
              className={cn(styles.item, {
                [styles.active]: index === activeIndex,
              })}
              key={index}
              onActive={() => setActiveIndex(index)}
              item={x}
            />
          ))}
        </div>
        <div className={styles.body}>
          {loading && <div className={styles.loading}>Loading...</div>}
          {!loading && activeIndex === 0 && <Chart data={chartData} />}
          {!loading && activeIndex === 1 && <Chart data={chartData} />}
        </div>
      </div>
    </Card>
  );
};

export default Snapshot;
