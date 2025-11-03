import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./Printful.module.sass";
import Item from "../Item";
import Tooltip from "../../../components/Tooltip";
import { testPrintfulConnection } from "../../../services/printfulClient";
import { getStoreInfo } from "../../../services/printfulService";

const Printful = ({ className }) => {
  const [connectionStatus, setConnectionStatus] = useState('unchecked'); // unchecked, checking, connected, error
  const [storeInfo, setStoreInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Auto-check connection on component mount
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setConnectionStatus('checking');
    setErrorMessage('');

    try {
      const { success, error, storeInfo: info } = await testPrintfulConnection();

      if (success) {
        setConnectionStatus('connected');
        setStoreInfo(info);
      } else {
        setConnectionStatus('error');
        setErrorMessage(error?.message || 'Failed to connect to Printful');
      }
    } catch (err) {
      setConnectionStatus('error');
      setErrorMessage('Network error occurred');
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return '#28a745'; // green
      case 'error':
        return '#dc3545'; // red
      case 'checking':
        return '#ffc107'; // yellow
      default:
        return '#6c757d'; // gray
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Connection Failed';
      case 'checking':
        return 'Checking...';
      default:
        return 'Not Checked';
    }
  };

  return (
    <Item
      className={cn(styles.card, className)}
      title="Printful Integration"
      classTitle="title-purple"
    >
      <div className={styles.section}>
        <div className={styles.line}>
          <div className={styles.title}>
            Connection Status{" "}
            <Tooltip
              className={styles.tooltip}
              title="Printful API connection status for print-on-demand fulfillment"
              icon="info"
              place="top"
            />
          </div>
          <button
            className={cn("button-stroke button-small", styles.button)}
            onClick={checkConnection}
            disabled={connectionStatus === 'checking'}
          >
            Test Connection
          </button>
        </div>

        <div className={styles.status}>
          <div
            className={styles.statusIndicator}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '8px',
              marginBottom: '8px'
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: getStatusColor()
              }}
            />
            <span style={{ fontWeight: '500' }}>{getStatusText()}</span>
          </div>

          {errorMessage && (
            <div
              className={styles.error}
              style={{
                color: '#dc3545',
                fontSize: '14px',
                marginTop: '8px',
                padding: '8px 12px',
                backgroundColor: '#f8d7da',
                borderRadius: '4px',
                border: '1px solid #f5c6cb'
              }}
            >
              {errorMessage}
            </div>
          )}

          {connectionStatus === 'connected' && storeInfo && (
            <div
              className={styles.storeInfo}
              style={{
                marginTop: '12px',
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                border: '1px solid #e0e0e0'
              }}
            >
              <div style={{ fontWeight: '600', marginBottom: '8px' }}>Store Information</div>
              <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                {storeInfo.name && (
                  <div><strong>Store Name:</strong> {storeInfo.name}</div>
                )}
                {storeInfo.website && (
                  <div><strong>Website:</strong> {storeInfo.website}</div>
                )}
                {storeInfo.currency && (
                  <div><strong>Currency:</strong> {storeInfo.currency}</div>
                )}
                {storeInfo.packing_slip?.email && (
                  <div><strong>Email:</strong> {storeInfo.packing_slip.email}</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={styles.content} style={{ marginTop: '16px' }}>
          <p>
            Printful integration enables print-on-demand fulfillment for your products.
            Once connected, you can:
          </p>
          <ul style={{ marginTop: '8px', marginLeft: '20px' }}>
            <li>Browse and select from Printful's product catalog</li>
            <li>Create custom products with your designs</li>
            <li>Automatically fulfill orders through Printful</li>
            <li>Track order status and shipping information</li>
          </ul>
        </div>
      </div>

      <div className={styles.section} style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e0e0e0' }}>
        <div className={styles.title}>API Configuration</div>
        <div className={styles.content} style={{ marginTop: '12px' }}>
          <p>
            The Printful API token is configured in your environment variables.
            To update it, modify the <code style={{
              backgroundColor: '#f4f4f4',
              padding: '2px 6px',
              borderRadius: '3px',
              fontFamily: 'monospace'
            }}>REACT_APP_PRINTFUL_API_TOKEN</code> value in your <code style={{
              backgroundColor: '#f4f4f4',
              padding: '2px 6px',
              borderRadius: '3px',
              fontFamily: 'monospace'
            }}>.env</code> file.
          </p>
          <p style={{ marginTop: '8px', fontSize: '14px', color: '#6c757d' }}>
            Get your API token from the{" "}
            <a
              href="https://www.printful.com/dashboard/store"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#007bff', textDecoration: 'underline' }}
            >
              Printful Dashboard
            </a>
          </p>
        </div>
      </div>
    </Item>
  );
};

export default Printful;
