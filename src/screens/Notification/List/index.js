import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import cn from "classnames";
import styles from "./List.module.sass";
import Card from "../../../components/Card";
import Dropdown from "../../../components/Dropdown";
import Actions from "../../../components/Actions";
import Loader from "../../../components/Loader";
import Item from "./Item";

// services
import {
  getAllNotifications,
  markAllAsRead,
  getNotificationCount,
  subscribeToNotifications,
  unsubscribeFromNotifications
} from "../../../services/notificationService";

const intervals = ["Recent", "New", "This year"];
const ITEMS_PER_PAGE = 10;

const List = ({ className, selectedFilters = [] }) => {
  const [sorting, setSorting] = useState(intervals[0]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

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
  }, [selectedFilters, sorting]);

  const fetchNotifications = async (append = false) => {
    try {
      if (!append) {
        setLoading(true);
      }

      const offset = append ? notifications.length : 0;
      const options = {
        limit: ITEMS_PER_PAGE,
        offset,
        unreadOnly: sorting === "New"
      };

      // Apply type filter if selected
      if (selectedFilters.length > 0) {
        // Map filter names to notification types
        const typeMap = {
          'Comments': 'customer',
          'Likes': 'product',
          'Review': 'product',
          'Mentions': 'customer',
          'Purchases': 'order',
          'Message': 'system'
        };

        const types = selectedFilters.map(filter => typeMap[filter]).filter(Boolean);
        if (types.length > 0) {
          options.type = types[0]; // For now, use first filter
        }
      }

      const { data, error } = await getAllNotifications(options);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      if (append) {
        setNotifications(prev => [...prev, ...(data || [])]);
      } else {
        setNotifications(data || []);
      }

      // Check if there are more notifications to load
      setHasMore(data && data.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
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
      const { error } = await markAllAsRead();
      if (!error) {
        // Refresh notifications
        await fetchNotifications();
        await fetchUnreadCount();
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleGoSettings = () => {
    navigate('/settings/notifications');
  };

  const handleLoadMore = () => {
    setLoadingMore(true);
    fetchNotifications(true);
  };

  const handleNotificationUpdate = () => {
    // Refresh notifications when an item is marked as read or deleted
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
      title: "Go setting",
      icon: "setting",
      action: handleGoSettings,
    },
  ];

  if (loading) {
    return (
      <Card className={cn(styles.card, className)} title="Notifications">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <Loader />
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(styles.card, className)}
      title={sorting === "New" ? `New (${unreadCount})` : "Notifications"}
      classTitle={cn("title-red", styles.title)}
      classCardHead={styles.head}
      head={
        <>
          <Dropdown
            className={styles.dropdown}
            classDropdownHead={styles.dropdownHead}
            value={sorting}
            setValue={setSorting}
            options={intervals}
            small
          />
          <Actions
            className={styles.actions}
            classActionsHead={styles.actionsHead}
            items={actions}
          />
        </>
      }
    >
      <div className={styles.notifications}>
        {notifications.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
            No notifications to display
          </div>
        ) : (
          <>
            <div className={styles.list}>
              {notifications.map((notification) => (
                <Item
                  className={cn(styles.item, className)}
                  item={notification}
                  key={notification.id}
                  onUpdate={handleNotificationUpdate}
                />
              ))}
            </div>
            {hasMore && (
              <div className={styles.foot}>
                <button
                  className={cn("button-stroke button-small", styles.button)}
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore && <Loader className={styles.loader} />}
                  <span>{loadingMore ? 'Loading...' : 'Load more'}</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
};

export default List;
