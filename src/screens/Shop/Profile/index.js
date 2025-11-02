import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./Profile.module.sass";
import Icon from "../../../components/Icon";
import { getCurrentUser } from "../../../services/userService";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await getCurrentUser();
      if (error) {
        setError(error.message || "Failed to fetch user profile");
        console.error("Error fetching user profile:", error);
      } else {
        setUser(data);
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred");
      console.error("Error fetching user profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const getSocials = () => {
    if (!user?.profile) return [];

    const socials = [];
    if (user.profile.social_twitter) {
      socials.push({
        title: "twitter",
        url: user.profile.social_twitter,
      });
    }
    if (user.profile.social_instagram) {
      socials.push({
        title: "instagram",
        url: user.profile.social_instagram,
      });
    }
    if (user.profile.social_pinterest) {
      socials.push({
        title: "pinterest",
        url: user.profile.social_pinterest,
      });
    }
    return socials;
  };

  if (loading) {
    return (
      <div className={styles.profile}>
        <div className={styles.loading}>Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.profile}>
        <div className={styles.error}>
          <p>Error: {error}</p>
          <button onClick={fetchUserProfile} className="button-stroke button-small">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const displayName = user?.profile?.display_name || user?.email || "User";
  const bio = user?.profile?.bio || "No bio available";
  const avatarUrl = user?.profile?.avatar_url || "/images/content/avatar.jpg";
  const socials = getSocials();

  return (
    <div className={styles.profile}>
      <div className={styles.details}>
        <div className={styles.avatar}>
          <img src={avatarUrl} alt="Avatar" />
          <button className={styles.add}>
            <Icon name="add" />
          </button>
        </div>
        <div className={styles.wrap}>
          <div className={cn("h4", styles.man)}>{displayName}</div>
          <div className={styles.info}>{bio}</div>
        </div>
      </div>
      <div className={styles.contacts}>
        {socials.length > 0 && (
          <div className={styles.socials}>
            {socials.map((x, index) => (
              <a
                className={styles.social}
                href={x.url}
                target="_blank"
                rel="noopener noreferrer"
                key={index}
              >
                <Icon name={x.title} size="24" />
              </a>
            ))}
          </div>
        )}
        <button className={cn("button", styles.button)}>Follow</button>
      </div>
    </div>
  );
};

export default Profile;
