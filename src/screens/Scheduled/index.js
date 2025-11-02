import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./Scheduled.module.sass";
import Card from "../../components/Card";
import Form from "../../components/Form";
import Table from "../../components/Table";
import Panel from "./Panel";
import { getProductsByStatus } from "../../services/productService";

const Scheduled = () => {
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProducts, setSelectedProducts] = useState([]);

    useEffect(() => {
        fetchScheduledProducts();
    }, []);

    const fetchScheduledProducts = async () => {
        setLoading(true);
        const { data, error } = await getProductsByStatus('scheduled');

        if (!error && data) {
            setProducts(data);
        } else if (error) {
            console.error('Error fetching scheduled products:', error);
        }

        setLoading(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Filter products based on search
        if (search.trim()) {
            fetchScheduledProducts();
        }
    };

    const handlePublishNow = async () => {
        if (selectedProducts.length === 0) {
            alert('Please select products to publish');
            return;
        }

        // TODO: Implement bulk publish functionality
        console.log('Publishing products:', selectedProducts);
    };

    const handleReschedule = () => {
        if (selectedProducts.length === 0) {
            alert('Please select products to reschedule');
            return;
        }

        // TODO: Implement reschedule modal
        console.log('Rescheduling products:', selectedProducts);
    };

    // Filter products based on search
    const filteredProducts = search.trim()
        ? products.filter(product =>
            product.name?.toLowerCase().includes(search.toLowerCase()) ||
            product.category?.toLowerCase().includes(search.toLowerCase())
        )
        : products;

    return (
        <>
            <Card
                className={styles.card}
                classCardHead={styles.head}
                title="Scheduled Products"
                classTitle={cn("title-purple", styles.title)}
                head={
                    <Form
                        className={styles.form}
                        value={search}
                        setValue={setSearch}
                        onSubmit={handleSubmit}
                        placeholder="Search product"
                        type="text"
                        name="search"
                        icon="search"
                    />
                }
            >
                <div className={styles.wrapper}>
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center' }}>
                            Loading scheduled products...
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center' }}>
                            {search.trim()
                                ? 'No products found matching your search.'
                                : 'No scheduled products. Schedule products to publish them later.'}
                        </div>
                    ) : (
                        <Table
                            items={filteredProducts}
                            title="Scheduled for"
                            selectedProducts={selectedProducts}
                            onSelectProducts={setSelectedProducts}
                        />
                    )}
                </div>
            </Card>
            {selectedProducts.length > 0 && (
                <Panel
                    selectedCount={selectedProducts.length}
                    onPublishNow={handlePublishNow}
                    onReschedule={handleReschedule}
                />
            )}
        </>
    );
};

export default Scheduled;
