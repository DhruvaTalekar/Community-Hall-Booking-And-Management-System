import React from "react";
import {
  Sparkles,
  Wind,
  Utensils,
  Zap,
  Car,
  Volume2,
  ShieldCheck,
  Coffee,
  Check,
  Tv,
  Droplets,
  Layers
} from "lucide-react";

// Icon mapping helper
const iconMap = {
  Sparkles,
  Wind,
  Utensils,
  Zap,
  Car,
  Volume2,
  ShieldCheck,
  Coffee,
  Tv,
  Droplets,
  Layers
};

export default function FacilitiesSection({ facilities = [] }) {
  const activeFacilities = facilities.filter(f => f.enabled !== false);

  return (
    <section id="facilities" className="section facilities-section bg-light-alt">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Venue Amenities</span>
          <h2 className="section-title">Comprehensive Modern Facilities</h2>
          <p className="section-subtitle">
            Every convenience curated to ensure seamless execution, complete guest comfort, and majestic celebration aesthetics.
          </p>
        </div>

        <div className="facilities-grid">
          {activeFacilities.map((facility) => {
            const IconComponent = iconMap[facility.icon] || Sparkles;
            return (
              <div key={facility.id} className="facility-card card card-hover">
                <div className="facility-icon-wrap">
                  <IconComponent size={26} className="facility-icon" />
                </div>
                <div className="facility-content">
                  <div className="facility-title-row">
                    <h3 className="facility-name">{facility.name}</h3>
                    <span className="facility-status-pill">
                      <Check size={12} /> Included
                    </span>
                  </div>
                  <p className="facility-desc">{facility.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="facilities-note-box">
          <div className="facilities-note-inner">
            <span className="note-label">✨ Customized Event Requirements:</span>
            <p>
              Need special staging, custom LED video walls, additional generator power, or specific decorator clearances? You can mention your unique requests in the booking form.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
