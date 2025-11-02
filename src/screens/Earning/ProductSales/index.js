import React, { useState, useEffect } from "react";
import styles from "./ProductSales.module.sass";
import cn from "classnames";
import Card from "../../../components/Card";
import Dropdown from "../../../components/Dropdown";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import useDarkMode from "use-dark-mode";
import { getSalesData } from "../../../services/analyticsService";

const intervals = ["Last 7 days", "This month", "All time"];

const ProductSales = ({ className }) => {
  const darkMode = useDarkMode(false);
  const [sorting, setSorting] = useState(intervals[0]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesData();
  }, [sorting]);

  const fetchSalesData = async () => {
    setLoading(true);

    const { data, error } = await getSalesData();

    if (!error && data) {
      // Filter and group data based on selected period
      const now = new Date();
      let filteredData = data;

      if (sorting === "Last 7 days") {
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);
        filteredData = data.filter(
          order => new Date(order.created_at) >= sevenDaysAgo
        );
      } else if (sorting === "This month") {
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        filteredData = data.filter(
          order => new Date(order.created_at) >= firstDayOfMonth
        );
      }

      // Group by date and sum total_amount
      const salesByDate = {};
      filteredData.forEach(order => {
        const date = new Date(order.created_at);
        const dateKey = date.getDate();

        if (!salesByDate[dateKey]) {
          salesByDate[dateKey] = {
            name: dateKey.toString(),
            sales: 0,
          };
        }

        salesByDate[dateKey].sales += order.total_amount || 0;
      });

      // Convert to array and sort
      const chartArray = Object.values(salesByDate)
        .sort((a, b) => parseInt(a.name) - parseInt(b.name))
        .slice(-7); // Show last 7 data points

      setChartData(chartArray);
    }

    setLoading(false);
  };

  return (
    <Card
      className={cn(styles.card, className)}
      title="Product sales"
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
      <div className={styles.chart}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            Loading...
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              width={500}
              height={300}
              data={chartData}
              margin={{
                top: 0,
                right: 0,
                left: 0,
                bottom: 0,
              }}
              barSize={40}
              barGap={8}
            >
              <CartesianGrid
                strokeDasharray="none"
                stroke={darkMode.value ? "#272B30" : "#EFEFEF"}
                vertical={false}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fontWeight: "500", fill: "#6F767E" }}
                padding={{ left: 10 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fontWeight: "500", fill: "#6F767E" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#272B30",
                  borderColor: "rgba(255, 255, 255, 0.12)",
                  borderRadius: 8,
                  boxShadow:
                    "0px 4px 8px rgba(0, 0, 0, 0.1), 0px 2px 4px rgba(0, 0, 0, 0.1), inset 0px 0px 1px #000000",
                }}
                labelStyle={{ fontSize: 12, fontWeight: "500", color: "#fff" }}
                itemStyle={{
                  padding: 0,
                  textTransform: "capitalize",
                  fontSize: 12,
                  fontWeight: "600",
                  color: "#fff",
                }}
                cursor={{ fill: "#f3f2f3" }}
              />
              <Bar dataKey="sales" fill="#B5E4CA" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            No sales data available
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProductSales;
