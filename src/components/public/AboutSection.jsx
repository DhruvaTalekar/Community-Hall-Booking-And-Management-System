import React from "react";
import {
  CheckCircle,
  Building,
  Users,
  Car,
  Maximize2,
  CalendarCheck,
  MapPin,
  Clock
} from "lucide-react";

export default function AboutSection({ hall, onOpenBooking }) {
  const suitableList = hall.suitableEvents || [
    "Weddings & Receptions",
    "Engagements & Sangeet",
    "Corporate Seminars & Meetings",
    "Cultural & Religious Gatherings",
    "Birthday & Anniversary Parties",
    "Conferences & Trade Exhibitions"
  ];

  return (
    <section id="about" className="section about-section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">About The Venue</span>
          <h2 className="section-title">Designed for Distinction & Joyous Moments</h2>
          <p className="section-subtitle">
            A harmonious blend of grand modern architecture, acoustic precision, and hospitable management suited for every festive occasion.
          </p>
        </div>

        <div className="about-grid">
          {/* Left Text / Specs */}
          <div className="about-details">
            <h3 className="about-hall-title">{hall.name || "Grand Horizon Community Hall"}</h3>
            <p className="about-lead">
              {hall.description ||
                "Grand Horizon Community Hall offers an expansive venue for hosting personal milestones, cultural spectacles, and prestigious corporate gatherings."}
            </p>
            <p className="about-body">
              Located conveniently in the heart of the city's civic sector with seamless arterial connectivity, our hall provides an all-inclusive event experience. With dedicated banquet dining, two furnished private bridal suites, robust generator backups, and an expansive stage equipped with theatrical lighting, every aspect is organized to make your event hassle-free.
            </p>

            <div className="about-specs-grid">
              <div className="spec-item">
                <Users className="spec-icon" size={20} />
                <div>
                  <strong>{hall.capacity || "850"} Guests</strong>
                  <span>Comfortable theater seating</span>
                </div>
              </div>

              <div className="spec-item">
                <Maximize2 className="spec-icon" size={20} />
                <div>
                  <strong>{hall.hallSize || "16,500 sq. ft."}</strong>
                  <span>Main hall + Dining pavilion</span>
                </div>
              </div>

              <div className="spec-item">
                <Car className="spec-icon" size={20} />
                <div>
                  <strong>{hall.parkingCapacity || "220"} Cars</strong>
                  <span>Secured paved valet area</span>
                </div>
              </div>

              <div className="spec-item">
                <MapPin className="spec-icon" size={20} />
                <div>
                  <strong>Prime Accessibility</strong>
                  <span>{hall.contact?.address || "Civic Enclave"}</span>
                </div>
              </div>
            </div>

            <div className="suitable-events-box">
              <h4 className="suitable-title">Ideal Venue For:</h4>
              <div className="suitable-tags">
                {suitableList.map((item, idx) => (
                  <span key={idx} className="suitable-tag">
                    <CheckCircle size={14} /> {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="about-cta-row">
              <button
                type="button"
                className="btn btn-primary"
                onClick={onOpenBooking}
              >
                <CalendarCheck size={18} />
                Reserve For Your Event
              </button>
              <a href="#rules" className="btn btn-secondary">
                View Hall Rules & Policies
              </a>
            </div>
          </div>

          {/* Right Image Composition */}
          <div className="about-visuals">
            <div className="about-image-card-main">
              <img
                src="/assets/hall_stage.jpg"
                alt="Community Hall Grand Stage"
                className="about-img-main"
              />
              <div className="about-badge-floating">
                <div className="badge-inner">
                  <span className="badge-big-num">{hall.yearsOfService || 12}+</span>
                  <span className="badge-caption">Years Of Community Celebrations</span>
                </div>
              </div>
            </div>

            <div className="about-image-secondary">
              <img
                src="/assets/hall_dining.jpg"
                alt="Community Hall Dining Pavilion"
                className="about-img-sub"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
