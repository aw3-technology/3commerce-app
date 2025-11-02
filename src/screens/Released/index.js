import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./Released.module.sass";
import Card from "../../components/Card";
import Form from "../../components/Form";
import Icon from "../../components/Icon";
import Market from "./Market";
import Product from "../../components/Product";
import Loader from "../../components/Loader";
import Panel from "./Panel";
import { getProductsByStatus, searchProducts } from "../../services/productService";

const sorting = ["list", "grid"];

const Released = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPublishedProducts();
  }, []);

  const fetchPublishedProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await getProductsByStatus('published');
      if (error) {
        setError(error.message || "Failed to fetch published products");
        console.error("Error fetching released products:", error);
      } else {
        const transformedData = data?.map((product) => ({
          id: product.id,
          product: product.name,
          category: product.category || "UI design kit",
          image: product.image_url || "/images/content/product-pic-1.jpg",
          image2x: product.image_url || "/images/content/product-pic-1@2x.jpg",
          status: product.status === "published",
          price: product.price,
          sales: product.stock_quantity || 0,
          balance: 0,
          views: 0,
          viewsPercent: 0,
          likesPercent: 0,
          likes: 0,
        })) || [];
        setProducts(transformedData);
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
      console.error("Error fetching released products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!search.trim()) {
      fetchPublishedProducts();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error } = await searchProducts(search);
      if (error) {
        setError(error.message || "Search failed");
        console.error("Error searching products:", error);
      } else {
        const publishedProducts = data?.filter(p => p.status === 'published') || [];
        const transformedData = publishedProducts.map((product) => ({
          id: product.id,
          product: product.name,
          category: product.category || "UI design kit",
          image: product.image_url || "/images/content/product-pic-1.jpg",
          image2x: product.image_url || "/images/content/product-pic-1@2x.jpg",
          status: product.status === "published",
          price: product.price,
          sales: product.stock_quantity || 0,
          balance: 0,
          views: 0,
          viewsPercent: 0,
          likesPercent: 0,
          likes: 0,
        }));
        setProducts(transformedData);
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
      console.error("Error searching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const [selectedFilters, setSelectedFilters] = useState([]);

  const handleChange = (id) => {
    if (selectedFilters.includes(id)) {
      setSelectedFilters(selectedFilters.filter((x) => x !== id));
    } else {
      setSelectedFilters((selectedFilters) => [...selectedFilters, id]);
    }
  };

  return (
    <>
      <Card
        className={styles.card}
        classCardHead={styles.head}
        title="Products"
        classTitle={cn("title-purple", styles.title)}
        head={
          <>
            <Form
              className={styles.form}
              value={search}
              setValue={setSearch}
              onSubmit={() => handleSubmit()}
              placeholder="Search product"
              type="text"
              name="search"
              icon="search"
            />
            <div className={styles.sorting}>
              {sorting.map((x, index) => (
                <button
                  className={cn(styles.link, {
                    [styles.active]: index === activeIndex,
                  })}
                  onClick={() => setActiveIndex(index)}
                  key={index}
                >
                  <Icon name={x} size="24" />
                </button>
              ))}
            </div>
          </>
        }
      >
        <div className={styles.wrapper}>
          {loading && (
            <div className={styles.loading}>
              <Loader />
              <p>Loading published products...</p>
            </div>
          )}
          {error && (
            <div className={styles.error}>
              <p>Error: {error}</p>
              <button onClick={fetchPublishedProducts} className="button-stroke button-small">
                Retry
              </button>
            </div>
          )}
          {!loading && !error && (
            <>
              {activeIndex === 0 && <Market items={products} />}
              {activeIndex === 1 && (
                <>
                  <div className={styles.list}>
                    {products.map((x, index) => (
                      <Product
                        className={styles.product}
                        value={selectedFilters.includes(x.id)}
                        onChange={() => handleChange(x.id)}
                        item={x}
                        key={index}
                      />
                    ))}
                  </div>
                  {products.length === 0 && (
                    <div className={styles.empty}>
                      <p>No published products found</p>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </Card>
      <Panel />
    </>
  );
};

export default Released;
