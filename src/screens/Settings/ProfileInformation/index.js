import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./ProfileInformation.module.sass";
import Item from "../Item";
import Icon from "../../../components/Icon";
import TextInput from "../../../components/TextInput";
import Editor from "../../../components/Editor";
import { getCurrentUser } from "../../../services/userService";
import { uploadAvatar, removeAvatar } from "../../../services/userService";

const ProfileInformation = ({ className, profileData, setProfileData, userId }) => {
  const [content, setContent] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("/images/content/avatar.jpg");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Load avatar URL from current user profile
    const loadAvatar = async () => {
      const { data, error } = await getCurrentUser();
      if (!error && data?.profile?.avatar_url) {
        setAvatarUrl(data.profile.avatar_url);
      }
    };
    loadAvatar();
  }, []);

  // Update content when bio changes from parent
  useEffect(() => {
    setContent(profileData.bio || "");
  }, [profileData.bio]);

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBioChange = (value) => {
    setContent(value);
    setProfileData(prev => ({
      ...prev,
      bio: value
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !userId) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert("Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.");
      e.target.value = ''; // Reset file input
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      alert("File is too large. Maximum size is 5MB.");
      e.target.value = ''; // Reset file input
      return;
    }

    setUploading(true);
    const { data, error } = await uploadAvatar(userId, file);

    if (error) {
      console.error("Error uploading avatar:", error);
      alert("Failed to upload avatar: " + (error.message || "Unknown error"));
    } else if (data?.url) {
      setAvatarUrl(data.url);
      alert("Avatar uploaded successfully!");
    }

    setUploading(false);
    e.target.value = ''; // Reset file input
  };

  const handleRemoveAvatar = async () => {
    if (!userId) return;

    const { error } = await removeAvatar(userId, avatarUrl);

    if (error) {
      console.error("Error removing avatar:", error);
      alert("Failed to remove avatar");
    } else {
      setAvatarUrl("/images/content/avatar.jpg");
      alert("Avatar removed successfully!");
    }
  };

  return (
    <Item
      className={cn(styles.card, className)}
      title="Profile information"
      classTitle="title-green"
    >
      <div className={styles.profile}>
        <div className={styles.avatar}>
          <img src={avatarUrl} alt="Avatar" />
          {avatarUrl !== "/images/content/avatar.jpg" && (
            <button className={styles.remove} onClick={handleRemoveAvatar}>
              <Icon name="close" />
            </button>
          )}
        </div>
        <div className={styles.file}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <button className={cn("button", styles.button)} type="button" disabled={uploading}>
            <Icon name="add" size="24" />
            <span>{uploading ? "Uploading..." : "Upload new picture"}</span>
          </button>
        </div>
        <button
          className={cn("button-stroke", styles.button)}
          onClick={handleRemoveAvatar}
          disabled={avatarUrl === "/images/content/avatar.jpg"}
        >
          Remove
        </button>
      </div>
      <div className={styles.fieldset}>
        <TextInput
          className={styles.field}
          label="Display name"
          name="display-name"
          type="text"
          value={profileData.displayName}
          onChange={(e) => handleInputChange("displayName", e.target.value)}
          tooltip="Maximum 100 characters. No HTML or emoji allowed"
          required
        />
        <TextInput
          className={styles.field}
          label="Email"
          name="email"
          type="email"
          value={profileData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          tooltip="Maximum 100 characters. No HTML or emoji allowed"
          required
        />
        <TextInput
          className={styles.field}
          label="Location"
          name="location"
          type="text"
          value={profileData.location}
          onChange={(e) => handleInputChange("location", e.target.value)}
          tooltip="Maximum 100 characters. No HTML or emoji allowed"
          required
        />
        <Editor
          state={content}
          onChange={handleBioChange}
          classEditor={styles.editor}
          label="Bio"
          tooltip="Description"
        />
      </div>
    </Item>
  );
};

export default ProfileInformation;
