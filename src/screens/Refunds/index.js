import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./Refunds.module.sass";
import Card from "../../components/Card";
import Loader from "../../components/Loader";
import Row from "./Row";
import { getRefunds } from "../../services/orderService";

const navigation = ["Open requests", "Closed requests"];

const Refunds = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  // Fetch refunds when activeIndex changes
  useEffect(() => {
    fetchRefunds();
  }, [activeIndex]);

  const fetchRefunds = async (loadMore = false) => {
    setLoading(true);

    try {
      const statusFilter = activeIndex === 0 ? 'open' : 'closed';
      const options = {
        statusFilter,
        limit: 10,
        offset: loadMore ? refunds.length : 0,
      };

      const { data, error } = await getRefunds(options);

      if (!error) {
        if (loadMore) {
          setRefunds([...refunds, ...(data || [])]);
        } else {
          setRefunds(data || []);
        }

        // Check if there are more items
        setHasMore((data || []).length === 10);
      } else {
        console.error('Error fetching refunds:', error);
      }
    } catch (error) {
      console.error('Error fetching refunds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchRefunds(true);
    }
  };

  // Transform backend data to match UI expectations
  const transformRefund = (refund) => {
    const product = refund.orders?.products;
    const customer = refund.customers;

    return {
      id: refund.id,
      product: product?.name || 'Unknown Product',
      category: product?.category || 'Unknown Category',
      image: product?.image_url || '/images/content/product-pic-1.jpg',
      image2x: product?.image_url || '/images/content/product-pic-1@2x.jpg',
      status: refund.status === 'pending', // true for pending (new request), false for in progress
      date: new Date(refund.created_at).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short'
      }),
      man: customer?.name || 'Unknown Customer',
      avatar: customer?.avatar_url || '/images/content/avatar-1.jpg',
      amount: refund.amount,
      reason: refund.reason || 'No reason provided',
      orderId: refund.order_id,
      customerId: refund.customer_id,
      processedAt: refund.processed_at,
      parameters: [
        {
          title: "Request sent",
          content: new Date(refund.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
        },
        {
          title: "Reason",
          content: refund.reason || "No reason provided",
        },
        {
          title: "Purchase date",
          content: refund.orders?.created_at
            ? new Date(refund.orders.created_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })
            : 'Unknown',
        },
        {
          title: "Request ID",
          content: refund.id.substring(0, 23),
        },
        {
          title: "Amount",
          tooltip: "Refund amount",
          price: refund.amount,
        },
        {
          title: "Order Total",
          tooltip: "Original order total",
          price: refund.orders?.total_amount || 0,
        },
      ],
    };
  };

  return (
    <Card
      className={styles.card}
      classCardHead={styles.head}
      title="Refund requests"
      classTitle={cn("title-purple", styles.title)}
      head={
        <div className={styles.nav}>
          {navigation.map((x, index) => (
            <button
              className={cn(styles.button, {
                [styles.active]: index === activeIndex,
              })}
              onClick={() => setActiveIndex(index)}
              key={index}
            >
              {x}
            </button>
          ))}
        </div>
      }
    >
      <div className={styles.wrapper}>
        <div className={styles.table}>
          <div className={styles.row}>
            <div className={styles.col}>Product</div>
            <div className={styles.col}>Status</div>
            <div className={styles.col}>Date</div>
            <div className={styles.col}>Customer</div>
          </div>
          {loading && refunds.length === 0 ? (
            <div className={styles.loadingContainer}>
              <Loader />
            </div>
          ) : refunds.length === 0 ? (
            <div className={styles.empty}>
              No {activeIndex === 0 ? 'open' : 'closed'} refund requests
            </div>
          ) : (
            refunds.map((refund) => {
              const transformedRefund = transformRefund(refund);
              return (
                <Row
                  item={transformedRefund}
                  key={refund.id}
                  onRefundProcessed={() => fetchRefunds()}
                />
              );
            })
          )}
        </div>
      </div>
      <div className={styles.foot}>
        <button
          className={cn("button-stroke button-small", styles.button)}
          onClick={handleLoadMore}
          disabled={loading || !hasMore}
        >
          {loading && <Loader className={styles.loader} />}
          <span>{hasMore ? 'Load more' : 'No more refunds'}</span>
        </button>
      </div>
    </Card>
  );
};

export default Refunds;
