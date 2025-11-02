import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./Overview.module.sass";
import TooltipGlodal from "../../../components/TooltipGlodal";
import Card from "../../../components/Card";
import Icon from "../../../components/Icon";
import Tooltip from "../../../components/Tooltip";
import Modal from "../../../components/Modal";
import Success from "./Success";
import { getOrderStats } from "../../../services/orderService";
import { numberWithCommas } from "../../../utils.js";

const Overview = ({ className }) => {
  const [visibleModal, setVisibleModal] = useState(false);
  const [balanceData, setBalanceData] = useState({
    currentBalance: 0,
    availableForWithdrawal: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayoutBalance();
  }, []);

  const fetchPayoutBalance = async () => {
    setLoading(true);

    try {
      const { data, error } = await getOrderStats();

      if (!error && data) {
        const totalRevenue = data.revenue || 0;
        const platformFee = totalRevenue * 0.10; // 10% platform fee
        const netEarnings = totalRevenue - platformFee;

        // Assume 30% is held for pending orders, 70% available for withdrawal
        const pendingHoldPercentage = 0.30;
        const availableBalance = netEarnings * (1 - pendingHoldPercentage);

        setBalanceData({
          currentBalance: netEarnings,
          availableForWithdrawal: availableBalance,
        });
      }
    } catch (error) {
      console.error('Error fetching payout balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const items = [
    {
      title: "Current account balance",
      counter: loading ? "..." : `$${numberWithCommas(balanceData.currentBalance.toFixed(2))}`,
      icon: "activity",
      color: "#B5E4CA",
      tooltip: "Total account balance after platform fees",
    },
    {
      title: "Available for withdrawal",
      counter: loading ? "..." : `$${numberWithCommas(balanceData.availableForWithdrawal.toFixed(2))}`,
      icon: "pie-chart",
      color: "#CABDFF",
      tooltip: "Amount available to withdraw (excluding pending funds)",
    },
  ];

  return (
    <>
      <Card
        className={cn(styles.card, className)}
        title="Current balance"
        classTitle="title-blue"
      >
        <div className={styles.overview}>
          <div className={styles.list}>
            {items.map((x, index) => (
              <div className={styles.item} key={index}>
                <div
                  className={styles.icon}
                  style={{ backgroundColor: x.color }}
                >
                  <Icon name={x.icon} size="24" />
                </div>
                <div className={styles.details}>
                  <div className={styles.label}>
                    {x.title}
                    <Tooltip
                      className={styles.tooltip}
                      title={x.tooltip}
                      icon="info"
                      place="top"
                    />
                  </div>
                  <div className={styles.counter}>{x.counter}</div>
                </div>
              </div>
            ))}
          </div>
          <button
            className={cn("button", styles.button)}
            onClick={() => setVisibleModal(true)}
            disabled={loading || balanceData.availableForWithdrawal === 0}
          >
            Withdraw balance
          </button>
        </div>
      </Card>
      <TooltipGlodal />
      <Modal
        outerClassName={styles.outer}
        visible={visibleModal}
        onClose={() => setVisibleModal(false)}
      >
        <Success />
      </Modal>
    </>
  );
};

export default Overview;
