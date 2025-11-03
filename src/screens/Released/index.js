import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import cn from "classnames";
import styles from "./Released.module.sass";
import Card from "../../components/Card";
import Form from "../../components/Form";
import Icon from "../../components/Icon";
import Market from "./Market";
import Product from "../../components/Product";
import Loader from "../../components/Loader";
import Panel from "./Panel";
import { getProductsByStatus, searchProducts, deleteProduct, updateProduct } from "../../services/productService";

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
          sales: product.sales_count || 0,
          balance: (product.sales_count || 0) * (product.price || 0) * 0.15, // 15% profit margin example
          views: product.view_count || 0,
          viewsPercent: `${Math.min(((product.view_count || 0) / 10000) * 100, 100)}%`,
          likesPercent: `${Math.min(((product.likes_count || 0) / 1000) * 100, 100)}%`,
          likes: product.likes_count || 0,
          ratingValue: product.average_rating || null,
          ratingCounter: product.rating_count || 0,
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
          sales: product.sales_count || 0,
          balance: (product.sales_count || 0) * (product.price || 0) * 0.15,
          views: product.view_count || 0,
          viewsPercent: `${Math.min(((product.view_count || 0) / 10000) * 100, 100)}%`,
          likesPercent: `${Math.min(((product.likes_count || 0) / 1000) * 100, 100)}%`,
          likes: product.likes_count || 0,
          ratingValue: product.average_rating || null,
          ratingCounter: product.rating_count || 0,
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

  const handleDelete = async () => {
    if (selectedFilters.length === 0 || !window.confirm(`Are you sure you want to delete ${selectedFilters.length} ${selectedFilters.length === 1 ? 'product' : 'products'}?`)) {
      return;
    }

    setLoading(true);
    try {
      // Delete all selected products
      await Promise.all(selectedFilters.map(id => deleteProduct(id)));

      // Clear selection
      setSelectedFilters([]);

      // Refresh the product list
      await fetchPublishedProducts();
    } catch (err) {
      setError(err.message || "Failed to delete products");
      console.error("Error deleting products:", err);
      setLoading(false);
    }
  };

  const handleUnpublish = async () => {
    if (selectedFilters.length === 0) {
      return;
    }

    setLoading(true);
    try {
      // Update status to 'draft' for all selected products
      await Promise.all(
        selectedFilters.map(id => updateProduct(id, { status: 'draft' }))
      );

      // Clear selection
      setSelectedFilters([]);

      // Refresh the product list
      await fetchPublishedProducts();
    } catch (err) {
      setError(err.message || "Failed to unpublish products");
      console.error("Error unpublishing products:", err);
      setLoading(false);
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
                  {products.length > 0 ? (
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
                  ) : (
                    <div className={styles.empty}>
                      <p>No published products yet</p>
                      <div style={{ fontSize: "14px", marginTop: "8px" }}>
                        Start by <Link to="/products/add">creating your first product</Link>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </Card>
      <Panel
        selectedCount={selectedFilters.length}
        onDelete={handleDelete}
        onUnpublish={handleUnpublish}
        visible={activeIndex === 1}
      />
    </>
  );
};

export default Released;
