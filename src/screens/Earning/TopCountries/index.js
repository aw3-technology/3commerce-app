import React, { useState, useEffect } from "react";
import styles from "./TopCountries.module.sass";
import cn from "classnames";
import Card from "../../../components/Card";
import { getAllOrders } from "../../../services/orderService";

// Country code to flag emoji mapping
const countryFlags = {
  "United States": "🇺🇸",
  "Germany": "🇩🇪",
  "Netherlands": "🇳🇱",
  "United Kingdom": "🇬🇧",
  "Italy": "🇮🇹",
  "Vietnam": "🇻🇳",
  "Canada": "🇨🇦",
  "France": "🇫🇷",
  "Spain": "🇪🇸",
  "Australia": "🇦🇺",
  "Brazil": "🇧🇷",
  "India": "🇮🇳",
  "Japan": "🇯🇵",
  "China": "🇨🇳",
  "Mexico": "🇲🇽",
};

const TopCountries = ({ className }) => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCountryEarnings();
  }, []);

  const fetchCountryEarnings = async () => {
    setLoading(true);

    const { data, error } = await getAllOrders({ limit: 1000 });

    if (!error && data) {
      // Group earnings by country
      const countryStats = {};

      data.forEach(order => {
        if (order.customers?.country && order.status === 'completed') {
          const country = order.customers.country;

          if (!countryStats[country]) {
            countryStats[country] = {
              title: country,
              flag: countryFlags[country] || "🌍",
              price: 0,
            };
          }

          countryStats[country].price += order.total_amount || 0;
        }
      });

      // Convert to array, sort by price, and take top 6
      const sortedCountries = Object.values(countryStats)
        .sort((a, b) => b.price - a.price)
        .slice(0, 6);

      setCountries(sortedCountries);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <Card
        className={cn(styles.card, className)}
        title="Top countries"
        classTitle="title-blue"
      >
        <div className={styles.countries}>
          <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(styles.card, className)}
      title="Top countries"
      classTitle="title-blue"
    >
      <div className={styles.countries}>
        {countries.length > 0 ? (
          countries.map((x, index) => (
            <div className={styles.item} key={index}>
              <div className={styles.flag}>
                <span role="img" aria-label={x.title}>
                  {x.flag}
                </span>
              </div>
              <div className={styles.title}>{x.title}</div>
              <div className={styles.price}>${x.price.toFixed(2)}</div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            No country data available
          </div>
        )}
      </div>
    </Card>
  );
};

export default TopCountries;
