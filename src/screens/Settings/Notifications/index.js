import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./Notifications.module.sass";
import Item from "../Item";
import Tooltip from "../../../components/Tooltip";
import Switch from "../../../components/Switch";

const settings = [
  {
    id: "product_updates",
    title: "Product updates and community announcements",
    tooltip: "Receive notifications about product updates and community news",
  },
  {
    id: "market_newsletter",
    title: "Market newsletter",
    tooltip: "Receive weekly market newsletter and insights",
  },
  {
    id: "comments",
    title: "Comments",
    tooltip: "Get notified when someone comments on your products",
  },
  {
    id: "purchases",
    title: "Purchases",
    tooltip: "Receive notifications about new purchases",
  },
];

const Notifications = ({ className, notificationPrefs, setNotificationPrefs }) => {
  useEffect(() => {
    // Initialize notification preferences if not already set
    if (!notificationPrefs || Object.keys(notificationPrefs).length === 0) {
      const defaultPrefs = {};
      settings.forEach(setting => {
        defaultPrefs[setting.id] = false;
      });
      setNotificationPrefs(defaultPrefs);
    }
  }, []);

  const handleChange = (id) => {
    setNotificationPrefs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <Item
      className={cn(styles.card, className)}
      title="Notifications"
      classTitle="title-red"
    >
      <div className={styles.list}>
        {settings.map((x, index) => (
          <div className={styles.line} key={index}>
            <div className={styles.title}>
              {x.title}{" "}
              <Tooltip
                className={styles.tooltip}
                title={x.tooltip}
                icon="info"
                place="top"
              />
            </div>
            <Switch
              className={styles.switch}
              value={notificationPrefs?.[x.id] || false}
              onChange={() => handleChange(x.id)}
            />
          </div>
        ))}
      </div>
    </Item>
  );
};

export default Notifications;
