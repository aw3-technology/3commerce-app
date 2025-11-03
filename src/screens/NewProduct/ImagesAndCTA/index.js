import React, { useState } from "react";
import cn from "classnames";
import styles from "./ImagesAndCTA.module.sass";
import Card from "../../../components/Card";
import File from "../../../components/File";
import Dropdown from "../../../components/Dropdown";
import Modal from "../../../components/Modal";
import UnsplashBrowser from "../../../components/UnsplashBrowser";

const optionsPurchase = ["Purchase now", "Purchase tomorrow", "Buy later"];

const ImagesAndCTA = ({ className, productData, updateProductData }) => {
  const [showUnsplashBrowser, setShowUnsplashBrowser] = useState(false);

  const handlePurchaseChange = (value) => {
    updateProductData({ ctaButton: value });
  };

  const handleImageUpload = (file) => {
    // For now, we'll store the file and create a local preview URL
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      updateProductData({
        coverImageFile: file,
        imageUrl: imageUrl,
        unsplashAttribution: null // Clear Unsplash attribution if uploading own image
      });
    }
  };

  const handleUnsplashSelect = (imageData) => {
    updateProductData({
      imageUrl: imageData.url,
      coverImageFile: null, // Clear file upload if using Unsplash
      unsplashAttribution: imageData.attribution
    });
    setShowUnsplashBrowser(false);
  };

  return (
    <>
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

          <div className={styles.field}>
            <div className={styles.label}>Or browse Unsplash</div>
            <button
              type="button"
              className={cn("button-stroke button-small", styles.unsplashButton)}
              onClick={() => setShowUnsplashBrowser(true)}
            >
              Browse Unsplash Images
            </button>
          </div>

          {productData.imageUrl && (
            <div className={styles.preview}>
              <div className={styles.previewLabel}>Selected Image:</div>
              <img
                src={productData.imageUrl}
                alt="Cover preview"
                className={styles.previewImage}
              />
              {productData.unsplashAttribution && (
                <div className={styles.attribution}>
                  Photo by{" "}
                  <a
                    href={productData.unsplashAttribution.photographerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {productData.unsplashAttribution.photographerName}
                  </a>
                  {" "}on{" "}
                  <a
                    href="https://unsplash.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Unsplash
                  </a>
                </div>
              )}
            </div>
          )}

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

      <Modal
        visible={showUnsplashBrowser}
        onClose={() => setShowUnsplashBrowser(false)}
        outerClassName={styles.modal}
      >
        <UnsplashBrowser
          onSelectImage={handleUnsplashSelect}
          className={styles.unsplashBrowser}
        />
      </Modal>
    </>
  );
};

export default ImagesAndCTA;
