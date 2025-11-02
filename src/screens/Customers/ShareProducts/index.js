import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./ShareProducts.module.sass";
import { Link } from "react-router-dom";
import Card from "../../../components/Card";
import Icon from "../../../components/Icon";
import Product from "../../../components/Product";
import Loader from "../../../components/Loader";

// services
import { getAllProducts } from "../../../services/productService";

const socials = [
  {
    title: "Facebook",
    icon: "facebook",
    url: "https://www.facebook.com/ui8.net/",
  },
  {
    title: "Twitter",
    icon: "twitter",
    url: "https://twitter.com/ui8",
  },
  {
    title: "Instagram",
    icon: "instagram",
    url: "https://www.instagram.com/ui8net/",
  },
];

const ShareProducts = ({ className }) => {
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await getAllProducts({ limit: 2, status: 'published' });
      if (error) {
        setError(error.message || "Failed to fetch products");
        console.error("Error fetching products:", error);
      } else {
        // Transform backend data to match the expected format
        const transformedData = data?.map((product) => ({
          id: product.id,
          product: product.name,
          link: `/products/${product.id}`,
          image: product.image_url || "/images/content/product-pic-1.jpg",
          image2x: product.image_url || "/images/content/product-pic-1@2x.jpg",
          price: product.price,
          date: new Date(product.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }),
          ratingValue: 4.8,
          ratingCounter: 87,
        })) || [];
        setProducts(transformedData);
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (id) => {
    if (selectedFilters.includes(id)) {
      setSelectedFilters(selectedFilters.filter((x) => x !== id));
    } else {
      setSelectedFilters((selectedFilters) => [...selectedFilters, id]);
    }
  };

  return (
    <Card
      className={cn(styles.card, className)}
      title="Share your products"
      classTitle={cn("title-blue", styles.cardTitle)}
      classCardHead={styles.cardHead}
      head={
        <Link
          className={cn("button-stroke button-small", styles.button)}
          to="/promote"
        >
          <span>Go to promote</span>
          <Icon name="promotion" size="24" />
        </Link>
      }
    >
      <div className={styles.section}>
        {loading && (
          <div className={styles.loading}>
            <Loader />
            <p>Loading products...</p>
          </div>
        )}
        {error && (
          <div className={styles.error}>
            <p>Error: {error}</p>
            <button onClick={fetchProducts} className="button-stroke button-small">
              Retry
            </button>
          </div>
        )}
        {!loading && !error && (
          <>
            <div className={styles.list}>
              {products.map((x, index) => (
                <Product
                  className={styles.product}
                  value={selectedFilters.includes(x.id)}
                  onChange={() => handleChange(x.id)}
                  item={x}
                  key={index}
                  released
                  withoutСheckbox
                />
              ))}
            </div>
            {products.length === 0 && (
              <div className={styles.empty}>
                <p>No products available to share</p>
              </div>
            )}
            <div className={styles.info}>
              50% of new customers explore products because the author sharing the
              work on the social media network. Gain your earnings right now!{" "}
              <span role="img" aria-label="fire">
                🔥
              </span>
            </div>
            <div className={styles.btns}>
              {socials.map((x, index) => (
                <a
                  className={cn("button-stroke", styles.button)}
                  href={x.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={index}
                >
                  <Icon name={x.icon} size="24" />
                  <span>{x.title}</span>
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export default ShareProducts;
