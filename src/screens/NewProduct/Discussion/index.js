import React from "react";
import cn from "classnames";
import styles from "./Discussion.module.sass";
import Card from "../../../components/Card";
import Switch from "../../../components/Switch";

const Discussion = ({ className, productData, updateProductData }) => {
    const handleToggle = () => {
        updateProductData({ discussionEnabled: !productData.discussionEnabled });
    };

    return (
        <Card
            className={cn(styles.card, className)}
            title="Discussion"
            classTitle="title-red"
        >
            <div className={styles.discussion}>
                <div className={styles.label}>
                    Enable product discussion and reviews
                </div>
                <Switch
                    className={styles.switch}
                    value={productData.discussionEnabled}
                    onChange={handleToggle}
                />
                {productData.discussionEnabled && (
                    <div className={styles.info}>
                        Customers will be able to leave reviews and ratings for this product
                    </div>
                )}
            </div>
        </Card>
    );
};

export default Discussion;
