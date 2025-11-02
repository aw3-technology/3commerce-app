import React, { useState, useEffect } from "react";
import styles from "./Transactions.module.sass";
import cn from "classnames";
import { numberWithCommas } from "../../../utils.js";
import Card from "../../../components/Card";
import Dropdown from "../../../components/Dropdown";
import Loader from "../../../components/Loader";
import { getTransactions } from "../../../services/orderService";

const intervals = ["Last 30 days", "Last 20 days", "Last 10 days"];
const ITEMS_PER_PAGE = 10;

const Transactions = ({ className }) => {
  const [sorting, setSorting] = useState(intervals[0]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, [sorting]);

  const fetchTransactions = async (append = false) => {
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const offset = append ? transactions.length : 0;
      const { data, error } = await getTransactions({
        limit: ITEMS_PER_PAGE,
        offset
      });

      if (!error && data) {
        // Filter by date range based on sorting
        const now = new Date();
        let daysAgo = 30;
        if (sorting === "Last 20 days") daysAgo = 20;
        if (sorting === "Last 10 days") daysAgo = 10;

        const cutoffDate = new Date(now);
        cutoffDate.setDate(now.getDate() - daysAgo);

        const filteredData = data
          .filter(tx => new Date(tx.created_at) >= cutoffDate)
          .map(tx => {
            const platformFee = tx.amount * 0.10; // 10% fee
            const netEarnings = tx.type === 'payment' ? tx.amount - platformFee : -platformFee;

            return {
              id: tx.id,
              date: new Date(tx.created_at).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              }),
              product: tx.orders?.products?.name || 'Product',
              invoice: `Invoice: ${tx.transaction_id || tx.id.substring(0, 8)}`,
              status: tx.type === 'payment',
              type: tx.type,
              price: tx.amount,
              earnings: netEarnings,
            };
          });

        if (append) {
          setTransactions(prev => [...prev, ...filteredData]);
        } else {
          setTransactions(filteredData);
        }

        setHasMore(data.length === ITEMS_PER_PAGE);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    fetchTransactions(true);
  };

  const handleDownloadCSV = () => {
    // Create CSV content
    const headers = ['Date', 'Type', 'Product', 'Invoice', 'Price', 'Amount'];
    const rows = transactions.map(tx => [
      tx.date,
      tx.status ? 'Sale' : 'Author fee',
      tx.product,
      tx.invoice,
      tx.price.toFixed(2),
      tx.earnings.toFixed(2)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${sorting}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card
        className={cn(styles.card, className)}
        classCardHead={styles.head}
        title="Transactions"
        classTitle={cn("title-blue", styles.title)}
      >
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <Loader />
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(styles.card, className)}
      classCardHead={styles.head}
      title="Transactions"
      classTitle={cn("title-blue", styles.title)}
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
          <button
            className={cn("button-small", styles.button)}
            onClick={handleDownloadCSV}
          >
            Download CSV
          </button>
        </>
      }
    >
      <div className={styles.wrapper}>
        <div className={styles.table}>
          <div className={styles.row}>
            <div className={styles.col}>Date</div>
            <div className={styles.col}>Type</div>
            <div className={styles.col}>Detail</div>
            <div className={styles.col}>Price</div>
            <div className={styles.col}>Amount</div>
          </div>
          {transactions.length > 0 ? (
            transactions.map((x, index) => (
              <div className={styles.row} key={x.id || index}>
                <div className={styles.col}>
                  <div className={styles.label}>Date</div>
                  {x.date}
                </div>
                <div className={styles.col}>
                  <div className={styles.details}>
                    <div className={styles.product}>{x.product}</div>
                    <div className={styles.invoice}>{x.invoice}</div>
                  </div>
                  {x.status ? (
                    <div
                      className={cn(
                        { "status-green-dark": x.status === true },
                        styles.status
                      )}
                    >
                      Sale
                    </div>
                  ) : (
                    <div
                      className={cn(
                        { "status-red-dark": x.status === false },
                        styles.status
                      )}
                    >
                      Author fee
                    </div>
                  )}
                </div>
                <div className={styles.col}>
                  <div className={styles.product}>{x.product}</div>
                  <div className={styles.invoice}>{x.invoice}</div>
                </div>
                <div className={styles.col}>
                  <div className={styles.label}>Price</div>$
                  {numberWithCommas(x.price.toFixed(2))}
                </div>
                <div className={styles.col}>
                  <div className={styles.label}>Amount</div>
                  {x.earnings > 0 ? (
                    <div>+${numberWithCommas(x.earnings.toFixed(2))}</div>
                  ) : (
                    <div className={styles.negative}>
                      -${numberWithCommas(Math.abs(x.earnings).toFixed(2))}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className={styles.row}>
              <div className={styles.col}>No transactions found</div>
            </div>
          )}
        </div>
      </div>
      {hasMore && transactions.length > 0 && (
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
    </Card>
  );
};

export default Transactions;
