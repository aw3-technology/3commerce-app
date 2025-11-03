import React, { useState } from "react";
import cn from "classnames";
import styles from "./PrintfulProduct.module.sass";
import Card from "../../../components/Card";
import Checkbox from "../../../components/Checkbox";
import PrintfulBrowser from "../../../components/PrintfulBrowser";
import Modal from "../../../components/Modal";

const PrintfulProduct = ({ className, productData, updateProductData }) => {
  const [showBrowser, setShowBrowser] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(
    productData.printfulProduct || null
  );
  const [selectedVariants, setSelectedVariants] = useState(
    productData.printfulVariants || []
  );

  const handleEnablePrintful = (checked) => {
    updateProductData({
      isPrintfulProduct: checked,
      printfulProduct: checked ? selectedProduct : null,
      printfulVariants: checked ? selectedVariants : []
    });

    if (checked && !selectedProduct) {
      setShowBrowser(true);
    }
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    updateProductData({
      printfulProduct: product,
      name: productData.name || product.name,
      description: productData.description || product.description,
      imageUrl: productData.imageUrl || product.image
    });
    setShowBrowser(false);
  };

  const handleVariantToggle = (variant) => {
    const isSelected = selectedVariants.some(v => v.id === variant.id);
    let newVariants;

    if (isSelected) {
      newVariants = selectedVariants.filter(v => v.id !== variant.id);
    } else {
      newVariants = [...selectedVariants, variant];
    }

    setSelectedVariants(newVariants);
    updateProductData({ printfulVariants: newVariants });
  };

  const formatPrice = (price) => {
    return parseFloat(price).toFixed(2);
  };

  return (
    <>
      <Card
        className={cn(styles.card, className)}
        title="Print-on-Demand (Printful)"
        classTitle="title-purple"
      >
        <div className={styles.enableSection}>
          <Checkbox
            className={styles.checkbox}
            content="Enable Printful fulfillment for this product"
            value={productData.isPrintfulProduct || false}
            onChange={handleEnablePrintful}
          />
          <p className={styles.description}>
            Create a print-on-demand product that will be automatically fulfilled
            by Printful when customers place orders.
          </p>
        </div>

        {productData.isPrintfulProduct && (
          <div className={styles.printfulContent}>
            {!selectedProduct ? (
              <div className={styles.selectPrompt}>
                <p>No Printful product selected</p>
                <button
                  className={cn("button-stroke button-small", styles.browseButton)}
                  onClick={() => setShowBrowser(true)}
                >
                  Browse Printful Products
                </button>
              </div>
            ) : (
              <div className={styles.selectedProduct}>
                <div className={styles.productHeader}>
                  <h4 className={styles.productTitle}>Selected Product</h4>
                  <button
                    className={cn("button-stroke button-small", styles.changeButton)}
                    onClick={() => setShowBrowser(true)}
                  >
                    Change Product
                  </button>
                </div>

                <div className={styles.productDisplay}>
                  {selectedProduct.image && (
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className={styles.productImage}
                    />
                  )}
                  <div className={styles.productDetails}>
                    <h5 className={styles.productName}>{selectedProduct.name}</h5>
                    {selectedProduct.description && (
                      <p className={styles.productDescription}>
                        {selectedProduct.description}
                      </p>
                    )}
                  </div>
                </div>

                {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                  <div className={styles.variantsSection}>
                    <h4 className={styles.variantsTitle}>
                      Available Variants
                      <span className={styles.variantCount}>
                        ({selectedVariants.length} selected)
                      </span>
                    </h4>
                    <div className={styles.variantsList}>
                      {selectedProduct.variants.map((variant) => {
                        const isSelected = selectedVariants.some(v => v.id === variant.id);
                        return (
                          <div
                            key={variant.id}
                            className={cn(styles.variantCard, {
                              [styles.selected]: isSelected
                            })}
                            onClick={() => handleVariantToggle(variant)}
                          >
                            <div className={styles.variantInfo}>
                              <Checkbox
                                className={styles.variantCheckbox}
                                value={isSelected}
                                onChange={() => handleVariantToggle(variant)}
                              />
                              <div className={styles.variantDetails}>
                                <div className={styles.variantName}>
                                  {variant.name}
                                </div>
                                {variant.color && (
                                  <div className={styles.variantMeta}>
                                    Color: {variant.color}
                                  </div>
                                )}
                                {variant.size && (
                                  <div className={styles.variantMeta}>
                                    Size: {variant.size}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className={styles.variantPrice}>
                              ${formatPrice(variant.price)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Card>

      <Modal
        visible={showBrowser}
        onClose={() => setShowBrowser(false)}
        outerClassName={styles.modal}
      >
        <PrintfulBrowser
          onSelectProduct={handleSelectProduct}
          className={styles.browser}
        />
      </Modal>
    </>
  );
};

export default PrintfulProduct;
