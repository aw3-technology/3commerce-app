import React, { useState, useEffect } from "react";
import styles from "./Table.module.sass";
import cn from "classnames";
import Checkbox from "../../../components/Checkbox";
import Loader from "../../../components/Loader";
import Icon from "../../../components/Icon";
import Row from "./Row";

const Table = ({
  className,
  activeTable,
  setActiveTable,
  selectedCustomers,
  setSelectedCustomers,
  customers,
  loading,
  onLoadMore,
  hasMore,
}) => {
  const [chooseAll, setСhooseAll] = useState(false);
  const [activeId, setActiveId] = useState(null);

  // Set the first customer as active when customers are loaded
  useEffect(() => {
    if (customers && customers.length > 0 && !activeId) {
      setActiveId(customers[0].id);
    }
  }, [customers]);

  // Update chooseAll checkbox based on selections
  useEffect(() => {
    if (
      selectedCustomers.length === customers.length &&
      customers.length > 0
    ) {
      setСhooseAll(true);
    } else {
      setСhooseAll(false);
    }
  }, [selectedCustomers, customers]);

  const handleChange = (id) => {
    if (selectedCustomers.includes(id)) {
      setSelectedCustomers(selectedCustomers.filter((x) => x !== id));
    } else {
      setSelectedCustomers((selectedCustomers) => [...selectedCustomers, id]);
    }
  };

  const handleChooseAll = () => {
    if (chooseAll) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map((c) => c.id));
    }
  };

  // Transform backend data to match UI expectations
  const transformCustomer = (customer) => ({
    id: customer.id,
    user: customer.name,
    login: customer.username || "@username",
    avatar: customer.avatar_url || "/images/content/avatar-1.jpg",
    email: customer.email,
    purchase: customer.order_count || 0,
    price: customer.total_spent || 0,
    balance:
      customer.order_count > 0
        ? ((customer.total_spent / customer.order_count / 100) * 100).toFixed(1)
        : 0,
    comments: customer.comment_count || 0,
    likes: customer.like_count || 0,
  });

  return (
    <div className={cn(styles.wrapper, className)}>
      <div className={cn(styles.table)}>
        <div className={cn(styles.row, { [styles.active]: activeTable })}>
          <div className={styles.col}>
            <Checkbox
              className={styles.checkbox}
              value={chooseAll}
              onChange={handleChooseAll}
            />
          </div>
          <div className={styles.col}>Name</div>
          <div className={styles.col}>Email</div>
          <div className={styles.col}>Purchase</div>
          <div className={styles.col}>Lifetime</div>
          <div className={styles.col}>Comments</div>
          <div className={styles.col}>Likes</div>
        </div>
        {loading && customers.length === 0 ? (
          <div className={styles.loadingContainer}>
            <Loader />
          </div>
        ) : customers.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <Icon name="profile-circle" size="48" />
            </div>
            <div className={styles.emptyTitle}>No customers yet</div>
            <div className={styles.emptyText}>
              Customers will appear here once they make their first purchase
            </div>
          </div>
        ) : (
          customers.map((customer, index) => {
            const transformedCustomer = transformCustomer(customer);
            return (
              <Row
                item={transformedCustomer}
                key={customer.id}
                activeTable={activeTable}
                setActiveTable={setActiveTable}
                activeId={activeId}
                setActiveId={setActiveId}
                value={selectedCustomers.includes(customer.id)}
                onChange={() => handleChange(customer.id)}
              />
            );
          })
        )}
      </div>
      <div className={styles.foot}>
        <button
          className={cn("button-stroke button-small", styles.button)}
          onClick={onLoadMore}
          disabled={loading || !hasMore}
        >
          {loading && <Loader className={styles.loader} />}
          <span>{hasMore ? "Load more" : "No more customers"}</span>
        </button>
      </div>
    </div>
  );
};

export default Table;
