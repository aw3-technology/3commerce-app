import React, { useState, useEffect } from "react";
import cn from "classnames";
import { useNavigate } from "react-router-dom";
import styles from "./Search.module.sass";
import Icon from "../../Icon";
import Item from "./Item";
import Suggestion from "./Suggestion";
import ModalProduct from "../../../components/ModalProduct";
import {
  globalSearch,
  getSearchSuggestions,
  getRecentSearches,
  saveRecentSearch,
} from "../../../services/searchService";

const Search = ({ className }) => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [visibleModalProduct, setVisibleModalProduct] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Load recent searches on mount
  useEffect(() => {
    const recent = getRecentSearches(5);
    setRecentSearches(recent.map(r => r.result));
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.length >= 2) {
        performSearch(searchQuery);
        fetchSuggestions(searchQuery);
      } else {
        setSearchResults([]);
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const performSearch = async (query) => {
    setLoading(true);
    try {
      const { data, error } = await globalSearch(query, { limit: 5 });
      if (!error && data) {
        // Combine all results into a single array
        const allResults = [
          ...data.products,
          ...data.customers,
          ...data.orders,
        ];
        setSearchResults(allResults);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async (query) => {
    try {
      const { data } = await getSearchSuggestions(query, 5);
      if (data) {
        setSuggestions(data);
      }
    } catch (error) {
      console.error("Suggestions error:", error);
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setVisible(true);
  };

  const handleResultClick = (item) => {
    // Save to recent searches
    saveRecentSearch(searchQuery, item);

    // Navigate or show modal based on type
    if (item.type === 'product') {
      setSelectedProduct(item);
      setVisibleModalProduct(true);
    } else if (item.url) {
      navigate(item.url);
      setVisible(false);
      setSearchQuery("");
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.query);
  };

  const handleClose = () => {
    setVisible(false);
    setSearchQuery("");
    setSearchResults([]);
    setSuggestions([]);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setVisible(true);
        document.querySelector(`.${styles.input}`)?.focus();
      }
      if (e.key === 'Escape' && visible) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [visible]);

  const displayResults = searchQuery.length >= 2 ? searchResults : recentSearches;
  const resultTitle = searchQuery.length >= 2 ? "Search results" : "Recent search";

  return (
    <>
      <div
        className={cn(styles.search, className, { [styles.active]: visible })}
      >
        <div className={styles.head}>
          <button className={styles.start}>
            <Icon name="search" size="24" />
          </button>
          <button className={styles.direction}>
            <Icon name="arrow-left" size="24" />
          </button>
          <input
            className={styles.input}
            type="text"
            placeholder="Search products, customers, orders..."
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => setVisible(true)}
          />
          <button className={styles.result}>⌘ F</button>
          <button className={styles.close} onClick={handleClose}>
            <Icon name="close-circle" size="24" />
          </button>
        </div>
        <div className={styles.body}>
          {loading ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#6F767E" }}>
              Searching...
            </div>
          ) : (
            <>
              {displayResults.length > 0 && (
                <div className={styles.box}>
                  <div className={styles.category}>{resultTitle}</div>
                  <div className={styles.list}>
                    {displayResults.map((x, index) => (
                      <Item
                        className={styles.item}
                        item={x}
                        key={`${x.type}-${x.id}-${index}`}
                        onClick={() => handleResultClick(x)}
                      />
                    ))}
                  </div>
                </div>
              )}
              {suggestions.length > 0 && (
                <div className={styles.box}>
                  <div className={styles.category}>Suggestions</div>
                  <div className={styles.list}>
                    {suggestions.map((x, index) => (
                      <Suggestion
                        className={styles.item}
                        item={x}
                        key={index}
                        onClick={() => handleSuggestionClick(x)}
                      />
                    ))}
                  </div>
                </div>
              )}
              {searchQuery.length >= 2 && !loading && displayResults.length === 0 && (
                <div style={{ padding: "40px", textAlign: "center", color: "#6F767E" }}>
                  <div style={{ fontSize: "16px", fontWeight: "600", marginBottom: "8px" }}>
                    No results found
                  </div>
                  <div style={{ fontSize: "14px" }}>
                    Try searching with different keywords
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <ModalProduct
        visible={visibleModalProduct}
        onClose={() => {
          setVisibleModalProduct(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />
    </>
  );
};

export default Search;
