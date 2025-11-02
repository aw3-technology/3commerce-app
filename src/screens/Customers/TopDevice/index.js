import React, { useEffect, useState } from "react";
import styles from "./TopDevice.module.sass";
import cn from "classnames";
import Card from "../../../components/Card";
import Icon from "../../../components/Icon";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts";
import { getDeviceAnalytics } from "../../../services/analyticsService";

const COLORS = ["#8E59FF", "#83BF6E", "#2A85FF"];

const TopDevice = ({ className }) => {
  const [deviceData, setDeviceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDeviceData();
  }, []);

  const fetchDeviceData = async () => {
    setLoading(true);
    const { data, error } = await getDeviceAnalytics();

    if (error) {
      console.error('Error fetching device analytics:', error);
      setError(error);
      // Fallback to default data
      setDeviceData({
        chartData: [
          { name: "Mobile", value: 0 },
          { name: "Tablet", value: 0 },
          { name: "Desktop", value: 0 },
        ],
        legend: [
          {
            title: "Mobile",
            percent: 0,
            count: 0,
            icon: "mobile",
            fill: "#8E59FF",
          },
          {
            title: "Tablet",
            percent: 0,
            count: 0,
            icon: "tablet",
            fill: "#83BF6E",
          },
          {
            title: "Desktop",
            percent: 0,
            count: 0,
            icon: "desktop",
            fill: "#2A85FF",
          },
        ],
        totalSessions: 0
      });
    } else {
      setDeviceData(data);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <Card
        className={cn(styles.card, className)}
        title="Top device"
        classTitle="title-blue"
      >
        <div style={{ padding: '2rem', textAlign: 'center', color: '#777' }}>
          Loading...
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(styles.card, className)}
      title="Top device"
      classTitle="title-blue"
    >
      <div className={styles.chart}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart width={400} height={400}>
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
            <Pie
              data={deviceData?.chartData || []}
              cx={140}
              cy={110}
              innerRadius={88}
              outerRadius={110}
              fill="#8884d8"
              paddingAngle={1}
              dataKey="value"
            >
              {deviceData?.chartData?.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.legend}>
        {deviceData?.legend?.map((x, index) => (
          <div className={styles.indicator} key={index}>
            <Icon name={x.icon} size="24" fill={x.fill} />
            <div className={styles.title}>{x.title}</div>
            <div className={styles.percent}>{x.percent}%</div>
          </div>
        ))}
      </div>
      {deviceData?.totalSessions === 0 && (
        <div style={{ padding: '1rem', textAlign: 'center', fontSize: '12px', color: '#999' }}>
          No session data available yet. Data will appear once users visit your site.
        </div>
      )}
    </Card>
  );
};

export default TopDevice;
