import React, { useState, useEffect } from "react";
import styles from "./Table.module.sass";
import cn from "classnames";
import Checkbox from "../../../components/Checkbox";
import Loader from "../../../components/Loader";
import Row from "./Row";

const Table = ({ items, loading, onLoadMore, selectedComments, setSelectedComments }) => {
  const [chooseAll, setСhooseAll] = useState(false);

  // Update chooseAll checkbox based on selections
  useEffect(() => {
    if (selectedComments.length === items.length && items.length > 0) {
      setСhooseAll(true);
    } else {
      setСhooseAll(false);
    }
  }, [selectedComments, items]);

  const handleChange = (id) => {
    if (selectedComments.includes(id)) {
      setSelectedComments(selectedComments.filter((x) => x !== id));
    } else {
      setSelectedComments((selectedComments) => [...selectedComments, id]);
    }
  };

  const handleChooseAll = () => {
    if (chooseAll) {
      setSelectedComments([]);
    } else {
      setSelectedComments(items.map(item => item.id));
    }
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
          <div className={styles.col}>Comments</div>
          <div className={styles.col}>Products</div>
        </div>
        {loading && items.length === 0 ? (
          <div className={styles.loadingContainer}>
            <Loader />
          </div>
        ) : items.length === 0 ? (
          <div className={styles.empty}>No comments found</div>
        ) : (
          items.map((x, index) => (
            <Row
              item={x}
              key={x.id}
              index={index}
              value={selectedComments.includes(x.id)}
              onChange={() => handleChange(x.id)}
            />
          ))
        )}
      </div>
      <div className={styles.foot}>
        <button
          className={cn("button-stroke button-small", styles.button)}
          onClick={onLoadMore}
          disabled={loading}
        >
          {loading && <Loader className={styles.loader} />}
          <span>Load more</span>
        </button>
      </div>
    </div>
  );
};

export default Table;
