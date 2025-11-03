import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./Drafts.module.sass";
import Card from "../../components/Card";
import Form from "../../components/Form";
import Icon from "../../components/Icon";
import Table from "../../components/Table";
import Product from "../../components/Product";
import Loader from "../../components/Loader";
import Panel from "./Panel";
import { getProductsByStatus, searchProducts, updateProduct, deleteProduct } from "../../services/productService";

const sorting = ["list", "grid"];

const Drafts = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDraftProducts();
  }, []);

  const fetchDraftProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await getProductsByStatus('draft');
      if (error) {
        setError(error.message || "Failed to fetch draft products");
        console.error("Error fetching drafts:", error);
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
      console.error("Error fetching drafts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!search.trim()) {
      fetchDraftProducts();
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
        const draftProducts = data?.filter(p => p.status === 'draft') || [];
        const transformedData = draftProducts.map((product) => ({
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

  const handlePublish = async () => {
    if (selectedFilters.length === 0) return;

    try {
      const updatePromises = selectedFilters.map(productId =>
        updateProduct(productId, {
          status: 'published',
          published_at: new Date().toISOString()
        })
      );

      await Promise.all(updatePromises);
      alert(`Successfully published ${selectedFilters.length} product(s)`);

      // Clear selection and refresh
      setSelectedFilters([]);
      fetchDraftProducts();
    } catch (error) {
      console.error('Error publishing products:', error);
      alert('Failed to publish products. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (selectedFilters.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedFilters.length} product(s)? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const deletePromises = selectedFilters.map(productId =>
        deleteProduct(productId)
      );

      await Promise.all(deletePromises);
      alert(`Successfully deleted ${selectedFilters.length} product(s)`);

      // Clear selection and refresh
      setSelectedFilters([]);
      fetchDraftProducts();
    } catch (error) {
      console.error('Error deleting products:', error);
      alert('Failed to delete products. Please try again.');
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
              <p>Loading draft products...</p>
            </div>
          )}
          {error && (
            <div className={styles.error}>
              <p>Error: {error}</p>
              <button onClick={fetchDraftProducts} className="button-stroke button-small">
                Retry
              </button>
            </div>
          )}
          {!loading && !error && (
            <>
              {activeIndex === 0 && (
                <Table
                  items={products}
                  title="Last edited"
                  selectedProducts={selectedFilters}
                  onSelectProducts={setSelectedFilters}
                />
              )}
              {activeIndex === 1 && (
                <>
                  {products.length === 0 ? (
                    <div className={styles.empty}>
                      <p>No draft products found</p>
                    </div>
                  ) : (
                    <div className={styles.list}>
                      {products.map((x, index) => (
                        <Product
                          className={styles.product}
                          value={selectedFilters.includes(x.id)}
                          onChange={() => handleChange(x.id)}
                          item={x}
                          key={index}
                          released
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </Card>
      {selectedFilters.length > 0 && (
        <Panel
          selectedCount={selectedFilters.length}
          onPublish={handlePublish}
          onDelete={handleDelete}
        />
      )}
    </>
  );
};

export default Drafts;
