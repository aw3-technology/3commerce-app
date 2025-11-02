import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./Overview.module.sass";
import Card from "../../../components/Card";
import Dropdown from "../../../components/Dropdown";
import Users from "../../../components/Users";
import Balance from "../../../components/Balance";
import Chart from "./Chart";
import { getCustomerAnalytics } from "../../../services/analyticsService";

const intervals = ["Last 28 days", "Last 14 days", "Last 7 days"];

const Overview = ({ className }) => {
  const [sorting, setSorting] = useState(intervals[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    totalCustomers: 0,
    growthPercentage: 0,
    chartData: []
  });

  useEffect(() => {
    const fetchCustomerData = async () => {
      setLoading(true);
      setError(null);

      // Map interval to days
      const daysMap = {
        "Last 28 days": 28,
        "Last 14 days": 14,
        "Last 7 days": 7
      };

      const days = daysMap[sorting] || 28;

      const { data, error: fetchError } = await getCustomerAnalytics(days);

      if (fetchError) {
        console.error('Error fetching customer analytics:', fetchError);
        setError('Failed to load customer data');
        setLoading(false);
        return;
      }

      if (data) {
        setAnalyticsData(data);
      }

      setLoading(false);
    };

    fetchCustomerData();
  }, [sorting]);

  // Format comparison date
  const getComparisonDate = () => {
    const daysMap = {
      "Last 28 days": 28,
      "Last 14 days": 14,
      "Last 7 days": 7
    };
    const days = daysMap[sorting] || 28;
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Card
      className={cn(styles.card, className)}
      title="Total customers"
      classTitle={cn("title-red", styles.cardTitle)}
      classCardHead={styles.cardHead}
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
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <>
            <div className={styles.details}>
              <div className={cn("h4", styles.title)}>
                {analyticsData.totalCustomers.toLocaleString()} customers
              </div>
              <div className={styles.line}>
                <Balance
                  className={styles.balance}
                  value={analyticsData.growthPercentage}
                  background
                /> vs. {getComparisonDate()}
              </div>
            </div>
            <Chart chartData={analyticsData.chartData} />
            <Users className={styles.users} />
          </>
        )}
      </div>
    </Card>
  );
};

export default Overview;
