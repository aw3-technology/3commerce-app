import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import cn from "classnames";
import OutsideClickHandler from "react-outside-click-handler";
import styles from "./Notification.module.sass";
import Icon from "../../Icon";
import Actions from "../../Actions";
import Item from "./Item";

// services
import {
  getAllNotifications,
  markAllAsRead,
  deleteAllNotifications,
  getNotificationCount,
  subscribeToNotifications,
  unsubscribeFromNotifications
} from "../../../services/notificationService";

const Notification = ({ className }) => {
  const [visible, setVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    // Subscribe to real-time updates
    const subscription = subscribeToNotifications((payload) => {
      console.log('Notification update:', payload);
      fetchNotifications();
      fetchUnreadCount();
    });

    return () => {
      unsubscribeFromNotifications(subscription);
    };
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await getAllNotifications({ limit: 5 });
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const { data } = await getNotificationCount({ unreadOnly: true });
      setUnreadCount(data || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      await fetchNotifications();
      await fetchUnreadCount();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm('Are you sure you want to delete all notifications?')) {
      try {
        await deleteAllNotifications();
        await fetchNotifications();
        await fetchUnreadCount();
      } catch (error) {
        console.error('Error deleting notifications:', error);
      }
    }
  };

  const handleNotificationUpdate = () => {
    fetchNotifications();
    fetchUnreadCount();
  };

  const actions = [
    {
      title: "Mark as read",
      icon: "check",
      action: handleMarkAllAsRead,
    },
    {
      title: "Delete notifications",
      icon: "trash",
      action: handleDeleteAll,
    },
  ];

  return (
    <OutsideClickHandler onOutsideClick={() => setVisible(false)}>
      <div
        className={cn(styles.notification, className, {
          [styles.active]: visible,
        })}
      >
        <button
          className={cn(styles.head, { [styles.active]: unreadCount > 0 })}
          onClick={() => setVisible(!visible)}
        >
          <Icon name="notification" size="24" />
          {unreadCount > 0 && (
            <span className={styles.badge}>{unreadCount}</span>
          )}
        </button>
        <div className={styles.body}>
          <div className={styles.top}>
            <div className={styles.title}>
              Notification {unreadCount > 0 && `(${unreadCount})`}
            </div>
            <Actions
              className={styles.actions}
              classActionsHead={styles.actionsHead}
              items={actions}
              small
            />
          </div>
          <div className={styles.list}>
            {loading ? (
              <div style={{ padding: '1rem', textAlign: 'center' }}>
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <Item
                  className={cn(styles.item, className)}
                  item={notification}
                  key={notification.id}
                  onClose={() => setVisible(false)}
                  onUpdate={handleNotificationUpdate}
                />
              ))
            )}
          </div>
          <Link
            className={cn("button", styles.button)}
            to="/notification"
            onClick={() => setVisible(false)}
          >
            See all notifications
          </Link>
        </div>
      </div>
    </OutsideClickHandler>
  );
};

export default Notification;
