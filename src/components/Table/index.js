import React, { useState } from "react";
import styles from "./Table.module.sass";
import cn from "classnames";
import Checkbox from "../Checkbox";
import Loader from "../Loader";
import Icon from "../Icon";
import Row from "./Row";

const Table = ({
  items,
  title,
  selectedProducts,
  onSelectProducts,
  loading = false,
  onLoadMore,
  hasMore = false
}) => {
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
        {items.length === 0 ? (
          <div className={styles.emptyState}>
            <Icon name="folder" size="48" className={styles.emptyIcon} />
            <div className={styles.emptyTitle}>No products found</div>
            <div className={styles.emptyHint}>Create your first product to get started</div>
          </div>
        ) : (
          items.map((x, index) => (
            <Row
              item={x}
              key={x.id || index}
              index={index}
              value={selectedFilters.includes(x.id)}
              onChange={() => handleChange(x.id)}
            />
          ))
        )}
      </div>
      {onLoadMore && hasMore && (
        <div className={styles.foot}>
          <button
            className={cn("button-stroke button-small", styles.button)}
            onClick={onLoadMore}
            disabled={loading}
          >
            {loading && <Loader className={styles.loader} />}
            <span>{loading ? 'Loading...' : 'Load more'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Table;
