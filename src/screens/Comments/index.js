import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./Comments.module.sass";
import Card from "../../components/Card";
import Form from "../../components/Form";
import Panel from "./Panel";
import Table from "./Table";
import { getAllComments } from "../../services/commentService";

const Comments = () => {
  const [search, setSearch] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComments, setSelectedComments] = useState([]);

  // Fetch comments on mount and when search changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchComments();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [search]);

  const fetchComments = async (loadMore = false) => {
    setLoading(true);

    try {
      const options = {
        limit: 10,
        offset: loadMore ? comments.length : 0,
      };

      if (search) {
        options.search = search;
      }

      const { data, error } = await getAllComments(options);

      if (!error) {
        if (loadMore) {
          setComments([...comments, ...(data || [])]);
        } else {
          setComments(data || []);
        }
      } else {
        console.error('Error fetching comments:', error);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    fetchComments();
  };

  const handleLoadMore = () => {
    if (!loading) {
      fetchComments(true);
    }
  };

  // Transform backend data to match UI expectations
  const transformComment = (comment) => {
    const product = comment.products;
    const customer = comment.customers;

    return {
      id: comment.id,
      product: product?.name || 'Unknown Product',
      category: product?.category || 'Unknown Category',
      image: product?.image_url || '/images/content/product-pic-1.jpg',
      image2x: product?.image_url || '/images/content/product-pic-1@2x.jpg',
      time: formatTimeAgo(comment.created_at),
      author: customer?.name || 'Anonymous',
      avatar: customer?.avatar_url || '/images/content/avatar-1.jpg',
      comment: comment.content || '',
      status: comment.status,
      rating: comment.rating,
    };
  };

  // Helper function to format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays}d`;
    } else if (diffInHours > 0) {
      return `${diffInHours}h`;
    } else {
      return 'Just now';
    }
  };

  const transformedComments = comments.map(transformComment);

  return (
    <>
      <Card
        className={styles.card}
        classCardHead={styles.head}
        title="Product comments"
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
          <Table
            items={transformedComments}
            loading={loading}
            onLoadMore={handleLoadMore}
            selectedComments={selectedComments}
            setSelectedComments={setSelectedComments}
          />
        </div>
      </Card>
      <Panel
        selectedCount={selectedComments.length}
        onClearSelection={() => setSelectedComments([])}
      />
    </>
  );
};

export default Comments;
