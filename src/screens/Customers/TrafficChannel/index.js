import React, { useState, useEffect } from "react";
import styles from "./TrafficChannel.module.sass";
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
import { getTrafficSourcesData } from "../../../services/analyticsService";

const intervals = ["Last 7 days", "This month", "All time"];

const legend = [
  {
    title: "Direct",
    color: "#2A85FF",
  },
  {
    title: "Search",
    color: "#FFBC99",
  },
  {
    title: "Market",
    color: "#B1E5FC",
  },
  {
    title: "Social media",
    color: "#CABDFF",
  },
  {
    title: "Other",
    color: "#FFD88D",
  },
];

const TrafficChannel = ({ className }) => {
  const darkMode = useDarkMode(false);
  const [sorting, setSorting] = useState(intervals[0]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrafficData();
  }, [sorting]);

  const fetchTrafficData = async () => {
    setLoading(true);
    try {
      // Map interval to days
      let days = 7;
      if (sorting === "This month") days = 30;
      if (sorting === "All time") days = 365;

      const { data: trafficData, error } = await getTrafficSourcesData(days);

      if (!error && trafficData) {
        setData(trafficData);
      } else {
        console.error('Error fetching traffic data:', error);
        // Set empty data on error
        setData([]);
      }
    } catch (err) {
      console.error('Error:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className={cn(styles.card, className)}
      title="Traffic channel"
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
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            width={500}
            height={300}
            data={data}
            margin={{
              top: 0,
              right: 0,
              left: 0,
              bottom: 0,
            }}
            barSize={46}
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
            <Bar dataKey="direct" stackId="a" fill="#2A85FF" />
            <Bar dataKey="search" stackId="a" fill="#FFBC99" />
            <Bar dataKey="market" stackId="a" fill="#B1E5FC" />
            <Bar dataKey="social media" stackId="a" fill="#CABDFF" />
            <Bar dataKey="other" stackId="a" fill="#FFD88D" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.legend}>
        {legend.map((x, index) => (
          <div className={styles.indicator} key={index}>
            <div
              className={styles.color}
              style={{ backgroundColor: x.color }}
            ></div>
            {x.title}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TrafficChannel;
