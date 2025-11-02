import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import cn from "classnames";
import styles from "./Item.module.sass";
import Control from "./Control";
import { markAsRead, deleteNotification } from "../../../../services/notificationService";

// Helper function to get icon and color based on notification type
const getNotificationStyle = (type) => {
  const styles = {
    order: {
      icon: "/images/content/shopping-bag.svg",
      color: "#83BF6E"
    },
    product: {
      icon: "/images/content/star.svg",
      color: "#8E59FF"
    },
    customer: {
      icon: "/images/content/message.svg",
      color: "#2A85FF"
    },
    system: {
      icon: "/images/content/notification.svg",
      color: "#FF6A55"
    }
  };
  return styles[type] || styles.system;
};

// Helper function to format time
const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 30) return `${diffDays}d`;
  return date.toLocaleDateString();
};

const Item = ({ className, item, onUpdate }) => {
  const [visible, setVisible] = useState(false);
  const [currentValue, setCurrentValue] = useState("");
  const navigate = useNavigate();

  const style = getNotificationStyle(item.type);
  const timeAgo = formatTime(item.created_at);

  const handleClick = async () => {
    // Mark as read when clicked
    if (!item.read) {
      await markAsRead(item.id);
      if (onUpdate) onUpdate();
    }

    // Navigate to link if provided
    if (item.link) {
      navigate(item.link);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this notification?')) {
      const { error } = await deleteNotification(item.id);
      if (!error && onUpdate) {
        onUpdate();
      }
    }
  };

  return (
    <div
      className={cn(styles.item, { [styles.new]: !item.read }, className)}
      onClick={handleClick}
      style={{ cursor: item.link ? 'pointer' : 'default' }}
    >
      <div className={styles.avatar}>
        <div className={styles.icon} style={{ backgroundColor: style.color }}>
          <img src={style.icon} alt="Status" />
        </div>
      </div>
      <div className={styles.details}>
        <div className={styles.line}>
          <div className={styles.subtitle}>{item.title}</div>
          <div className={styles.time}>{timeAgo}</div>
        </div>
        <div className={styles.content}>
          {item.message}
        </div>
        {item.message && (
          <Control
            className={styles.control}
            value={visible}
            setValue={setVisible}
            valueAnswer={currentValue}
            setValueAnswer={setCurrentValue}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
};

export default Item;
