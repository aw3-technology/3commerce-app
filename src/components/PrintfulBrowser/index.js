import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./PrintfulBrowser.module.sass";
import { getProducts, getProduct } from "../../services/printfulService";
import Card from "../Card";

const PrintfulBrowser = ({ onSelectProduct, className }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: apiError } = await getProducts();

      if (apiError) {
        setError(apiError.message || "Failed to load Printful products");
      } else {
        // Printful returns products as an array
        setProducts(data || []);
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = async (product) => {
    // Fetch full product details including variants
    const { data, error } = await getProduct(product.id);

    if (error) {
      alert("Failed to load product details: " + error.message);
      return;
    }

    // Call parent callback with full product data
    if (onSelectProduct) {
      onSelectProduct({
        id: product.id,
        name: product.title || product.model_name,
        description: product.description || "",
        image: product.image,
        product: data.product,
        variants: data.variants || []
      });
    }
  };

  // Get unique categories from products
  const categories = ["all", ...new Set(products.map(p => p.type).filter(Boolean))];

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "all" || product.type === selectedCategory;
    const matchesSearch = !searchTerm ||
      (product.title || product.model_name || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className={cn(styles.browser, className)}>
        <div className={styles.loading}>Loading Printful products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(styles.browser, className)}>
        <div className={styles.error}>
          {error}
          <button
            className={cn("button-small", styles.retryButton)}
            onClick={loadProducts}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(styles.browser, className)}>
      <div className={styles.header}>
        <h3 className={styles.title}>Browse Printful Products</h3>
        <p className={styles.subtitle}>
          Select a product from Printful's catalog to create a print-on-demand item
        </p>
      </div>

      <div className={styles.filters}>
        <div className={styles.search}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.categories}>
          {categories.slice(0, 10).map(category => (
            <button
              key={category}
              className={cn(styles.categoryButton, {
                [styles.active]: selectedCategory === category
              })}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.productGrid}>
        {filteredProducts.length === 0 ? (
          <div className={styles.empty}>
            No products found. Try adjusting your filters.
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product.id}
              className={styles.productCard}
              onClick={() => handleProductClick(product)}
            >
              <div className={styles.productImage}>
                {product.image ? (
                  <img src={product.image} alt={product.title || product.model_name} />
                ) : (
                  <div className={styles.noImage}>No Image</div>
                )}
              </div>
              <div className={styles.productInfo}>
                <h4 className={styles.productName}>
                  {product.title || product.model_name}
                </h4>
                {product.type && (
                  <div className={styles.productType}>{product.type}</div>
                )}
                {product.brand && (
                  <div className={styles.productBrand}>{product.brand}</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className={styles.footer}>
        <p className={styles.footerText}>
          Showing {filteredProducts.length} of {products.length} products
        </p>
      </div>
    </div>
  );
};

export default PrintfulBrowser;
