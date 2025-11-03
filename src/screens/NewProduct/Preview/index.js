import React from "react";
import cn from "classnames";
import styles from "./Preview.module.sass";
import Card from "../../../components/Card";
import Icon from "../../../components/Icon";
import { useAuth } from "../../../contexts/AuthContext";

const Preview = ({ visible, onClose, productData }) => {
  const { user } = useAuth();

  // Extract plain text from HTML description (simple approach)
  const getPlainTextDescription = (html) => {
    if (!html) return "";
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  // Get preview image
  const getPreviewImage = () => {
    if (productData.imageUrl) {
      return productData.imageUrl;
    }
    return "/images/content/photo-1.jpg";
  };

  // Get product name or placeholder
  const getProductName = () => {
    return productData.name || "Product Name";
  };

  // Get price or placeholder
  const getPrice = () => {
    if (productData.price) {
      return `$${productData.price}`;
    }
    return "$0.00";
  };

  // Get user display name
  const getUserName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return "Creator";
  };

  // Get user avatar
  const getUserAvatar = () => {
    return user?.user_metadata?.avatar_url || "/images/content/avatar.jpg";
  };

  return (
    <div className={cn(styles.preview, { [styles.visible]: visible })}>
      <button className={styles.close} onClick={onClose}>
        <Icon name="close" size="24" />
      </button>
      <Card
        className={styles.card}
        classCardHead={styles.head}
        title="Preview"
        classTitle="title-blue"
        head={
          <button className={styles.button}>
            <Icon name="expand" size="24" />
          </button>
        }
      >
        <div className={styles.body}>
          <div className={styles.photo}>
            <img src={getPreviewImage()} alt="Product Preview" />
          </div>
          <div className={styles.line}>
            <div className={styles.title}>
              {getProductName()}
            </div>
            <div className={styles.price}>{getPrice()}</div>
          </div>
          {productData.description && (
            <div className={styles.description}>
              {getPlainTextDescription(productData.description).substring(0, 150)}
              {getPlainTextDescription(productData.description).length > 150 && "..."}
            </div>
          )}
          {productData.category && productData.category !== "Select category" && (
            <div className={styles.category}>
              <strong>Category:</strong> {productData.category}
            </div>
          )}
          {productData.tags && productData.tags.length > 0 && (
            <div className={styles.tags}>
              {productData.tags.map((tag, index) => (
                <span key={index} className={styles.tag}>
                  {tag.text}
                </span>
              ))}
            </div>
          )}
          <div className={styles.user}>
            <div className={styles.avatar}>
              <img src={getUserAvatar()} alt="Creator Avatar" />
            </div>
            <div className={styles.text}>
              by <span>{getUserName()}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Preview;
