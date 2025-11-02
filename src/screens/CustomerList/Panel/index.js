import React from "react";
import cn from "classnames";
import styles from "./Panel.module.sass";
import Icon from "../../../components/Icon";

const Panel = ({ selectedCount = 0, onClearSelection }) => {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className={cn("panel", styles.panel)}>
      <div className={styles.info}>
        <Icon name="check-all" size="24" />
        <span>{selectedCount} {selectedCount === 1 ? 'customer' : 'customers'}</span> selected
      </div>
      <div className={styles.actions}>
        <button className={cn("button", styles.button)}>Message</button>
        <button
          className={cn("button-stroke", styles.button)}
          onClick={onClearSelection}
        >
          Clear Selection
        </button>
      </div>
    </div>
  );
};

export default Panel;
