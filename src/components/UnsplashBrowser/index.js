import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./UnsplashBrowser.module.sass";
import {
  searchPhotos,
  getPhotos,
  trackPhotoDownload,
  getPhotoAttribution,
  POPULAR_CATEGORIES,
  ORIENTATIONS
} from "../../services/unsplashService";
import Icon from "../Icon";

const UnsplashBrowser = ({ onSelectImage, className }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [orientation, setOrientation] = useState(ORIENTATIONS.ALL);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadPhotos();
  }, [page, orientation]);

  const loadPhotos = async (isNewSearch = false) => {
    if (isNewSearch) {
      setLoading(true);
      setPhotos([]);
      setPage(1);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      let result;

      if (activeSearch) {
        // Search photos
        result = await searchPhotos(activeSearch, {
          page: isNewSearch ? 1 : page,
          per_page: 30,
          orientation: orientation
        });

        if (result.error) {
          setError(result.error.message || "Failed to search photos");
        } else {
          const newPhotos = result.data.results || [];
          setPhotos(prev => isNewSearch ? newPhotos : [...prev, ...newPhotos]);
          setHasMore(newPhotos.length === 30);
        }
      } else {
        // Get curated photos
        result = await getPhotos({
          page: isNewSearch ? 1 : page,
          per_page: 30,
          order_by: 'popular'
        });

        if (result.error) {
          setError(result.error.message || "Failed to load photos");
        } else {
          const newPhotos = result.data || [];
          setPhotos(prev => isNewSearch ? newPhotos : [...prev, ...newPhotos]);
          setHasMore(newPhotos.length === 30);
        }
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setActiveSearch(searchTerm.trim());
      setSelectedCategory(null);
      setPage(1);
      loadPhotos(true);
    }
  };

  const handleCategoryClick = (category) => {
    setSearchTerm(category);
    setActiveSearch(category);
    setSelectedCategory(category);
    setPage(1);
    loadPhotos(true);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setActiveSearch("");
    setSelectedCategory(null);
    setPage(1);
    loadPhotos(true);
  };

  const handleOrientationChange = (newOrientation) => {
    setOrientation(newOrientation);
    setPage(1);
    loadPhotos(true);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleSelectImage = async (photo) => {
    // Track download as required by Unsplash API guidelines
    if (photo.links?.download_location) {
      await trackPhotoDownload(photo.links.download_location);
    }

    const attribution = getPhotoAttribution(photo);

    // Call parent callback with photo data
    if (onSelectImage) {
      onSelectImage({
        url: photo.urls.regular,
        fullUrl: photo.urls.full,
        smallUrl: photo.urls.small,
        thumbUrl: photo.urls.thumb,
        altDescription: photo.alt_description || photo.description || 'Unsplash image',
        attribution: attribution,
        photoId: photo.id,
        width: photo.width,
        height: photo.height,
        color: photo.color
      });
    }
  };

  return (
    <div className={cn(styles.browser, className)}>
      <div className={styles.header}>
        <h3 className={styles.title}>Browse Unsplash Images</h3>
        <p className={styles.subtitle}>
          Beautiful, free images from Unsplash
        </p>
      </div>

      <div className={styles.searchSection}>
        <form className={styles.searchForm} onSubmit={handleSearch}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search for images..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            type="submit"
            className={cn("button-small", styles.searchButton)}
            disabled={!searchTerm.trim()}
          >
            Search
          </button>
          {activeSearch && (
            <button
              type="button"
              className={cn("button-stroke button-small", styles.clearButton)}
              onClick={handleClearSearch}
            >
              Clear
            </button>
          )}
        </form>

        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Orientation:</label>
            <div className={styles.filterButtons}>
              {Object.entries({
                'All': ORIENTATIONS.ALL,
                'Landscape': ORIENTATIONS.LANDSCAPE,
                'Portrait': ORIENTATIONS.PORTRAIT,
                'Square': ORIENTATIONS.SQUARISH
              }).map(([label, value]) => (
                <button
                  key={label}
                  className={cn(styles.filterButton, {
                    [styles.active]: orientation === value
                  })}
                  onClick={() => handleOrientationChange(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.categories}>
        <div className={styles.categoriesLabel}>Popular:</div>
        {POPULAR_CATEGORIES.slice(0, 10).map(category => (
          <button
            key={category}
            className={cn(styles.categoryButton, {
              [styles.active]: selectedCategory === category
            })}
            onClick={() => handleCategoryClick(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {activeSearch && (
        <div className={styles.activeSearch}>
          Showing results for: <strong>{activeSearch}</strong>
        </div>
      )}

      {loading && photos.length === 0 ? (
        <div className={styles.loading}>Loading images...</div>
      ) : error ? (
        <div className={styles.error}>
          {error}
          <button
            className={cn("button-small", styles.retryButton)}
            onClick={() => loadPhotos(true)}
          >
            Retry
          </button>
        </div>
      ) : photos.length === 0 ? (
        <div className={styles.empty}>
          No images found. Try a different search term.
        </div>
      ) : (
        <>
          <div className={styles.photoGrid}>
            {photos.map((photo) => (
              <div
                key={photo.id}
                className={styles.photoCard}
                onClick={() => handleSelectImage(photo)}
              >
                <div className={styles.photoImageWrapper}>
                  <img
                    src={photo.urls.small}
                    alt={photo.alt_description || photo.description || 'Unsplash image'}
                    className={styles.photoImage}
                  />
                  <div className={styles.photoOverlay}>
                    <div className={styles.photoInfo}>
                      <span className={styles.photoAuthor}>
                        {photo.user?.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className={styles.loadMoreSection}>
              <button
                className={cn("button-stroke", styles.loadMoreButton)}
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}

      <div className={styles.footer}>
        <p className={styles.attribution}>
          Images provided by{" "}
          <a
            href="https://unsplash.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Unsplash
          </a>
        </p>
      </div>
    </div>
  );
};

export default UnsplashBrowser;
