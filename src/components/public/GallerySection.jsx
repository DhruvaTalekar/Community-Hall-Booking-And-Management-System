import React, { useState } from "react";
import { Maximize2, X, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";

export default function GallerySection({ gallery = [] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const categories = ["All", ...new Set(gallery.map(img => img.category).filter(Boolean))];

  const filteredImages = activeCategory === "All"
    ? gallery
    : gallery.filter(img => img.category === activeCategory);

  const openLightbox = (index) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % filteredImages.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
  };

  return (
    <section id="gallery" className="section gallery-section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Visual Showcase</span>
          <h2 className="section-title">Hall & Venue Gallery</h2>
          <p className="section-subtitle">
            Explore our magnificent spaces, banquet banquet setup arrangements, and elegant ceremonial lighting.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="gallery-filter-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`gallery-filter-btn ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="gallery-grid">
          {filteredImages.map((item, idx) => (
            <div
              key={item.id || idx}
              className="gallery-item-card card card-hover"
              onClick={() => openLightbox(idx)}
            >
              <div className="gallery-image-wrapper">
                <img
                  src={item.imageUrl}
                  alt={item.title || "Community Hall Photograph"}
                  className="gallery-img"
                  loading="lazy"
                />
                <div className="gallery-item-overlay">
                  <div className="gallery-overlay-meta">
                    <span className="gallery-cat-pill">{item.category || "Venue"}</span>
                    <h4 className="gallery-item-title">{item.title}</h4>
                    {item.description && (
                      <p className="gallery-item-desc">{item.description}</p>
                    )}
                  </div>
                  <div className="gallery-zoom-icon">
                    <Maximize2 size={20} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredImages.length === 0 && (
          <div className="empty-state-box">
            <ImageIcon size={48} className="empty-icon" />
            <p>No gallery images found in this category.</p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && filteredImages[lightboxIndex] && (
        <div className="lightbox-backdrop" onClick={closeLightbox}>
          <button
            type="button"
            className="lightbox-close-btn"
            onClick={closeLightbox}
            aria-label="Close Lightbox"
          >
            <X size={26} />
          </button>

          {filteredImages.length > 1 && (
            <>
              <button
                type="button"
                className="lightbox-nav-btn lightbox-prev"
                onClick={prevImage}
                aria-label="Previous image"
              >
                <ChevronLeft size={32} />
              </button>
              <button
                type="button"
                className="lightbox-nav-btn lightbox-next"
                onClick={nextImage}
                aria-label="Next image"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}

          <div className="lightbox-content-box" onClick={(e) => e.stopPropagation()}>
            <img
              src={filteredImages[lightboxIndex].imageUrl}
              alt={filteredImages[lightboxIndex].title || "Venue Preview"}
              className="lightbox-img"
            />
            <div className="lightbox-caption">
              <span className="lightbox-cat">{filteredImages[lightboxIndex].category}</span>
              <h3 className="lightbox-title">{filteredImages[lightboxIndex].title}</h3>
              {filteredImages[lightboxIndex].description && (
                <p className="lightbox-desc">{filteredImages[lightboxIndex].description}</p>
              )}
              <span className="lightbox-counter">
                {lightboxIndex + 1} of {filteredImages.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
