import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./Users.module.sass";
import { Link } from "react-router-dom";
import Icon from "../Icon";
import { getCustomerStats, getAllCustomers } from "../../services/customerService";

const Users = ({ className }) => {
  const [customerCount, setCustomerCount] = useState(0);
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch customer stats for total count
      const { data: statsData, error: statsError } = await getCustomerStats();

      // Fetch recent customers (limit to 3 for display)
      const { data: customersData, error: customersError } = await getAllCustomers({ limit: 3 });

      if (statsError || customersError) {
        setError(statsError?.message || customersError?.message || "Failed to fetch customer data");
        console.error("Error fetching customer data:", statsError || customersError);
      } else {
        setCustomerCount(statsData?.total || 0);

        // Transform customer data for display
        const transformedCustomers = customersData?.map((customer) => ({
          title: customer.name || customer.email?.split('@')[0] || "Customer",
          avatar: customer.avatar_url || "/images/content/avatar.jpg",
          url: "/message-center",
        })) || [];

        setRecentCustomers(transformedCustomers);
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
      console.error("Error fetching customer data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(styles.users, className)}>
      <div className={styles.head}>
        <div className={styles.info}>
          Welcome <strong>{loading ? "..." : customerCount} customers</strong> with a personal message{" "}
          <span role="img" aria-label="smile">
            😎
          </span>
        </div>
        <Link
          className={cn("button-stroke", styles.button)}
          to="/message-center"
        >
          Send<span> message</span>
        </Link>
      </div>
      {error && (
        <div className={styles.error} style={{ padding: "10px", color: "#ef466f", fontSize: "12px" }}>
          {error}
        </div>
      )}
      <div className={styles.list}>
        {loading ? (
          <div style={{ padding: "20px", textAlign: "center", color: "#808191" }}>
            Loading customers...
          </div>
        ) : recentCustomers.length > 0 ? (
          <>
            {recentCustomers.map((x, index) => (
              <Link className={styles.item} key={index} to={x.url}>
                <div className={styles.avatar}>
                  <img src={x.avatar} alt="Avatar" />
                </div>
                <div className={styles.title}>{x.title}</div>
              </Link>
            ))}
            <Link className={styles.all} to="/customers/customer-list">
              <div className={styles.icon}>
                <Icon name="arrow-right" size="24" />
              </div>
              <div className={styles.text}>View all</div>
            </Link>
          </>
        ) : (
          <div style={{ padding: "20px", textAlign: "center", color: "#808191" }}>
            No customers found
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
