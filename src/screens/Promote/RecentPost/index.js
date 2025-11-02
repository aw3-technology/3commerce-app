import React, { useState, useEffect } from "react";
import styles from "./RecentPost.module.sass";
import cn from "classnames";
import Card from "../../../components/Card";
import Dropdown from "../../../components/Dropdown";
import Loader from "../../../components/Loader";
import Modal from "../../../components/Modal";
import Row from "./Row";
import NewPost from "./NewPost";
import { getPostsByPeriod } from "../../../services/promotionService";

const intervals = ["Last 7 days", "This month", "All time"];

const RecentPost = ({ className }) => {
  const [sorting, setSorting] = useState(intervals[0]);
  const [visibleModal, setVisibleModal] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [sorting]);

  const fetchPosts = async () => {
    setLoading(true);

    // Map interval to period parameter
    const periodMap = {
      "Last 7 days": "7days",
      "This month": "month",
      "All time": "all",
    };

    const period = periodMap[sorting] || "7days";

    const { data, error } = await getPostsByPeriod(period);

    if (!error && data) {
      // Transform backend data to match the format expected by Row component
      const transformedPosts = data.map((post) => ({
        id: post.id,
        title: post.title,
        image: post.image_url || "/images/content/post-pic-1.jpg",
        image2x: post.image_url || "/images/content/post-pic-1@2x.jpg",
        picture: post.post_type === "picture",
        video: post.post_type === "video",
        distribution: post.distribution_rate || 0,
        socials: post.platforms
          ? post.platforms.map((platform) => ({
              title: platform,
              url: `https://www.${platform}.com`,
            }))
          : [],
        linkClicks: {
          counter: post.link_clicks || 0,
          balance: 0, // We could calculate this from historical data
          progress: Math.random() * 100, // Random for now
        },
        views: {
          counter: post.views || 0,
          balance: 0,
          progress: Math.random() * 100,
        },
        engagement: {
          counter: post.comments_count || 0,
          balance: 0,
          progress: Math.random() * 100,
        },
      }));

      setPosts(transformedPosts);
    }

    setLoading(false);
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    // You can implement pagination here if needed
    // For now, we'll just refetch
    await fetchPosts();
    setLoadingMore(false);
  };

  const handlePostCreated = () => {
    // Refresh posts when a new one is created
    setVisibleModal(false);
    fetchPosts();
  };

  return (
    <>
      <Card
        className={cn(styles.card, className)}
        title="Recent post"
        classTitle={cn("title-blue", styles.title)}
        classCardHead={styles.head}
        head={
          <>
            <Dropdown
              className={styles.dropdown}
              classDropdownHead={styles.dropdownHead}
              value={sorting}
              setValue={setSorting}
              options={intervals}
              small
            />
            <button
              className={cn("button-small", styles.button)}
              onClick={() => setVisibleModal(true)}
            >
              New post
            </button>
          </>
        }
      >
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center" }}>Loading posts...</div>
        ) : posts.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center" }}>
            No posts found. Create your first post!
          </div>
        ) : (
          <>
            <div className={styles.table}>
              <div className={styles.row}>
                <div className={styles.col}>Post</div>
                <div className={styles.col}>Distribution</div>
                <div className={styles.col}>Link clicks</div>
                <div className={styles.col}>Views</div>
                <div className={styles.col}>Engagement</div>
              </div>
              {posts.map((x, index) => (
                <Row item={x} key={x.id || index} />
              ))}
            </div>
            <div className={styles.foot}>
              <button
                className={cn("button-stroke button-small", styles.button)}
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore && <Loader className={styles.loader} />}
                <span>{loadingMore ? "Loading..." : "Load more"}</span>
              </button>
            </div>
          </>
        )}
      </Card>
      <Modal
        outerClassName={styles.outer}
        visible={visibleModal}
        onClose={() => setVisibleModal(false)}
      >
        <NewPost onPostCreated={handlePostCreated} />
      </Modal>
    </>
  );
};

export default RecentPost;
