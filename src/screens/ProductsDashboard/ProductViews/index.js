import React, { useState, useEffect } from "react";
import styles from "./ProductViews.module.sass";
import Card from "../../../components/Card";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getProductViews } from "../../../services/analyticsService";

const defaultData = [
  { name: "Mo", views: 0 },
  { name: "Tu", views: 0 },
  { name: "We", views: 0 },
  { name: "Th", views: 0 },
  { name: "Fr", views: 0 },
  { name: "Sa", views: 0 },
  { name: "Su", views: 0 },
];

const ProductViews = () => {
  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductViews();
  }, []);

  const fetchProductViews = async () => {
    setLoading(true);
    try {
      const { data: viewsData, error } = await getProductViews();

      if (!error && viewsData && viewsData.length > 0) {
        const weekDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
        const aggregatedViews = viewsData.reduce((acc, item) => {
          const date = new Date(item.created_at);
          const dayIndex = date.getDay();
          const dayName = weekDays[dayIndex === 0 ? 6 : dayIndex - 1];

          const existingDay = acc.find(d => d.name === dayName);
          if (existingDay) {
            existingDay.views += item.view_count || 1;
          }
          return acc;
        }, defaultData.map(d => ({ ...d })));

        setData(aggregatedViews);
      }
    } catch (error) {
      console.error("Error fetching product views:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card className={styles.card} title="Product views" classTitle="title-blue">
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
            barSize={30}
            barGap={8}
          >
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fontWeight: "500", fill: "#6F767E" }}
              padding={{ left: 10 }}
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
            <Bar dataKey="views" fill="#B5E4CA" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default ProductViews;
