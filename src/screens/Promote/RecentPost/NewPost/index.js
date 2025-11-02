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

    // Validate file type
    const isVideo = fileType === "video-stroke";
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'];

    if (isVideo && !validVideoTypes.includes(file.type)) {
      setError("Invalid video type. Please upload MP4, MPEG, MOV, or WebM video.");
      e.target.value = '';
      return;
    }

    if (!isVideo && !validImageTypes.includes(file.type)) {
      setError("Invalid image type. Please upload JPEG, PNG, GIF, or WebP image.");
      e.target.value = '';
      return;
    }

    // Validate file size (max 10MB for images, 50MB for videos)
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File is too large. Maximum size is ${isVideo ? '50MB' : '10MB'}.`);
      e.target.value = '';
      return;
    }

    setUploading(true);
    setError("");

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const bucketName = isVideo ? 'videos' : 'post-images';
      const filePath = `${bucketName}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      setPostData((prev) => ({
        ...prev,
        image_url: publicUrl,
        post_type: isVideo ? "video" : "picture",
      }));
    } catch (err) {
      setError(err.message || "Failed to upload file");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
      e.target.value = '';
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
