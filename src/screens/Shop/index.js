import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./Shop.module.sass";
import Profile from "./Profile";
import Settings from "./Settings";
import Card from "../../components/Card";
import Dropdown from "../../components/Dropdown";
import Filters from "../../components/Filters";
import Product from "../../components/Product";
import Follower from "./Follower";
import Loader from "../../components/Loader";
import { getAllProducts } from "../../services/productService";
import { getAllCustomers } from "../../services/customerService";
import { getAllComments } from "../../services/commentService";

const navigation = ["Products", "Followers", "Following"];
const intervals = ["Most recent", "Most new", "Most popular"];

const Shop = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [sorting, setSorting] = useState(intervals[0]);
  const [products, setProducts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    fetchData();
  }, [activeIndex, sorting]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setPage(1);

    try {
      if (activeIndex === 0) {
        await fetchProducts(1);
      } else {
        await fetchCustomers(1);
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (pageNum) => {
    try {
      let orderBy = 'created_at';
      let ascending = false;

      if (sorting === "Most new") {
        orderBy = 'created_at';
        ascending = false;
      } else if (sorting === "Most popular") {
        orderBy = 'sales_count';
        ascending = false;
      }

      const { data, error } = await getAllProducts({
        status: 'published',
        limit: ITEMS_PER_PAGE,
        offset: (pageNum - 1) * ITEMS_PER_PAGE,
      });

      if (error) {
        setError(error.message || "Failed to fetch products");
        console.error("Error fetching products:", error);
      } else {
        // Fetch comments/ratings for all products
        const { data: commentsData } = await getAllComments({ limit: 1000 });

        // Calculate ratings for each product
        const productRatings = {};
        if (commentsData) {
          commentsData.forEach(comment => {
            if (comment.product_id && comment.rating) {
              if (!productRatings[comment.product_id]) {
                productRatings[comment.product_id] = {
                  total: 0,
                  count: 0
                };
              }
              productRatings[comment.product_id].total += comment.rating;
              productRatings[comment.product_id].count += 1;
            }
          });
        }

        const transformedData = data?.map((product) => {
          const rating = productRatings[product.id];
          const avgRating = rating ? (rating.total / rating.count).toFixed(1) : null;
          const ratingCount = rating ? rating.count : 0;

          return {
            id: product.id,
            product: product.name,
            category: product.category || "UI design kit",
            image: product.image_url || "/images/content/product-pic-1.jpg",
            image2x: product.image_url || "/images/content/product-pic-1@2x.jpg",
            status: product.status === "published",
            price: product.price,
            sales: product.sales_count || 0,
            balance: 0,
            views: 0,
            viewsPercent: 0,
            likesPercent: 0,
            likes: 0,
            rating: avgRating,
            ratingCount: ratingCount,
          };
        }) || [];

        if (pageNum === 1) {
          setProducts(transformedData);
        } else {
          setProducts(prev => [...prev, ...transformedData]);
        }

        setHasMore(transformedData.length === ITEMS_PER_PAGE);
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
      console.error("Error fetching products:", err);
    }
  };

  const fetchCustomers = async (pageNum) => {
    try {
      const { data, error } = await getAllCustomers({
        limit: ITEMS_PER_PAGE,
        offset: (pageNum - 1) * ITEMS_PER_PAGE,
      });

      if (error) {
        setError(error.message || "Failed to fetch customers");
        console.error("Error fetching customers:", error);
      } else {
        const transformedData = data?.map((customer) => ({
          id: customer.id,
          name: customer.name || "Unknown User",
          avatar: customer.avatar_url || "/images/content/avatar.jpg",
          code: customer.email || "",
          category: "Customer",
          products: customer.order_count || 0,
        })) || [];

        if (pageNum === 1) {
          if (activeIndex === 1) {
            setFollowers(transformedData);
          } else {
            setFollowing(transformedData);
          }
        } else {
          if (activeIndex === 1) {
            setFollowers(prev => [...prev, ...transformedData]);
          } else {
            setFollowing(prev => [...prev, ...transformedData]);
          }
        }

        setHasMore(transformedData.length === ITEMS_PER_PAGE);
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
      console.error("Error fetching customers:", err);
    }
  };

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setPage(nextPage);

    if (activeIndex === 0) {
      await fetchProducts(nextPage);
    } else {
      await fetchCustomers(nextPage);
    }
  };

  return (
    <>
      <div className={styles.shop}>
        <div className={styles.background}>
          <img src="/images/content/bg-shop.jpg" alt="Background" />
        </div>
        <Card className={styles.card}>
          <Profile />
          <div className={styles.control}>
            <div className={styles.nav}>
              {navigation.map((x, index) => (
                <button
                  className={cn(styles.link, {
                    [styles.active]: index === activeIndex,
                  })}
                  onClick={() => setActiveIndex(index)}
                  key={index}
                >
                  {x}
                </button>
              ))}
            </div>
            <div className={styles.dropdownBox}>
              <Dropdown
                className={styles.dropdown}
                classDropdownHead={styles.dropdownHead}
                value={sorting}
                setValue={setSorting}
                options={intervals}
                small
              />
            </div>
            <Filters
              className={styles.filters}
              title={`Showing ${
                activeIndex === 0
                  ? products.length
                  : activeIndex === 1
                    ? followers.length
                    : following.length
              } ${activeIndex === 0 ? 'products' : 'users'}`}
            >
              <Settings />
            </Filters>
          </div>
          <div className={styles.wrap}>
            {loading && (
              <div className={styles.loading}>
                <Loader />
                <p>Loading...</p>
              </div>
            )}
            {error && (
              <div className={styles.error}>
                <p>Error: {error}</p>
                <button onClick={fetchData} className="button-stroke button-small">
                  Retry
                </button>
              </div>
            )}
            {!loading && !error && (
              <>
                {activeIndex === 0 && (
                  <>
                    <div className={styles.products}>
                      {products.length > 0 ? (
                        products.map((x, index) => (
                          <Product
                            className={styles.product}
                            item={x}
                            key={index}
                            withoutСheckbox
                          />
                        ))
                      ) : (
                        <div className={styles.empty}>
                          <p>No products available</p>
                        </div>
                      )}
                    </div>
                    {products.length > 0 && hasMore && (
                      <div className={styles.foot}>
                        <button
                          className={cn("button-stroke button-small", styles.button)}
                          onClick={handleLoadMore}
                        >
                          Load more
                        </button>
                      </div>
                    )}
                  </>
                )}
                {activeIndex === 1 && (
                  <>
                    <div className={styles.followers}>
                      {followers.length > 0 ? (
                        followers.map((x, index) => (
                          <Follower
                            className={styles.follower}
                            item={x}
                            key={index}
                            followers
                          />
                        ))
                      ) : (
                        <div className={styles.empty}>
                          <p>No followers yet</p>
                        </div>
                      )}
                    </div>
                    {followers.length > 0 && hasMore && (
                      <div className={styles.foot}>
                        <button
                          className={cn("button-stroke button-small", styles.button)}
                          onClick={handleLoadMore}
                        >
                          Load more
                        </button>
                      </div>
                    )}
                  </>
                )}
                {activeIndex === 2 && (
                  <>
                    <div className={styles.followers}>
                      {following.length > 0 ? (
                        following.map((x, index) => (
                          <Follower
                            className={styles.follower}
                            item={x}
                            key={index}
                          />
                        ))
                      ) : (
                        <div className={styles.empty}>
                          <p>Not following anyone yet</p>
                        </div>
                      )}
                    </div>
                    {following.length > 0 && hasMore && (
                      <div className={styles.foot}>
                        <button
                          className={cn("button-stroke button-small", styles.button)}
                          onClick={handleLoadMore}
                        >
                          Load more
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </Card>
      </div>
    </>
  );
};

export default Shop;
