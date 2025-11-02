import React, { useState, useEffect } from "react";
import cn from "classnames";
import { Link } from "react-router-dom";
import styles from "./Comments.module.sass";
import Card from "../../../components/Card";
import Icon from "../../../components/Icon";
import Favorite from "../../../components/Favorite";
import { getAllComments } from "../../../services/commentService";

const Comments = ({ className }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setLoading(true);
    const { data, error } = await getAllComments({ limit: 3 });

    if (!error && data) {
      // Transform database comments to match UI format
      const formattedComments = data.map((comment) => ({
        title: comment.customers?.name || "Anonymous",
        login: `@${comment.customers?.email?.split('@')[0] || 'user'}`,
        time: getTimeAgo(comment.created_at),
        content: `On <strong>${comment.products?.name || 'Product'}</strong>`,
        comment: comment.content,
        avatar: comment.customers?.avatar_url || "/images/content/avatar.jpg",
        rating: comment.rating,
      }));
      setComments(formattedComments);
    } else {
      // Fallback to default empty state
      setComments([]);
    }
    setLoading(false);
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };
  return (
    <Card
      className={cn(styles.card, className)}
      title="Comments"
      classTitle="title-yellow"
    >
      <div className={styles.comments}>
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading comments...</div>
        ) : comments.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#6F767E' }}>
            No comments yet. Comments will appear here once customers review your products.
          </div>
        ) : (
          <>
            <div className={styles.list}>
              {comments.map((x, index) => (
            <div className={styles.item} key={index}>
              <div className={styles.avatar}>
                <img src={x.avatar} alt="Avatar" />
              </div>
              <div className={styles.details}>
                <div className={styles.line}>
                  <div className={styles.user}>
                    <span className={styles.title}>{x.title}</span>{" "}
                    <span className={styles.login}>{x.login}</span>
                  </div>
                  <div className={styles.time}>{x.time}</div>
                </div>
                <div
                  className={styles.content}
                  dangerouslySetInnerHTML={{ __html: x.content }}
                ></div>
                <div
                  className={styles.comment}
                  dangerouslySetInnerHTML={{ __html: x.comment }}
                ></div>
                <div className={styles.control}>
                  <Link className={styles.link} to="/message-center">
                    <Icon name="message" size="20" />
                  </Link>
                  <Favorite className={cn(styles.favorite, styles.link)} />
                  <Link className={styles.link} to="/products/comments">
                    <Icon name="link" size="20" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
            </div>
            <Link
              className={cn("button-stroke", styles.button)}
              to="/products/comments"
            >
              View all
            </Link>
          </>
        )}
      </div>
    </Card>
  );
};

export default Comments;
