import React, { useState } from "react";
import {
  Calendar,
  Users,
  Car,
  Award,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

export default function HeroSection({
  hall,
  pricing,
  onOpenBooking,
  onCheckAvailabilityQuick
}) {
  const [quickStartDate, setQuickStartDate] = useState("");
  const [quickEndDate, setQuickEndDate] = useState("");

  const handleQuickCheck = (e) => {
    e.preventDefault();
    if (!quickStartDate) {
      const el = document.getElementById("availability");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      return;
    }
    onCheckAvailabilityQuick(quickStartDate, quickEndDate || quickStartDate);
  };

  return (
    <section id="hero" className="hero-section">
      <div className="hero-background-wrapper">
        <img
          src="/assets/hall_hero.jpg"
          alt={hall.name || "Community Banquet Hall"}
          className="hero-bg-img"
        />
        <div className="hero-overlay" />
      </div>

      <div className="container hero-content-container">
        <div className="hero-badge animate-slide-in">
          <Sparkles size={14} className="gold-icon" />
          <span>Premier Venue For Weddings & Cultural Celebrations</span>
        </div>

        <h1 className="hero-headline">
          {hall.name || "Grand Horizon Community Hall"}
        </h1>

        <p className="hero-tagline">
          "{hall.tagline || "Your perfect venue for memorable occasions & grand celebrations."}"
        </p>

        <p className="hero-subtext">
          {hall.description ||
            "Spacious air-conditioned multi-purpose banquet venue featuring crystal chandeliers, grand stage, ample parking and dedicated dining pavilion."}
        </p>

        {/* Primary Action Buttons */}
        <div className="hero-actions-row">
          <button
            type="button"
            className="btn btn-primary btn-lg hero-cta-btn"
            onClick={onOpenBooking}
          >
            <Calendar size={20} />
            Book Now
            <ArrowRight size={18} />
          </button>

          <a
            href="#availability"
            className="btn btn-secondary btn-lg hero-secondary-btn"
          >
            <CheckCircle2 size={20} />
            Check Availability
          </a>
        </div>

        {/* Quick Date Check Floating Widget */}
        <div className="hero-quick-widget">
          <form onSubmit={handleQuickCheck} className="quick-check-form">
            <div className="quick-form-group">
              <label htmlFor="quickStart">Event Start Date</label>
              <input
                id="quickStart"
                type="date"
                className="quick-input"
                min={new Date().toISOString().split("T")[0]}
                value={quickStartDate}
                onChange={(e) => setQuickStartDate(e.target.value)}
                required
              />
            </div>

            <div className="quick-form-group">
              <label htmlFor="quickEnd">Event End Date</label>
              <input
                id="quickEnd"
                type="date"
                className="quick-input"
                min={quickStartDate || new Date().toISOString().split("T")[0]}
                value={quickEndDate}
                onChange={(e) => setQuickEndDate(e.target.value)}
              />
            </div>

            <div className="quick-form-group quick-btn-cell">
              <label className="desktop-spacer">&nbsp;</label>
              <button type="submit" className="btn btn-primary btn-block">
                Check Dates
              </button>
            </div>
          </form>
        </div>

        {/* Key Statistics Bar */}
        <div className="hero-stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrap">
              <Users size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-number">{hall.capacity || 850}+</div>
              <div className="stat-label">Guest Capacity</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap">
              <Car size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-number">{hall.parkingCapacity || 220}+</div>
              <div className="stat-label">Parking Spaces</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap">
              <Award size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-number">{hall.yearsOfService || 12}+</div>
              <div className="stat-label">Years of Service</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap">
              <ShieldCheck size={24} />
            </div>
            <div className="stat-info">
              <div className="stat-number">{hall.hallSize || "16,500 sq.ft."}</div>
              <div className="stat-label">Total Floor Space</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
