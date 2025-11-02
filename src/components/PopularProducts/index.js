import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./PopularProducts.module.sass";
import { Link } from "react-router-dom";
import Card from "../Card";
import ModalProduct from "../ModalProduct";
import { getPopularProducts } from "../../services/productService";

const PopularProducts = ({ className, views }) => {
  const [visibleModalProduct, setVisibleModalProduct] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPopularProducts();
  }, []);

  const fetchPopularProducts = async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await getPopularProducts({
      limit: 8
    });

    if (fetchError) {
      console.error('Error fetching popular products:', fetchError);
      setError('Failed to load popular products');
      setProducts([]);
      setLoading(false);
      return;
    }

    if (data) {
      // Transform database products to match UI format
      const formattedProducts = data.map(product => ({
        id: product.id,
        title: product.name,
        price: `$${parseFloat(product.price || 0).toFixed(2)}`,
        earning: `$${parseFloat(product.total_earnings || 0).toFixed(2)}`,
        salesCount: product.sales_count || 0,
        active: product.status === 'published',
        image: product.image_url || "/images/content/product-pic-1.jpg",
        image2x: product.image_url || "/images/content/product-pic-1@2x.jpg",
      }));
      setProducts(formattedProducts);
    } else {
      setProducts([]);
    }
    setLoading(false);
  };

  return (
    <>
      <Card
        className={cn(styles.card, className)}
        title="Popular products"
        classTitle="title-blue"
      >
        <div className={styles.popular}>
          <div className={styles.head}>
            <div className={styles.stage}>Products</div>
            <div className={styles.stage}>Earning</div>
          </div>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>Loading products...</div>
          ) : error ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#EF466F' }}>
              {error}
            </div>
          ) : products.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6F767E' }}>
              No products found. Start by <Link to="/products/add">adding a product</Link>.
            </div>
          ) : (
            <div className={styles.list}>
              {products.map(
                (x, index) =>
                  views > index && (
                  <div
                    className={styles.item}
                    key={x.id || index}
                    onClick={() => setVisibleModalProduct(true)}
                  >
                    <div className={styles.preview}>
                      <img
                        srcSet={`${x.image2x} 2x`}
                        src={x.image}
                        alt="Product"
                      />
                    </div>
                    <div className={styles.title}>{x.title}</div>
                    <div className={styles.details}>
                      <div style={{ marginBottom: '8px' }}>
                        <div style={{ fontSize: '12px', color: '#9A9FA5', marginBottom: '4px' }}>
                          Product
                        </div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                          {x.price}
                        </div>
                        {x.active ? (
                          <div className={cn("status-green", styles.status)}>
                            Active
                          </div>
                        ) : (
                          <div className={cn("status-red", styles.status)}>
                            Deactive
                          </div>
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#9A9FA5', marginBottom: '4px' }}>
                          Earning
                        </div>
                        <div style={{ fontWeight: '600', color: '#2A85FF' }}>
                          {x.earning}
                        </div>
                        {x.salesCount > 0 && (
                          <div style={{ fontSize: '12px', color: '#6F767E', marginTop: '2px' }}>
                            {x.salesCount} {x.salesCount === 1 ? 'sale' : 'sales'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
          {!loading && products.length > 0 && (
            <Link
              className={cn("button-stroke", styles.button)}
              to="/products/dashboard"
            >
              All products
            </Link>
          )}
        </div>
      </Card>
      <ModalProduct
        visible={visibleModalProduct}
        onClose={() => setVisibleModalProduct(false)}
      />
    </>
  );
};

export default PopularProducts;
