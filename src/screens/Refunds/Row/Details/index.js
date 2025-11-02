import React, { useState } from "react";
import styles from "./Details.module.sass";
import cn from "classnames";
import Product from "./Product";
import Parameter from "./Parameter";
import TooltipGlodal from "../../../../components/TooltipGlodal";
import Editor from "../../../../components/Editor";
import { processRefund } from "../../../../services/orderService";

const suggestions = [
  "Talk to customer to see if you can help.",
  "If not, approve or decline the request.",
];

const Details = ({ item, onRefundProcessed }) => {
  const [content, setContent] = useState();
  const [processing, setProcessing] = useState(false);

  const handleApproveRefund = async () => {
    if (!item.id) return;

    const confirmed = window.confirm(
      `Are you sure you want to approve this refund of $${item.amount}?`
    );

    if (!confirmed) return;

    setProcessing(true);
    const { data, error } = await processRefund(item.id, 'approved');

    if (error) {
      console.error('Error approving refund:', error);
      alert('Failed to approve refund. Please try again.');
    } else {
      alert('Refund approved successfully!');
      if (onRefundProcessed) {
        onRefundProcessed();
      }
    }
    setProcessing(false);
  };

  const handleDeclineRefund = async () => {
    if (!item.id) return;

    const confirmed = window.confirm(
      'Are you sure you want to decline this refund request?'
    );

    if (!confirmed) return;

    setProcessing(true);
    const { data, error } = await processRefund(item.id, 'rejected');

    if (error) {
      console.error('Error declining refund:', error);
      alert('Failed to decline refund. Please try again.');
    } else {
      alert('Refund declined successfully!');
      if (onRefundProcessed) {
        onRefundProcessed();
      }
    }
    setProcessing(false);
  };

  const handleSendMessage = () => {
    if (!content) {
      alert('Please enter a message');
      return;
    }

    // TODO: Implement message sending functionality
    alert('Message functionality will be implemented soon');
    setContent('');
  };

  return (
    <>
      <div className={styles.details}>
        <div className={cn("title-purple", styles.title)}>Refunds request</div>
        <div className={styles.row}>
          <div className={styles.col}>
            <Product className={styles.product} item={item} />
            <div className={styles.parameters}>
              {item.parameters.map((x, index) => (
                <Parameter item={x} key={index} />
              ))}
            </div>
            <div className={styles.btns}>
              <button
                className={cn("button-stroke", styles.button)}
                onClick={handleDeclineRefund}
                disabled={processing || !item.status}
              >
                {processing ? 'Processing...' : 'Decline refund'}
              </button>
              <button
                className={cn("button", styles.button)}
                onClick={handleApproveRefund}
                disabled={processing || !item.status}
              >
                {processing ? 'Processing...' : 'Give refund'}
              </button>
            </div>
            {!item.status && (
              <div className={styles.processedNote}>
                This refund request has already been processed
              </div>
            )}
          </div>
          <div className={styles.col}>
            <div className={styles.group}>
              <div className={styles.box}>
                <div className={styles.info}>Suggestions</div>
                <ul className={styles.list}>
                  {suggestions.map((x, index) => (
                    <li key={index}>{x}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.box}>
                <div className={styles.info}>{item.reason || 'Refund Request'}</div>
                <div className={styles.text}>
                  " {item.reason || 'Customer has requested a refund.'} "
                </div>
                <div className={styles.user}>
                  <div className={styles.avatar}>
                    <img src={item.avatar} alt="Avatar" />
                  </div>
                  {item.man}
                </div>
              </div>
            </div>
            <Editor
              state={content}
              onChange={setContent}
              classEditor={styles.editor}
              label="Send message"
              tooltip="Send message to customer"
              button="Send"
              onButtonClick={handleSendMessage}
            />
          </div>
        </div>
      </div>
      <TooltipGlodal />
    </>
  );
};

export default Details;
