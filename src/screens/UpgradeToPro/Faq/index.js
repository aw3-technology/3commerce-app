import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./Faq.module.sass";
import Item from "./Item";
import Dropdown from "../../../components/Dropdown";
import { getAllFaqs, incrementFaqViewCount, markFaqHelpful } from "../../../services/helpService";

const Faq = () => {
  const [items, setItems] = useState([]);
  const [options, setOptions] = useState([]);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setLoading(true);
    const { data, error: faqError } = await getAllFaqs();

    if (faqError) {
      setError("Failed to load FAQs");
      setLoading(false);
      return;
    }

    if (data && data.length > 0) {
      setItems(data);
      const categoryOptions = data.map((x) => x.title);
      setOptions(categoryOptions);
      setCategory(categoryOptions[0]);
    }

    setLoading(false);
  };

  const handleItemView = async (itemId) => {
    // Track FAQ view in background
    await incrementFaqViewCount(itemId);
  };

  const handleItemHelpful = async (itemId, isHelpful) => {
    // Mark FAQ as helpful/not helpful
    await markFaqHelpful(itemId, isHelpful);
  };

  if (loading) {
    return (
      <div className={styles.faq}>
        <h2 className={cn("h3", styles.title)}>Frequently asked questions</h2>
        <div className={styles.loading}>Loading FAQs...</div>
      </div>
    );
  }

  if (error || items.length === 0) {
    return (
      <div className={styles.faq}>
        <h2 className={cn("h3", styles.title)}>Frequently asked questions</h2>
        <div className={styles.error}>
          {error || "No FAQs available at the moment"}
        </div>
      </div>
    );
  }

  const currentCategory = items.find((x) => x.title === category);

  return (
    <div className={styles.faq}>
      <h2 className={cn("h3", styles.title)}>Frequently asked questions</h2>
      <div className={styles.container}>
        <div className={styles.sidebar}>
          <div className={styles.menu}>
            {items.map((x, index) => (
              <button
                className={cn(styles.button, {
                  [styles.active]: x.title === category,
                })}
                onClick={() => setCategory(x.title)}
                key={index}
              >
                {x.title}
              </button>
            ))}
          </div>
          <Dropdown
            className={styles.dropdown}
            classDropdownHead={styles.dropdownHead}
            value={category}
            setValue={setCategory}
            options={options}
          />
        </div>
        <div className={styles.list}>
          {currentCategory?.items?.map((x, index) => (
            <div key={index} onClick={() => handleItemView(x.id)}>
              <Item
                className={styles.item}
                item={x}
                onHelpful={(isHelpful) => handleItemHelpful(x.id, isHelpful)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Faq;
