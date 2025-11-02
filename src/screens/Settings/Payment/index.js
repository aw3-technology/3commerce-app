import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./Payment.module.sass";
import Item from "../Item";
import Tooltip from "../../../components/Tooltip";
import { getCurrentUser } from "../../../services/userService";

const Payment = ({ className, paymentData, setPaymentData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempEmail, setTempEmail] = useState("");

  // Initialize tempEmail when paymentData changes
  useEffect(() => {
    setTempEmail(paymentData.paypalEmail || "");
  }, [paymentData.paypalEmail]);

  const handleUpdate = () => {
    if (isEditing) {
      // Save the changes
      setPaymentData(prev => ({
        ...prev,
        paypalEmail: tempEmail
      }));
      setIsEditing(false);
    } else {
      // Enter edit mode
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setTempEmail(paymentData.paypalEmail || "");
    setIsEditing(false);
  };

  return (
    <Item
      className={cn(styles.card, className)}
      title="Payment"
      classTitle="title-green"
    >
      <div className={styles.line}>
        <div className={styles.title}>
          PayPal{" "}
          <Tooltip
            className={styles.tooltip}
            title="Enter your PayPal email to receive payouts"
            icon="info"
            place="top"
          />
        </div>
        <button
          className={cn("button-stroke button-small", styles.button)}
          onClick={handleUpdate}
        >
          {isEditing ? "Save" : "Update"}
        </button>
        {isEditing && (
          <button
            className={cn("button-stroke button-small", styles.button)}
            onClick={handleCancel}
            style={{ marginLeft: "8px" }}
          >
            Cancel
          </button>
        )}
      </div>
      {isEditing ? (
        <input
          type="email"
          className={styles.input}
          value={tempEmail}
          onChange={(e) => setTempEmail(e.target.value)}
          placeholder="Enter PayPal email"
          style={{
            padding: "8px 12px",
            border: "1px solid #e0e0e0",
            borderRadius: "4px",
            width: "100%",
            marginTop: "8px",
            marginBottom: "8px"
          }}
        />
      ) : (
        <div className={styles.email}>{paymentData?.paypalEmail || "No PayPal email set"}</div>
      )}
      <div className={styles.content}>
        Payout fee is 1% of the amount transferred, with a minimum of USD $0.25
        and a maximum of USD $20
      </div>
    </Item>
  );
};

export default Payment;
