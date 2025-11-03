import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./NewProduct.module.sass";
import TooltipGlodal from "../../components/TooltipGlodal";
import Modal from "../../components/Modal";
import Schedule from "../../components/Schedule";
import NameAndDescription from "./NameAndDescription";
import ImagesAndCTA from "./ImagesAndCTA";
import Price from "./Price";
import CategoryAndAttibutes from "./CategoryAndAttibutes";
import ProductFiles from "./ProductFiles";
import Discussion from "./Discussion";
import Preview from "./Preview";
import Panel from "./Panel";
import { createProduct } from "../../services/productService";

const NewProduct = () => {
    const navigate = useNavigate();
    const [visiblePreview, setVisiblePreview] = useState(false);
    const [visibleModal, setVisibleModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    const [startDate, setStartDate] = useState(new Date());
    const [startTime, setStartTime] = useState(new Date());

    // Product form state
    const [productData, setProductData] = useState({
        name: "",
        description: "",
        keyFeatures: ["", "", "", ""],
        imageUrl: "",
        coverImageFile: null,
        ctaButton: "Purchase now",
        price: "",
        allowCustomPricing: false,
        minimumAmount: "",
        suggestedAmount: "",
        category: "Select category",
        compatibility: [],
        tags: [{ id: "Geometry", text: "Geometry" }],
        discussionEnabled: false,
    });

    // Update product data helper
    const updateProductData = (updates) => {
        setProductData(prev => ({ ...prev, ...updates }));
    };

    // Save product (draft or published)
    const handleSaveProduct = async (status = "draft") => {
        setIsSaving(true);
        try {
            // Validate required fields
            if (!productData.name || !productData.price) {
                alert("Please fill in product name and price");
                setIsSaving(false);
                return;
            }

            // Prepare product data for backend
            const productPayload = {
                name: productData.name,
                description: productData.description,
                price: parseFloat(productData.price),
                image_url: productData.imageUrl || "/images/content/product-pic-1.jpg",
                category: productData.category !== "Select category" ? productData.category : null,
                status: status,
                stock_quantity: 100, // Default stock
                published_at: status === "published" ? new Date().toISOString() : null,
            };

            const { data, error } = await createProduct(productPayload);

            if (error) {
                console.error("Error saving product:", error);
                alert(`Failed to ${status === "draft" ? "save draft" : "publish"}: ${error.message}`);
            } else {
                setLastSaved(new Date());
                alert(`Product ${status === "draft" ? "saved as draft" : "published"} successfully!`);

                // Navigate to appropriate page
                if (status === "published") {
                    navigate("/products/released");
                } else {
                    navigate("/products/drafts");
                }
            }
        } catch (err) {
            console.error("Error saving product:", err);
            alert("An unexpected error occurred while saving");
        } finally {
            setIsSaving(false);
        }
    };

    // Schedule product for later
    const handleScheduleProduct = async () => {
        // Combine date and time
        const scheduledDateTime = new Date(
            startDate.getFullYear(),
            startDate.getMonth(),
            startDate.getDate(),
            startTime.getHours(),
            startTime.getMinutes()
        );

        setIsSaving(true);
        try {
            if (!productData.name || !productData.price) {
                alert("Please fill in product name and price");
                setIsSaving(false);
                return;
            }

            const productPayload = {
                name: productData.name,
                description: productData.description,
                price: parseFloat(productData.price),
                image_url: productData.imageUrl || "/images/content/product-pic-1.jpg",
                category: productData.category !== "Select category" ? productData.category : null,
                status: "scheduled",
                stock_quantity: 100,
                published_at: scheduledDateTime.toISOString(),
            };

            const { data, error } = await createProduct(productPayload);

            if (error) {
                console.error("Error scheduling product:", error);
                alert(`Failed to schedule product: ${error.message}`);
            } else {
                alert("Product scheduled successfully!");
                navigate("/products/scheduled");
            }
        } catch (err) {
            console.error("Error scheduling product:", err);
            alert("An unexpected error occurred while scheduling");
        } finally {
            setIsSaving(false);
            setVisibleModal(false);
        }
    };

    // Clear form data
    const handleClearData = () => {
        if (window.confirm("Are you sure you want to clear all data?")) {
            setProductData({
                name: "",
                description: "",
                keyFeatures: ["", "", "", ""],
                imageUrl: "",
                coverImageFile: null,
                ctaButton: "Purchase now",
                price: "",
                allowCustomPricing: false,
                minimumAmount: "",
                suggestedAmount: "",
                category: "Select category",
                compatibility: [],
                tags: [{ id: "Geometry", text: "Geometry" }],
                discussionEnabled: false,
            });
        }
    };

    return (
        <>
            <div className={styles.row}>
                <div className={styles.col}>
                    <NameAndDescription
                        className={styles.card}
                        productData={productData}
                        updateProductData={updateProductData}
                    />
                    <ImagesAndCTA
                        className={styles.card}
                        productData={productData}
                        updateProductData={updateProductData}
                    />
                    <Price
                        className={styles.card}
                        productData={productData}
                        updateProductData={updateProductData}
                    />
                    <CategoryAndAttibutes
                        className={styles.card}
                        productData={productData}
                        updateProductData={updateProductData}
                    />
                    <ProductFiles className={styles.card} />
                    <Discussion
                        className={styles.card}
                        productData={productData}
                        updateProductData={updateProductData}
                    />
                </div>
                <div className={styles.col}>
                    <Preview
                        visible={visiblePreview}
                        onClose={() => setVisiblePreview(false)}
                        productData={productData}
                    />
                </div>
            </div>
            <Panel
                setVisiblePreview={setVisiblePreview}
                setVisibleSchedule={setVisibleModal}
                onSaveDraft={() => handleSaveProduct("draft")}
                onPublish={() => handleSaveProduct("published")}
                onClearData={handleClearData}
                isSaving={isSaving}
                lastSaved={lastSaved}
            />
            <TooltipGlodal />
            <Modal
                visible={visibleModal}
                onClose={() => setVisibleModal(false)}
            >
                <Schedule
                    startDate={startDate}
                    setStartDate={setStartDate}
                    startTime={startTime}
                    setStartTime={setStartTime}
                    onSchedule={handleScheduleProduct}
                />
            </Modal>
        </>
    );
};

export default NewProduct;
