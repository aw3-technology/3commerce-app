import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./Overview.module.sass";
import TooltipGlodal from "../../../components/TooltipGlodal";
import Card from "../../../components/Card";
import Dropdown from "../../../components/Dropdown";
import Icon from "../../../components/Icon";
import Tooltip from "../../../components/Tooltip";
import Balance from "../../../components/Balance";
import { getDetailedInsights, formatNumber, formatEngagementRate } from "../../../services/promotionService";

const intervals = ["Last 7 days", "This month", "All time"];

const Overview = ({ className }) => {
  const [sorting, setSorting] = useState(intervals[0]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, [sorting]);

  const fetchInsights = async () => {
    setLoading(true);

    // Map interval to period parameter
    const periodMap = {
      "Last 7 days": "7days",
      "This month": "month",
      "All time": "all",
    };

    const period = periodMap[sorting] || "7days";

    const { data, error } = await getDetailedInsights(period);

    if (!error && data) {
      setInsights(data);
    }

    setLoading(false);
  };

  // Define items with dynamic data from insights
  const items = insights
    ? [
        {
          title: "People reached",
          counter: formatNumber(insights.peopleReached.value),
          icon: "profile-circle",
          color: "#B5E4CA",
          tooltip: "Total number of unique people who saw your posts",
          value: insights.peopleReached.change,
        },
        {
          title: "Engagement",
          counter: formatEngagementRate(insights.engagementRate.value),
          icon: "arrows-up-down",
          color: "#CABDFF",
          tooltip: "Average engagement rate across all posts",
          value: insights.engagementRate.change,
        },
        {
          title: "Comments",
          counter: insights.comments.value.toString(),
          icon: "messages",
          color: "#FFBC99",
          tooltip: "Total comments received on your posts",
          value: insights.comments.change,
        },
        {
          title: "Link clicks",
          counter: insights.linkClicks.value.toString(),
          icon: "mouse",
          color: "#B1E5FC",
          tooltip: "Total number of clicks on links in your posts",
          value: insights.linkClicks.change,
        },
      ]
    : [];

  return (
    <>
      <Card
        className={cn(styles.card, className)}
        title="Insights"
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
          {loading ? (
            <div style={{ padding: "20px", textAlign: "center" }}>Loading insights...</div>
          ) : (
            <div className={styles.list}>
              {items.map((x, index) => (
                <div className={styles.item} key={index}>
                  <div
                    className={styles.icon}
                    style={{ backgroundColor: x.color }}
                  >
                    <Icon name={x.icon} size="24" />
                  </div>
                  <div className={styles.details}>
                    <div className={styles.label}>
                      {x.title}
                      <Tooltip
                        className={styles.tooltip}
                        title={x.tooltip}
                        icon="info"
                        place="top"
                      />
                    </div>
                    <div className={styles.counter}>{x.counter}</div>
                    <div className={styles.indicator}>
                      <Balance className={styles.balance} value={x.value} />
                      <span>this week</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
      <TooltipGlodal />
    </>
  );
};

export default Overview;
