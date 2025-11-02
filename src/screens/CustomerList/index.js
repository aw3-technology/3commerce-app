import React, { useState, useEffect } from "react";
import styles from "./CustomerList.module.sass";
import cn from "classnames";
import Card from "../../components/Card";
import Form from "../../components/Form";
import Filters from "../../components/Filters";
import Settings from "./Settings";
import Table from "./Table";
import Panel from "./Panel";
import Details from "./Details";
import {
  getCustomersWithEngagement,
  getCustomerCountByStatus,
} from "../../services/customerService";

const navigation = ["Active", "New"];

const CustomerList = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [displayedCount, setDisplayedCount] = useState(0);

  // Fetch customers when navigation or search changes
  useEffect(() => {
    fetchCustomers();
    fetchTotalCount();
  }, [activeIndex, search]);

  const fetchTotalCount = async () => {
    const status = activeIndex === 0 ? "active" : "new";
    const { data, error } = await getCustomerCountByStatus(status);
    if (!error && data) {
      setTotalCount(data.count || 0);
    }
  };

  const fetchCustomers = async (loadMore = false) => {
    setLoading(true);
    const status = activeIndex === 0 ? "active" : "new";

    try {
      const options = {
        status,
        limit: 10,
        offset: loadMore ? customers.length : 0,
      };

      if (search) {
        options.search = search;
      }

      const { data, error } = await getCustomersWithEngagement(options);

      if (!error) {
        if (loadMore) {
          setCustomers([...customers, ...(data || [])]);
        } else {
          setCustomers(data || []);
        }
        setDisplayedCount(
          loadMore ? customers.length + (data || []).length : (data || []).length
        );
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    fetchCustomers();
  };

  const handleLoadMore = () => {
    fetchCustomers(true);
  };

  return (
    <>
      <Card
        className={styles.card}
        title="Customer"
        classTitle={cn("title-purple", styles.title)}
        classCardHead={cn(styles.head, { [styles.hidden]: visible })}
        head={
          <>
            <Form
              className={styles.form}
              value={search}
              setValue={setSearch}
              onSubmit={() => handleSubmit()}
              placeholder="Search by name or email"
              type="text"
              name="search"
              icon="search"
            />
            <div className={styles.nav}>
              {navigation.map((x, index) => (
                <button
                  className={cn(styles.link, {
                    [styles.active]: index === activeIndex,
                  })}
                  onClick={() => setActiveIndex(index)}
                  key={index}
                >
                  {x}
                </button>
              ))}
            </div>
            <Filters
              className={styles.filters}
              title={`Showing ${displayedCount} of ${totalCount} customer${
                totalCount !== 1 ? "s" : ""
              }`}
            >
              <Settings />
            </Filters>
          </>
        }
      >
        <div className={cn(styles.row, { [styles.flex]: visible })}>
          <Table
            className={styles.table}
            activeTable={visible}
            setActiveTable={setVisible}
            selectedCustomers={selectedCustomers}
            setSelectedCustomers={setSelectedCustomers}
            customers={customers}
            loading={loading}
            onLoadMore={handleLoadMore}
            hasMore={displayedCount < totalCount}
          />
          <Details
            className={styles.details}
            onClose={() => setVisible(false)}
          />
        </div>
      </Card>
      <Panel
        selectedCount={selectedCustomers.length}
        onClearSelection={() => setSelectedCustomers([])}
      />
    </>
  );
};

export default CustomerList;
