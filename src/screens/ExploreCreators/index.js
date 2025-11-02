import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./ExploreCreators.module.sass";
import Dropdown from "../../components/Dropdown";
import Loader from "../../components/Loader";
import Creator from "./Creator";
import {
  getPopularCreators,
  getTrendingCreators,
  getBestSellingCreators,
  getNewestCreators,
  getCreatorCount,
} from "../../services/creatorService";

const navigation = ["Popular", "Trending"];
const options = ["Best sellers", "New sellers"];

const ExploreCreators = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [sorting, setSorting] = useState(options[0]);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const LIMIT = 5;

  // Fetch creators when navigation or sorting changes
  useEffect(() => {
    fetchCreators(true);
  }, [activeIndex, sorting]);

  // Fetch total creator count on mount
  useEffect(() => {
    fetchTotalCount();
  }, []);

  const fetchTotalCount = async () => {
    const { data, error } = await getCreatorCount();
    if (!error && data) {
      setTotalCount(data.count || 0);
    }
  };

  const fetchCreators = async (reset = false) => {
    setLoading(true);
    const currentOffset = reset ? 0 : offset;

    try {
      let result;
      const fetchOptions = { limit: LIMIT, offset: currentOffset };

      // Determine which service to call based on navigation and sorting
      if (activeIndex === 0) {
        // Popular
        if (sorting === "Best sellers") {
          result = await getBestSellingCreators(fetchOptions);
        } else {
          // New sellers
          result = await getNewestCreators(fetchOptions);
        }
      } else {
        // Trending
        result = await getTrendingCreators(fetchOptions);
      }

      if (!result.error) {
        const newCreators = result.data || [];

        // Transform data to match expected format
        const transformedCreators = newCreators.map((creator) => ({
          id: creator.id,
          creator: creator.name,
          avatar: creator.avatar_url,
          colorNumber: creator.color_number,
          productsCounter: creator.product_count,
          followers: creator.followers,
          products: (creator.products || []).map((product) => ({
            id: product.id,
            image: product.image_url,
            image2x: product.image_url,
            name: product.name,
            price: product.price,
          })),
        }));

        if (reset) {
          setCreators(transformedCreators);
          setOffset(LIMIT);
        } else {
          setCreators([...creators, ...transformedCreators]);
          setOffset(currentOffset + LIMIT);
        }

        // Check if there are more creators to load
        setHasMore(newCreators.length === LIMIT);
      }
    } catch (error) {
      console.error("Error fetching creators:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchCreators(false);
    }
  };

  return (
    <div className={styles.creators}>
      <div className={styles.head}>
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
        <Dropdown
          className={styles.dropdown}
          classDropdownHead={styles.dropdownHead}
          value={sorting}
          setValue={setSorting}
          options={options}
          small
        />
      </div>
      <div className={styles.info}>
        Viewing {creators.length} of {totalCount.toLocaleString()}+ creators in
        the market
      </div>
      <div className={styles.list}>
        {creators.map((x, index) => (
          <Creator
            className={styles.creator}
            item={x}
            index={index}
            key={x.id}
          />
        ))}
      </div>
      {loading && creators.length === 0 && (
        <div className={styles.loadingContainer}>
          <Loader />
        </div>
      )}
      {creators.length === 0 && !loading && (
        <div className={styles.empty}>No creators found</div>
      )}
      <div className={styles.foot}>
        <button
          className={cn("button-stroke button-small", styles.button)}
          onClick={handleLoadMore}
          disabled={loading || !hasMore}
        >
          {loading && <Loader className={styles.loader} />}
          <span>{hasMore ? "Load more" : "No more creators"}</span>
        </button>
      </div>
    </div>
  );
};

export default ExploreCreators;
