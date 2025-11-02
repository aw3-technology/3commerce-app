import React, { useState } from "react";
import cn from "classnames";
import styles from "./Users.module.sass";
import Icon from "../../../components/Icon";
import Form from "../../../components/Form";
import Item from "./Item";

const Users = ({
  className,
  items,
  navigation,
  setVisible,
  onSubmit,
  search,
  setSearch,
  onConversationSelect,
  loading,
}) => {
  const [activeId, setActiveId] = useState(items.length > 0 ? items[0].id : null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleItemClick = (item) => {
    setActiveId(item.id);
    setVisible(true);
    if (onConversationSelect) {
      onConversationSelect(item);
    }
  };

  return (
    <div className={cn(className, styles.users)}>
      <div className={styles.nav}>
        {navigation.map((x, index) => (
          <button
            className={cn(styles.button, {
              [styles.active]: activeIndex === index,
            })}
            onClick={() => setActiveIndex(index)}
            key={index}
          >
            <Icon name={x.icon} size="24" />
            {x.title}
          </button>
        ))}
      </div>
      <div className={styles.list}>
        {loading ? (
          <div className={styles.loading}>Loading conversations...</div>
        ) : items.length === 0 ? (
          <div className={styles.empty}>No conversations yet</div>
        ) : (
          items.map((x, index) => (
            <Item
              item={x}
              activeId={activeId}
              setActiveId={setActiveId}
              setVisible={setVisible}
              onItemClick={() => handleItemClick(x)}
              key={index}
            />
          ))
        )}
      </div>
      <Form
        className={styles.form}
        value={search}
        setValue={setSearch}
        onSubmit={onSubmit}
        placeholder="Search message"
        type="text"
        name="search"
        icon="search"
      />
    </div>
  );
};

export default Users;
