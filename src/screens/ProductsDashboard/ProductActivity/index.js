import React, { useState, useEffect } from "react";
import styles from "./ProductActivity.module.sass";
import cn from "classnames";
import Card from "../../../components/Card";
import Dropdown from "../../../components/Dropdown";
import Item from "./Item";
import { getProductActivity } from "../../../services/analyticsService";

const ProductActivity = () => {
  const intervals = ["Last 2 weeks", "Last 7 days"];

  const [activeTab, setActiveTab] = useState(intervals[0]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductActivity();
  }, [activeTab]);

  const fetchProductActivity = async () => {
    setLoading(true);
    try {
      const { data, error } = await getProductActivity();

      if (!error && data) {
        const formattedItems = data.slice(0, 2).map((week, index) => ({
          title: week.title,
          products: {
            counter: week.products,
            color: index === 0 ? "#B5E4CA" : "#EFEFEF",
            value: 0, // TODO: Calculate week-over-week growth
          },
          views: {
            counter: week.views > 1000 ? `${(week.views / 1000).toFixed(1)}k` : week.views,
            color: index === 0 ? "#CABDFF" : "#EFEFEF",
            value: 0, // TODO: Calculate week-over-week growth
          },
          likes: {
            counter: week.likes,
            color: index === 0 ? "#B1E5FC" : "#EFEFEF",
            value: 0, // TODO: Calculate week-over-week growth
          },
          comments: {
            counter: week.comments,
            color: index === 0 ? "#FFD88D" : "#EFEFEF",
            value: 0, // TODO: Calculate week-over-week growth
          },
        }));

        setItems(formattedItems.length > 0 ? formattedItems : []);
      } else {
        // No data or error - show empty
        setItems([]);
      }
    } catch (error) {
      console.error("Error fetching product activity:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      className={styles.card}
      title="Product activity"
      classTitle="title-green"
      head={
        <Dropdown
          className={cn(styles.dropdown, "mobile-hide")}
          classDropdownHead={styles.dropdownHead}
          value={activeTab}
          setValue={setActiveTab}
          options={intervals}
          small
        />
      }
    >
      <div className={styles.table}>
        <div className={styles.row}>
          <div className={styles.col}>Week</div>
          <div className={styles.col}>Products</div>
          <div className={styles.col}>Views</div>
          <div className={styles.col}>Likes</div>
          <div className={styles.col}>Comments</div>
        </div>
        {loading ? (
          <div className={styles.empty}>Loading activity...</div>
        ) : items.length > 0 ? (
          items.map((x, index) => (
            <div className={styles.row} key={index}>
              <div className={styles.col}>
                <div className={styles.label}>Week</div>
                {x.title}
              </div>
              <div className={styles.col}>
                <div className={styles.label}>Products</div>
                <Item className={styles.item} item={x.products} />
              </div>
              <div className={styles.col}>
                <div className={styles.label}>Views</div>
                <Item className={styles.item} item={x.views} />
              </div>
              <div className={styles.col}>
                <div className={styles.label}>Likes</div>
                <Item className={styles.item} item={x.likes} />
              </div>
              <div className={styles.col}>
                <div className={styles.label}>Comments</div>
                <Item className={styles.item} item={x.comments} />
              </div>
            </div>
          ))
        ) : (
          <div className={styles.empty}>No product activity in the last 2 weeks</div>
        )}
      </div>
      <div className={styles.nav}>
        {intervals.map((x, index) => (
          <button
            className={cn(styles.link, {
              [styles.active]: x === activeTab,
            })}
            onClick={() => setActiveTab(x)}
            key={index}
          >
            {x}
          </button>
        ))}
      </div>
    </Card>
  );
};

export default ProductActivity;
