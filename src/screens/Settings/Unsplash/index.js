import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./Unsplash.module.sass";
import Item from "../Item";
import Tooltip from "../../../components/Tooltip";
import { testUnsplashConnection } from "../../../services/unsplashClient";

const Unsplash = ({ className }) => {
  const [connectionStatus, setConnectionStatus] = useState('unchecked');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setConnectionStatus('checking');
    setErrorMessage('');

    try {
      const { success, error } = await testUnsplashConnection();

      if (success) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('error');
        setErrorMessage(error?.message || 'Failed to connect to Unsplash');
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
      title="Unsplash Integration"
      classTitle="title-blue"
    >
      <div className={styles.section}>
        <div className={styles.line}>
          <div className={styles.title}>
            Connection Status{" "}
            <Tooltip
              className={styles.tooltip}
              title="Unsplash API connection status for browsing free stock images"
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

          {connectionStatus === 'connected' && (
            <div
              className={styles.successInfo}
              style={{
                marginTop: '12px',
                padding: '12px',
                backgroundColor: '#d4edda',
                borderRadius: '4px',
                border: '1px solid #c3e6cb',
                color: '#155724'
              }}
            >
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>Successfully Connected!</div>
              <div style={{ fontSize: '14px' }}>
                You can now browse and use beautiful, free images from Unsplash in your products.
              </div>
            </div>
          )}
        </div>

        <div className={styles.content} style={{ marginTop: '16px' }}>
          <p>
            Unsplash integration provides access to millions of high-quality, free stock images.
            Features include:
          </p>
          <ul style={{ marginTop: '8px', marginLeft: '20px' }}>
            <li>Browse curated collections and trending photos</li>
            <li>Search by keywords, categories, and topics</li>
            <li>Filter by orientation (landscape, portrait, square)</li>
            <li>Automatic attribution to photographers</li>
            <li>No licensing fees or attribution required (but appreciated)</li>
          </ul>
        </div>
      </div>

      <div className={styles.section} style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e0e0e0' }}>
        <div className={styles.title}>API Configuration</div>
        <div className={styles.content} style={{ marginTop: '12px' }}>
          <p>
            The Unsplash API credentials are configured in your environment variables.
            To update them, modify these values in your <code style={{
              backgroundColor: '#f4f4f4',
              padding: '2px 6px',
              borderRadius: '3px',
              fontFamily: 'monospace'
            }}>.env</code> file:
          </p>
          <ul style={{ marginTop: '8px', marginLeft: '20px', fontFamily: 'monospace', fontSize: '13px' }}>
            <li>REACT_APP_UNSPLASH_ACCESS_KEY</li>
            <li>REACT_APP_UNSPLASH_SECRET_KEY</li>
            <li>REACT_APP_UNSPLASH_APPLICATION_ID</li>
          </ul>
          <p style={{ marginTop: '12px', fontSize: '14px', color: '#6c757d' }}>
            Get your API keys from the{" "}
            <a
              href="https://unsplash.com/developers"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#007bff', textDecoration: 'underline' }}
            >
              Unsplash Developers Portal
            </a>
          </p>
        </div>
      </div>

      <div className={styles.section} style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e0e0e0' }}>
        <div className={styles.title}>Usage Guidelines</div>
        <div className={styles.content} style={{ marginTop: '12px' }}>
          <p>
            When using Unsplash images in your products:
          </p>
          <ul style={{ marginTop: '8px', marginLeft: '20px' }}>
            <li>Attribution is automatically included for each image</li>
            <li>Do not use images in offensive or harmful contexts</li>
            <li>Do not compile images into a competing service</li>
            <li>Respect the{" "}
              <a
                href="https://unsplash.com/license"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#007bff', textDecoration: 'underline' }}
              >
                Unsplash License
              </a>
            </li>
          </ul>
        </div>
      </div>
    </Item>
  );
};

export default Unsplash;
