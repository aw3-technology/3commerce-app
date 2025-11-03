import React from "react";
import cn from "classnames";
import styles from "./ImagesAndCTA.module.sass";
import Card from "../../../components/Card";
import File from "../../../components/File";
import Dropdown from "../../../components/Dropdown";

const optionsPurchase = ["Purchase now", "Purchase tomorrow", "Buy later"];

const ImagesAndCTA = ({ className, productData, updateProductData }) => {
  const handlePurchaseChange = (value) => {
    updateProductData({ ctaButton: value });
  };

  const handleImageUpload = (file) => {
    // For now, we'll store the file and create a local preview URL
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      updateProductData({
        coverImageFile: file,
        imageUrl: imageUrl
      });
    }
  };

  return (
    <Card
      className={cn(styles.card, className)}
      title="Images & CTA"
      classTitle="title-blue"
    >
      <div className={styles.images}>
        <File
          className={styles.field}
          title="Click or drop image"
          label="Cover images"
          tooltip="Maximum 100 characters. No HTML or emoji allowed"
          onChange={handleImageUpload}
        />
        <Dropdown
          className={styles.field}
          label="CTA Button"
          tooltip="Maximum 100 characters. No HTML or emoji allowed"
          value={productData.ctaButton}
          setValue={handlePurchaseChange}
          options={optionsPurchase}
        />
      </div>
    </Card>
  );
};

export default ImagesAndCTA;
