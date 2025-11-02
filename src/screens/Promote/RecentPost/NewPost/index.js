import React, { useState } from "react";
import styles from "./NewPost.module.sass";
import cn from "classnames";
import Icon from "../../../../components/Icon";
import { createPost } from "../../../../services/promotionService";
import supabase from "../../../../config/supabaseClient";

const socialPlatforms = [
  {
    id: "facebook",
    avatar: "/images/content/avatar.jpg",
    icon: "facebook-fill",
  },
  {
    id: "twitter",
    avatar: "/images/content/avatar.jpg",
    icon: "twitter-fill",
  },
  {
    id: "instagram",
    avatar: "/images/content/avatar.jpg",
    icon: "instagram",
  },
  {
    id: "linkedin",
    avatar: "/images/content/avatar.jpg",
    icon: "linkedin",
  },
];

const files = ["image-stroke", "video-stroke"];

const NewPost = ({ onPostCreated }) => {
  const [postData, setPostData] = useState({
    title: "",
    content: "",
    image_url: "",
    post_type: "picture",
    platforms: [],
    status: "published",
  });
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const togglePlatform = (platformId) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(platformId)) {
        return prev.filter((id) => id !== platformId);
      } else {
        return [...prev, platformId];
      }
    });
  };

  const handleFileUpload = async (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      // In a real app, you would upload to a storage service (like Supabase Storage)
      // For now, we'll create a local URL
      const imageUrl = URL.createObjectURL(file);
      setPostData((prev) => ({
        ...prev,
        image_url: imageUrl,
        post_type: fileType === "video-stroke" ? "video" : "picture",
      }));
    } catch (err) {
      setError("Failed to upload file");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!postData.title.trim()) {
      setError("Please enter a post title");
      return;
    }

    if (selectedPlatforms.length === 0) {
      setError("Please select at least one platform");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const { data, error: createError } = await createPost({
        ...postData,
        platforms: selectedPlatforms,
      });

      if (createError) {
        throw createError;
      }

      console.log("Post created successfully:", data);

      // Call the callback to refresh the posts list
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (err) {
      setError(err.message || "Failed to create post");
      console.error("Error creating post:", err);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <form className={styles.post} onSubmit={handleSubmit}>
      <div className={cn("title-green", styles.title)}>New post</div>

      {error && (
        <div style={{ color: "red", padding: "10px", marginBottom: "10px" }}>
          {error}
        </div>
      )}

      <div className={styles.list}>
        {socialPlatforms.map((platform, index) => (
          <div
            className={cn(styles.avatar, {
              [styles.selected]: selectedPlatforms.includes(platform.id),
            })}
            key={index}
            onClick={() => togglePlatform(platform.id)}
            style={{
              cursor: "pointer",
              opacity: selectedPlatforms.includes(platform.id) ? 1 : 0.5,
              border: selectedPlatforms.includes(platform.id)
                ? "2px solid #3772FF"
                : "2px solid transparent",
            }}
          >
            <img src={platform.avatar} alt="Avatar" />
            <div className={styles.social}>
              <Icon name={platform.icon} size="12" />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.field}>
        <input
          type="text"
          className={styles.textarea}
          name="title"
          placeholder="Post title"
          value={postData.title}
          onChange={(e) =>
            setPostData((prev) => ({ ...prev, title: e.target.value }))
          }
          style={{ marginBottom: "10px", minHeight: "40px" }}
        />
        <textarea
          className={styles.textarea}
          name="content"
          placeholder="What you would like to share?"
          value={postData.content}
          onChange={(e) =>
            setPostData((prev) => ({ ...prev, content: e.target.value }))
          }
        />
      </div>

      {postData.image_url && (
        <div className={styles.preview}>
          <img src={postData.image_url} alt="Preview" />
        </div>
      )}

      <div className={styles.foot}>
        <div className={styles.files}>
          {files.map((x, index) => (
            <div className={styles.file} key={index}>
              <input
                type="file"
                accept={x === "video-stroke" ? "video/*" : "image/*"}
                onChange={(e) => handleFileUpload(e, x)}
                disabled={uploading}
              />
              <div className={styles.icon}>
                <Icon name={x} size="20" />
              </div>
            </div>
          ))}
        </div>
        <button
          type="submit"
          className={cn("button", styles.button)}
          disabled={submitting || uploading}
        >
          <span>{submitting ? "Posting..." : "Post"}</span>
          <Icon name="arrow-right" size="24" />
        </button>
      </div>
    </form>
  );
};

export default NewPost;
