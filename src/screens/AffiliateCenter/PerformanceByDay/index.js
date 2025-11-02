import React, { useState, useEffect } from "react";
import styles from "./PerformanceByDay.module.sass";
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
import { getAffiliatePerformanceByDay } from "../../../services/affiliateService";

const intervals = ["Last 7 days", "This month", "All time"];

const PerformanceByDay = ({ className }) => {
  const darkMode = useDarkMode(false);
  const [sorting, setSorting] = useState(intervals[0]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceData();
  }, [sorting]);

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      const period = sorting === "Last 7 days" ? "7days" : sorting === "This month" ? "month" : "all";
      const { data: performanceData, error } = await getAffiliatePerformanceByDay(period);

      if (!error && performanceData) {
        setData(performanceData);
      } else {
        // Fallback to default data
        setData([
          { name: "12", click: 0 },
          { name: "13", click: 0 },
          { name: "14", click: 0 },
          { name: "15", click: 0 },
          { name: "16", click: 0 },
          { name: "17", click: 0 },
        ]);
      }
    } catch (error) {
      console.error("Error fetching performance data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className={cn(styles.card, className)}
      title="Performance by day"
      classTitle={cn("title-purple", styles.title)}
      classCardHead={styles.head}
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
        {loading && <div className={styles.loading}>Loading...</div>}
        {!loading && (
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
              dataKey="click"
              dot={false}
              strokeWidth={4}
              stroke="#2A85FF"
            />
          </LineChart>
        </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
};

export default PerformanceByDay;
