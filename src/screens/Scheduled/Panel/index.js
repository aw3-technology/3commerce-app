import React from "react";
import cn from "classnames";
import styles from "./Panel.module.sass";
import Icon from "../../../components/Icon";

const Panel = ({ selectedCount = 0, onPublishNow, onReschedule }) => {
  return (
    <div className={cn("panel", styles.panel)}>
      <div className={styles.info}>
        <Icon name="check-all" size="24" />
        {selectedCount} {selectedCount === 1 ? 'product' : 'products'} selected
      </div>
      <div className={styles.btns}>
        <button
          className={cn("button-stroke-red", styles.button)}
          onClick={onReschedule}
        >
          <Icon name="calendar" size="24" />
          <span>Reschedule</span>
        </button>
        <button
          className={cn("button", styles.button)}
          onClick={onPublishNow}
        >
          Publish now
        </button>
      </div>
    </div>
  );
};

export default Panel;
