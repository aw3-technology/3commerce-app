import React, { useState } from "react";
import cn from "classnames";
import styles from "./CategoryAndAttibutes.module.sass";
import Card from "../../../components/Card";
import Dropdown from "../../../components/Dropdown";
import Tooltip from "../../../components/Tooltip";
import Checkbox from "../../../components/Checkbox";
import { WithContext as ReactTags } from "react-tag-input";

const compatibility = [
  {
    id: 0,
    title: "Sketch",
  },
  {
    id: 1,
    title: "WordPress",
  },
  {
    id: 2,
    title: "Procreate",
  },
  {
    id: 3,
    title: "Figma",
  },
  {
    id: 4,
    title: "HTML",
  },
  {
    id: 5,
    title: "Illustrator",
  },
  {
    id: 6,
    title: "Adobe XD",
  },
  {
    id: 7,
    title: "Keynote",
  },
  {
    id: 8,
    title: "Framer",
  },
  {
    id: 9,
    title: "Photoshop",
  },
  {
    id: 10,
    title: "Maya",
  },
  {
    id: 11,
    title: "In Design",
  },
  {
    id: 12,
    title: "Cinema 4D",
  },
  {
    id: 13,
    title: "Blender",
  },
  {
    id: 14,
    title: "After Effect",
  },
];

const optionsCategory = ["Select category", "Category 1", "Category 2"];

const KeyCodes = {
  comma: 188,
  enter: 13,
};
const delimiters = [KeyCodes.comma, KeyCodes.enter];

const CategoryAndAttibutes = ({ className, productData, updateProductData }) => {
  const handleCategoryChange = (value) => {
    updateProductData({ category: value });
  };

  const handleCompatibilityChange = (id) => {
    const currentCompatibility = productData.compatibility || [];
    if (currentCompatibility.includes(id)) {
      updateProductData({
        compatibility: currentCompatibility.filter((x) => x !== id)
      });
    } else {
      updateProductData({
        compatibility: [...currentCompatibility, id]
      });
    }
  };

  const handleDelete = (i) => {
    const newTags = productData.tags.filter((tag, index) => index !== i);
    updateProductData({ tags: newTags });
  };

  const handleAddition = (tag) => {
    updateProductData({ tags: [...productData.tags, tag] });
  };

  const handleDrag = (tag, currPos, newPos) => {
    const newTags = [...productData.tags].slice();
    newTags.splice(currPos, 1);
    newTags.splice(newPos, 0, tag);
    updateProductData({ tags: newTags });
  };

  const handleTagClick = (index) => {
    console.log("The tag at index " + index + " was clicked");
  };

  const onClearAll = () => {
    updateProductData({ tags: [] });
  };

  const onTagUpdate = (i, newTag) => {
    const updatedTags = productData.tags.slice();
    updatedTags.splice(i, 1, newTag);
    updateProductData({ tags: updatedTags });
  };

  return (
    <Card
      className={cn(styles.card, className)}
      title="Category & attibutes"
      classTitle="title-purple"
    >
      <div className={styles.images}>
        <Dropdown
          className={styles.field}
          label="Category"
          tooltip="Maximum 100 characters. No HTML or emoji allowed"
          value={productData.category}
          setValue={handleCategoryChange}
          options={optionsCategory}
        />
        <div className={styles.label}>
          Compatibility{" "}
          <Tooltip
            className={styles.tooltip}
            title="Maximum 100 characters. No HTML or emoji allowed"
            icon="info"
            place="right"
          />
        </div>
        <div className={styles.list}>
          {compatibility.map((x, index) => (
            <Checkbox
              className={styles.checkbox}
              content={x.title}
              value={productData.compatibility.includes(x.id)}
              onChange={() => handleCompatibilityChange(x.id)}
              key={index}
            />
          ))}
        </div>
        <div className={styles.head}>
          <div className={styles.label}>
            Tags{" "}
            <Tooltip
              className={styles.tooltip}
              title="Maximum 100 characters. No HTML or emoji allowed"
              icon="info"
              place="right"
            />
          </div>
          <div className={styles.counter}>
            <span>{productData.tags.length}</span>/12 tags
          </div>
        </div>
        <div className={styles.tags}>
          <ReactTags
            handleDelete={handleDelete}
            handleAddition={handleAddition}
            handleDrag={handleDrag}
            delimiters={delimiters}
            handleTagClick={handleTagClick}
            onClearAll={onClearAll}
            onTagUpdate={onTagUpdate}
            suggestions={[{ id: "1", text: "Geometry" }]}
            placeholder="Enter tags to describe your item"
            minQueryLength={2}
            maxLength={20}
            autofocus={false}
            allowDeleteFromEmptyInput={true}
            autocomplete={true}
            readOnly={false}
            allowUnique={true}
            allowDragDrop={true}
            inline={true}
            inputFieldPosition="inline"
            allowAdditionFromPaste={true}
            editable={true}
            clearAll={true}
            tags={productData.tags}
          />
        </div>
      </div>
    </Card>
  );
};

export default CategoryAndAttibutes;
