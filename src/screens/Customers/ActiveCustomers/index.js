import React, { useState, useEffect } from "react";
import styles from "./ActiveCustomers.module.sass";
import cn from "classnames";
import Card from "../../../components/Card";
import Dropdown from "../../../components/Dropdown";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import useDarkMode from "use-dark-mode";
import { getActiveCustomersData } from "../../../services/customerService";

const intervals = ["Last 30 days", "Last 20 days", "Last 10 days"];

const ActiveCustomers = ({ className }) => {
  const darkMode = useDarkMode(false);
  const [sorting, setSorting] = useState(intervals[0]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const getDaysFromInterval = (interval) => {
    switch (interval) {
      case "Last 10 days":
        return 10;
      case "Last 20 days":
        return 20;
      case "Last 30 days":
      default:
        return 30;
    }
  };

  useEffect(() => {
    const fetchActiveCustomers = async () => {
      setLoading(true);
      const days = getDaysFromInterval(sorting);
      const { data: customerData, error } = await getActiveCustomersData(days);

      if (customerData && !error) {
        setData(customerData);
      } else {
        console.error('Error fetching active customers:', error);
        // Set empty data on error
        setData([]);
      }
      setLoading(false);
    };

    fetchActiveCustomers();
  }, [sorting]);

  return (
    <Card
      className={cn(styles.card, className)}
      title="Active customers"
      classTitle={cn("title-purple", styles.cardTitle)}
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
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            width={500}
            height={300}
            data={data}
            margin={{
              top: 0,
              right: 0,
              left: 0,
              bottom: 0,
            }}
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
              tick={{ fontSize: 12, fontWeight: "500", fill: "#9A9FA5" }}
              padding={{ left: 10 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fontWeight: "500", fill: "#9A9FA5" }}
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
            />
            <Line
              type="monotone"
              dataKey="monthly"
              dot={false}
              strokeWidth={4}
              stroke="#2A85FF"
            />
            <Line
              type="monotone"
              dataKey="weekly"
              dot={false}
              strokeWidth={4}
              stroke="#B5E4CA"
            />
            <Line
              type="monotone"
              dataKey="daily"
              dot={false}
              strokeWidth={4}
              stroke="#B1E5FC"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ActiveCustomers;
