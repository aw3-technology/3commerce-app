import React, { useState, useEffect } from "react";
import styles from "./Products.module.sass";
import cn from "classnames";
import Card from "../../../components/Card";
import Form from "../../../components/Form";
import Dropdown from "../../../components/Dropdown";
import Market from "./Market";
import Table from "./Table";

// data
import { traffic } from "../../../mocks/traffic";
import { viewers } from "../../../mocks/viewers";

// services
import { getAllProducts, searchProducts } from "../../../services/productService";

const indicatorsTraffic = [
  {
    title: "Market",
    color: "#FFBC99",
  },
  {
    title: "Social media",
    color: "#CABDFF",
  },
  {
    title: "Direct",
    color: "#B5E4CA",
  },
  {
    title: "UI8",
    color: "#B1E5FC",
  },
  {
    title: "Others",
    color: "#FFD88D",
  },
];

const indicatorsViewers = [
  {
    title: "Followers",
    color: "#B5E4CA",
  },
  {
    title: "Others",
    color: "#CABDFF",
  },
];

const Products = () => {
  const navigation = ["Market", "Traffic sources", "Viewers"];

  const [activeTab, setActiveTab] = useState(navigation[0]);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from backend
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await getAllProducts();
      if (error) {
        setError(error.message || "Failed to fetch products");
        console.error("Error fetching products:", error);
      } else {
        // Transform backend data to match the expected format
        const transformedData = data.map((product) => ({
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
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!search.trim()) {
      fetchProducts();
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
        // Transform backend data to match the expected format
        const transformedData = data.map((product) => ({
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

  return (
    <Card
      className={styles.card}
      title="Products"
      classTitle={cn("title-purple", styles.title)}
      classCardHead={styles.head}
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
          <div className={styles.control}>
            <button className={cn("button-stroke button-small", styles.button)}>
              Deleted
            </button>
            <button className={cn("button-stroke button-small", styles.button)}>
              Set status
            </button>
            <div className={styles.counter}>3 selected</div>
          </div>
          <div className={cn(styles.nav, "tablet-hide")}>
            {navigation.map((x, index) => (
              <button
                className={cn(styles.link, {
                  [styles.active]: x === activeTab,
                })}
                onClick={() => setActiveTab(x)}
                key={index}
              >
                {x}
              </button>
            ))}
          </div>
          <div className={cn(styles.dropdown, "tablet-show")}>
            <Dropdown
              classDropdownHead={styles.dropdownHead}
              value={activeTab}
              setValue={setActiveTab}
              options={navigation}
              small
            />
          </div>
        </>
      }
    >
      <div className={styles.products}>
        {loading && (
          <div className={styles.loading}>
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
          <div className={styles.wrapper}>
            {activeTab === navigation[0] && <Market items={products} />}
            {activeTab === navigation[1] && (
              <Table
                title="Traffic source"
                items={traffic}
                legend={indicatorsTraffic}
              />
            )}
            {activeTab === navigation[2] && (
              <Table title="Viewers" items={viewers} legend={indicatorsViewers} />
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default Products;
