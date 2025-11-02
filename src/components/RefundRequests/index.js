import React, { useState, useEffect } from "react";
import cn from "classnames";
import { Link } from "react-router-dom";
import styles from "./RefundRequests.module.sass";
import Card from "../Card";
import Icon from "../Icon";
import { getRefunds } from "../../services/orderService";

const RefundRequests = ({ className, title, classTitle }) => {
  const [refundStats, setRefundStats] = useState({ total: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    setLoading(true);
    const { data, error } = await getRefunds();

    if (!error && data) {
      const total = data.length;
      const pending = data.filter(r => r.status === 'pending').length;
      setRefundStats({ total, pending });
    }
    setLoading(false);
  };

  const requests = [
    {
      content:
        loading ? 'Loading refund requests...' :
        refundStats.total === 0 ? 'No refund requests at the moment. <span role="img" aria-label="smile">✅</span>' :
        `You have <strong>${refundStats.total} open refund requests</strong> to action. This includes <strong>${refundStats.pending} pending requests</strong>. <span role="img" aria-label="smile">👀</span>`,
      icon: "basket",
      fill: "#FF6A55",
      color: "#FFE7E4",
    },
  ];
  return (
    <Card
      className={cn(styles.card, className)}
      title={title}
      classTitle={classTitle}
    >
      <div className={styles.section}>
        <div className={styles.list}>
          {requests.map((x, index) => (
            <div className={styles.item} key={index}>
              <div className={styles.icon} style={{ backgroundColor: x.color }}>
                <Icon name={x.icon} size="24" fill={x.fill} />
              </div>
              <div
                className={styles.content}
                dangerouslySetInnerHTML={{ __html: x.content }}
              ></div>
            </div>
          ))}
        </div>
        <Link
          className={cn("button-stroke", styles.button)}
          to="/income/refunds"
        >
          Review refund requests
        </Link>
      </div>
    </Card>
  );
};

export default RefundRequests;
