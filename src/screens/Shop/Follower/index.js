import React, { useState } from "react";
import styles from "./Follower.module.sass";
import cn from "classnames";
import { Link } from "react-router-dom";
import { numberWithCommas } from "../../../utils.js";

const Follower = ({ className, item, followers }) => {
  const [visible, setVisible] = useState(false);

  // Get display values with fallbacks
  const displayName = item.name || item.man || "Unknown User";
  const productCount = item.products || 0;
  const followerCount = item.followers || 0;
  const avatarUrl = item.avatar || "/images/content/avatar.jpg";
  const gallery = item.gallery || [];

  return (
    <div className={cn(styles.follower, className)}>
      <div className={styles.details}>
        <div className={styles.avatar}>
          <img src={avatarUrl} alt="Avatar" />
        </div>
        <div className={styles.wrap}>
          <div className={styles.man}>{displayName}</div>
          <div className={styles.list}>
            <div className={styles.counter}>
              <span>{productCount}</span> {productCount === 1 ? 'product' : 'products'}
            </div>
            <div className={styles.counter}>
              <span>{numberWithCommas(followerCount)}</span> {followerCount === 1 ? 'follower' : 'followers'}
            </div>
          </div>
          <div className={styles.btns}>
            {followers ? (
              <button
                className={cn("button-stroke", styles.button, styles.follow, {
                  [styles.active]: visible,
                })}
                onClick={() => setVisible(!visible)}
              >
                Follow<span>ing</span>
              </button>
            ) : (
              <button className={cn("button-stroke", styles.button)}>
                Unfollow
              </button>
            )}

            {(item.message || true) && (
              <Link
                className={cn("button", styles.button)}
                to="/message-center"
              >
                Message
              </Link>
            )}
          </div>
        </div>
      </div>
      {gallery.length > 0 && (
        <div className={styles.gallery}>
          {gallery.map((x, index) => (
            <div className={styles.preview} key={index}>
              <img srcSet={`${x.image2x} 2x`} src={x.image} alt="Product" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Follower;
