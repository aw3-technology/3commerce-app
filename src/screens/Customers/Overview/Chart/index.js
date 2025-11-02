import React from "react";
import styles from "./Chart.module.sass";
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

const Chart = ({ chartData = [] }) => {
    const darkMode = useDarkMode(false);

    // Use provided data or fallback to empty array
    const data = chartData.length > 0 ? chartData : [];

    return (
        <div className={styles.chart}>
            {data.length === 0 ? (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: '#9A9FA5',
                    fontSize: '14px'
                }}>
                    No data available
                </div>
            ) : (
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
                            tick={{
                                fontSize: 12,
                                fontWeight: "500",
                                fill: "#9A9FA5",
                            }}
                            padding={{ left: 10 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{
                                fontSize: 12,
                                fontWeight: "500",
                                fill: "#9A9FA5",
                            }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "#272B30",
                                borderColor: "rgba(255, 255, 255, 0.12)",
                                borderRadius: 8,
                                boxShadow:
                                    "0px 4px 8px rgba(0, 0, 0, 0.1), 0px 2px 4px rgba(0, 0, 0, 0.1), inset 0px 0px 1px #000000",
                            }}
                            labelStyle={{
                                fontSize: 12,
                                fontWeight: "500",
                                color: "#fff",
                            }}
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
                            dataKey="customers"
                            dot={false}
                            strokeWidth={4}
                            stroke="#2A85FF"
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default Chart;
