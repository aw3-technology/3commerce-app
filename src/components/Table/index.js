import React, { useState } from "react";
import styles from "./Table.module.sass";
import cn from "classnames";
import Checkbox from "../Checkbox";
import Loader from "../Loader";
import Row from "./Row";

const Table = ({ items, title, selectedProducts, onSelectProducts }) => {
  const [chooseAll, setСhooseAll] = useState(false);

  // Use parent state if provided, otherwise use local state
  const selectedFilters = selectedProducts || [];
  const setSelectedFilters = onSelectProducts || (() => {});

  const handleChange = (id) => {
    if (selectedFilters.includes(id)) {
      const newSelection = selectedFilters.filter((x) => x !== id);
      setSelectedFilters(newSelection);
    } else {
      const newSelection = [...selectedFilters, id];
      setSelectedFilters(newSelection);
    }
  };

  const handleChooseAll = () => {
    if (chooseAll) {
      // Deselect all
      setSelectedFilters([]);
    } else {
      // Select all
      const allIds = items.map(item => item.id);
      setSelectedFilters(allIds);
    }
    setСhooseAll(!chooseAll);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.table}>
        <div className={styles.row}>
          <div className={styles.col}>
            <Checkbox
              className={styles.checkbox}
              value={chooseAll}
              onChange={handleChooseAll}
            />
          </div>
          <div className={styles.col}>Product</div>
          <div className={styles.col}>Price</div>
          <div className={styles.col}>{title}</div>
        </div>
        {items.map((x, index) => (
          <Row
            item={x}
            key={index}
            index={index}
            value={selectedFilters.includes(x.id)}
            onChange={() => handleChange(x.id)}
          />
        ))}
      </div>
      <div className={styles.foot}>
        <button className={cn("button-stroke button-small", styles.button)}>
          <Loader className={styles.loader} />
          <span>Load more</span>
        </button>
      </div>
    </div>
  );
};

export default Table;
