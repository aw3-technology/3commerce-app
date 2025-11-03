import React from "react";
import cn from "classnames";
import styles from "./Item.module.sass";
import Icon from "../../../Icon";

const Item = ({ className, item, onClick }) => {
  return (
    <div className={cn(styles.item, className)}>
      <div className={styles.link} onClick={onClick}>
        <div className={styles.preview}>
          {item.image ? (
            <img srcSet={`${item.image2x || item.image} 2x`} src={item.image} alt={item.title} />
          ) : item.icon ? (
            <div className={styles.iconWrapper}>
              <Icon name={item.icon} size="24" />
            </div>
          ) : (
            <div className={styles.iconWrapper}>
              <Icon name="search" size="24" />
            </div>
          )}
        </div>
        <div className={styles.details}>
          <div className={styles.content}>{item.content}</div>
          <div className={styles.title}>{item.title}</div>
        </div>
      </div>
      <button className={styles.close}>
        <Icon name="close" size="24" />
      </button>
    </div>
  );
};

export default Item;
