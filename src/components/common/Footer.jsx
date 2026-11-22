import React from "react";
import {
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Clock,
  ShieldCheck,
  Calendar,
  Heart
} from "lucide-react";

export default function Footer({ hall, pricing, onOpenBooking, onOpenAuth }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-grid">
          {/* Brand Info */}
          <div className="footer-col footer-brand-col">
            <div className="footer-brand-title">
              <span className="footer-brand-icon">GH</span>
              <h3>{hall.name || "Grand Horizon Hall"}</h3>
            </div>
            <p className="footer-desc">
              {hall.tagline ||
                "A premier community venue dedicated to hosting unforgettable weddings, ceremonies, and milestones with elegance and heartfelt hospitality."}
            </p>
            <div className="footer-stat-pills">
              <div className="footer-pill">
                <strong>{hall.capacity || "800+"}</strong> Max Capacity
              </div>
              <div className="footer-pill">
                <strong>{hall.parkingCapacity || "200+"}</strong> Paved Parking
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Quick Navigation</h4>
            <ul className="footer-links">
              <li><a href="#hero">Venue Overview</a></li>
              <li><a href="#about">Hall Specifications</a></li>
              <li><a href="#facilities">Amenities & Features</a></li>
              <li><a href="#gallery">Photo Gallery</a></li>
              <li><a href="#pricing">Transparent Pricing</a></li>
              <li><a href="#availability">Live Availability Calendar</a></li>
              <li><a href="#rules">Rules & Booking Guidelines</a></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="footer-col">
            <h4 className="footer-heading">Contact & Reservations</h4>
            <ul className="footer-contact-list">
              <li>
                <MapPin size={18} className="footer-icon" />
                <span>{hall.contact?.address || "Civic Cultural Enclave, Main City Ring Road"}</span>
              </li>
              <li>
                <Phone size={18} className="footer-icon" />
                <a href={`tel:${hall.contact?.phone}`}>{hall.contact?.phone || "+91 98765 43210"}</a>
              </li>
              <li>
                <Mail size={18} className="footer-icon" />
                <a href={`mailto:${hall.contact?.email}`}>{hall.contact?.email || "inquiry@grandhorizonhall.com"}</a>
              </li>
              <li>
                <Clock size={18} className="footer-icon" />
                <span>Office: 9:00 AM – 8:00 PM (All 7 Days)</span>
              </li>
            </ul>

            {hall.contact?.whatsapp && (
              <a
                href={`https://wa.me/${hall.contact.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                  "Hello, I would like to inquire about booking the community hall."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-whatsapp-btn"
              >
                <MessageSquare size={16} />
                Chat on WhatsApp
              </a>
            )}
          </div>

          {/* Booking Summary Box */}
          <div className="footer-col footer-booking-card-col">
            <div className="footer-action-card">
              <h4>Ready to reserve your date?</h4>
              <p>Check dates immediately and secure your booking request online.</p>
              <div className="footer-pricing-tag">
                Starting from <strong>₹{pricing.dailyPrice?.toLocaleString() || "35,000"}</strong> / day
              </div>
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={onOpenBooking}
              >
                <Calendar size={16} />
                Book Online Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal bar */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {currentYear} {hall.name || "Grand Horizon Hall"}. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#rules">Booking Rules</a>
            <span>•</span>
            <a href="#rules">Cancellation Policy</a>
            <span>•</span>
            <a href="#contact">Directions & Map</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
