import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Market.module.sass";
import cn from "classnames";
import Checkbox from "../../../components/Checkbox";
import Loader from "../../../components/Loader";
import Row from "./Row";

const Market = ({ items = [] }) => {
  const [chooseAll, setСhooseAll] = useState(false);

  const [selectedFilters, setSelectedFilters] = useState([]);

  const handleChange = (id) => {
    if (selectedFilters.includes(id)) {
      setSelectedFilters(selectedFilters.filter((x) => x !== id));
    } else {
      setSelectedFilters((selectedFilters) => [...selectedFilters, id]);
    }
  };

  return (
    <div className={styles.market}>
      <div className={styles.table}>
        <div className={styles.row}>
          <div className={styles.col}>
            <Checkbox
              className={styles.checkbox}
              value={chooseAll}
              onChange={() => setСhooseAll(!chooseAll)}
            />
          </div>
          <div className={styles.col}>Product</div>
          <div className={styles.col}>Price</div>
          <div className={styles.col}>Status</div>
          <div className={styles.col}>Rating</div>
          <div className={styles.col}>Sales</div>
          <div className={styles.col}>Views</div>
        </div>
        {items.length > 0 ? (
          items.map((x, index) => (
            <Row
              item={x}
              key={index}
              value={selectedFilters.includes(x.id)}
              onChange={() => handleChange(x.id)}
            />
          ))
        ) : (
          <div className={styles.empty}>
            <p>No published products yet</p>
            <div style={{ fontSize: "14px", marginTop: "8px" }}>
              Start by <Link to="/products/add">creating your first product</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Market;
