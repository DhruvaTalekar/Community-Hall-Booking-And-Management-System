import React, { useState } from "react";
import { Star, MessageSquarePlus, CheckCircle, Quote } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { submitReviewItem } from "../../services/firebaseService";

export default function ReviewsSection({ reviews = [], onOpenAuth }) {
  const { currentUser, userProfile } = useAuth();
  const { addToast } = useToast();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [eventType, setEventType] = useState("Wedding Reception");
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    setSubmitting(true);
    try {
      await submitReviewItem({
        userId: currentUser?.uid || "guest",
        userName: userProfile?.name || currentUser?.displayName || "Community Patron",
        eventType,
        rating,
        review: reviewText.trim()
      });
      addToast("Your review has been submitted for owner moderation. Thank you!", "success");
      setShowReviewModal(false);
      setReviewText("");
    } catch (e) {
      addToast("Could not submit review: " + e.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="section reviews-section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Patron Experiences</span>
          <h2 className="section-title">Testimonials & Client Feedback</h2>
          <p className="section-subtitle">
            Hear from families and organizations who hosted unforgettable milestones at our community hall.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="reviews-grid">
          {reviews.map((rev) => (
            <div key={rev.id} className="review-card card card-hover">
              <div className="review-quote-icon">
                <Quote size={28} />
              </div>

              <div className="review-stars-row">
                {[...Array(5).keys()].map((i) => (
                  <Star
                    key={i}
                    size={16}
                    className={`star-icon ${i < rev.rating ? "star-filled" : "star-empty"}`}
                  />
                ))}
              </div>

              <p className="review-body">"{rev.review}"</p>

              <div className="review-author-meta">
                <div className="author-avatar-badge">
                  {rev.userName?.charAt(0) || "U"}
                </div>
                <div>
                  <h4 className="author-name">{rev.userName}</h4>
                  <span className="author-event-pill">{rev.eventType || "Event"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="review-submit-bar">
          <div className="review-prompt">
            <h4>Have you hosted an event with us?</h4>
            <p>Share your authentic experience to help our community members plan their celebrations.</p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              if (!currentUser) {
                onOpenAuth("login");
              } else {
                setShowReviewModal(true);
              }
            }}
          >
            <MessageSquarePlus size={18} />
            Write a Review
          </button>
        </div>
      </div>

      {/* Review Submission Modal */}
      {showReviewModal && (
        <div className="modal-backdrop" onClick={() => setShowReviewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Submit Your Hall Review</h3>
              <p>Your honest feedback is valuable for prospective community bookings.</p>
            </div>

            <form onSubmit={handleSubmitReview} className="modal-body">
              <div className="form-group">
                <label className="form-label">Event Hosted</label>
                <select
                  className="form-control"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                >
                  <option value="Wedding Reception">Wedding & Reception</option>
                  <option value="Engagement Ceremony">Engagement / Sangeet</option>
                  <option value="Birthday & Reunion">Birthday / Family Gathering</option>
                  <option value="Corporate Seminar">Corporate Seminar / Conference</option>
                  <option value="Cultural / Religious Program">Cultural / Religious Ceremony</option>
                  <option value="Exhibition">Exhibition / Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Overall Rating</label>
                <div className="star-rating-picker">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="star-pick-btn"
                      onClick={() => setRating(star)}
                    >
                      <Star
                        size={28}
                        className={star <= rating ? "star-filled" : "star-empty"}
                      />
                    </button>
                  ))}
                  <span className="star-rating-label">{rating} out of 5 Stars</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Your Review & Feedback</label>
                <textarea
                  className="form-control"
                  rows={4}
                  required
                  placeholder="Tell us about the hall cleanliness, air conditioning, stage lighting, parking convenience, and management support..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowReviewModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Review for Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
