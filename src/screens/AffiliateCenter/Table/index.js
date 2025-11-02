import React, { useState, useEffect } from "react";
import styles from "./Table.module.sass";
import Item from "./Item";
import Tooltip from "../../../components/Tooltip";
import Loader from "../../../components/Loader";
import { getAffiliatePerformanceTable } from "../../../services/affiliateService";

const Table = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTableData();
  }, []);

  const fetchTableData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await getAffiliatePerformanceTable(30);

      if (!error && data) {
        setItems(data);
      } else {
        setError("Failed to load affiliate data");
        console.error("Error fetching affiliate table:", error);
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
      console.error("Error fetching affiliate table:", err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={styles.wrapper}>
      <div className={styles.table}>
        <div className={styles.row}>
          <div className={styles.col}>Date</div>
          <div className={styles.col}>
            Impressions
            <Tooltip
              className={styles.tooltip}
              title="Small description impressions"
              icon="info"
              place="top"
            />
          </div>
          <div className={styles.col}>
            Clicks
            <Tooltip
              className={styles.tooltip}
              title="Small description clicks"
              icon="info"
              place="top"
            />
          </div>
          <div className={styles.col}>Total earnings</div>
          <div className={styles.col}>
            EPC
            <Tooltip
              className={styles.tooltip}
              title="Small description EPC"
              icon="info"
              place="top"
            />
          </div>
        </div>
        {loading && (
          <div className={styles.loading}>
            <Loader />
            <p>Loading affiliate performance data...</p>
          </div>
        )}
        {error && (
          <div className={styles.error}>
            <p>Error: {error}</p>
            <button onClick={fetchTableData} className="button-stroke button-small">
              Retry
            </button>
          </div>
        )}
        {!loading && !error && items.length > 0 && items.map((x, index) => (
          <div className={styles.row} key={index}>
            <div className={styles.col}>{x.date}</div>
            <div className={styles.col}>
              <Item
                className={styles.item}
                item={x.impressions}
                color="#2A85FF"
              />
            </div>
            <div className={styles.col}>
              <Item className={styles.item} item={x.clicks} color="#8E59FF" />
            </div>
            <div className={styles.col}>${x.total.toFixed(2)}</div>
            <div className={styles.col}>${x.epc.toFixed(2)}</div>
          </div>
        ))}
        {!loading && !error && items.length === 0 && (
          <div className={styles.empty}>
            <p>No affiliate performance data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Table;
