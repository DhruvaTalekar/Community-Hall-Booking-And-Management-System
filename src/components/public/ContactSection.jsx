import React, { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Navigation,
  Send,
  Clock,
  UserCheck
} from "lucide-react";
import { useToast } from "../../context/ToastContext";

export default function ContactSection({ hall }) {
  const { addToast } = useToast();
  const contact = hall.contact || {};
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmitInquiry = (e) => {
    e.preventDefault();
    setSent(true);
    addToast("Inquiry submitted! The hall manager will contact you promptly.", "success");
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  const whatsappPhone = contact.whatsapp ? contact.whatsapp.replace(/[^0-9]/g, "") : "";
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
    "Hello, I am interested in booking the community hall."
  )}`;

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    (hall.name || "Community Hall") + " " + (contact.address || "")
  )}`;

  return (
    <section id="contact" className="section contact-section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Get in Touch</span>
          <h2 className="section-title">Location & Management Contact</h2>
          <p className="section-subtitle">
            Schedule an on-site walkthrough or reach out directly to the hall manager for immediate answers.
          </p>
        </div>

        <div className="contact-grid">
          {/* Contact Details Card */}
          <div className="contact-info-card card">
            <h3 className="contact-card-title">Hall Administration Office</h3>
            <p className="contact-card-subtitle">
              Official contact channels managed by <strong>{contact.ownerName || "Hall Management Office"}</strong>.
            </p>

            <div className="contact-links-list">
              <div className="contact-item">
                <div className="contact-icon-box">
                  <MapPin size={20} />
                </div>
                <div className="contact-item-text">
                  <span className="contact-item-label">Hall Address</span>
                  <p className="contact-item-value">{contact.address || "Plot 42, Civic Cultural Enclave, Main City Ring Road"}</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon-box">
                  <Phone size={20} />
                </div>
                <div className="contact-item-text">
                  <span className="contact-item-label">Primary Hotline</span>
                  <a href={`tel:${contact.phone}`} className="contact-item-link">
                    {contact.phone || "+91 98765 43210"}
                  </a>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon-box">
                  <Mail size={20} />
                </div>
                <div className="contact-item-text">
                  <span className="contact-item-label">Email Inquiries</span>
                  <a href={`mailto:${contact.email}`} className="contact-item-link">
                    {contact.email || "inquiry@grandhorizonhall.com"}
                  </a>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon-box">
                  <Clock size={20} />
                </div>
                <div className="contact-item-text">
                  <span className="contact-item-label">Visiting Hours</span>
                  <p className="contact-item-value">Daily: 9:00 AM – 8:00 PM (Prior appointment recommended)</p>
                </div>
              </div>
            </div>

            {/* Quick Contact Action Buttons */}
            <div className="contact-action-buttons-grid">
              <a href={`tel:${contact.phone}`} className="btn btn-secondary contact-action-btn">
                <Phone size={16} />
                Call Now
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary contact-action-btn btn-whatsapp"
              >
                <MessageSquare size={16} />
                WhatsApp
              </a>

              <a href={`mailto:${contact.email}`} className="btn btn-secondary contact-action-btn">
                <Mail size={16} />
                Email
              </a>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-dark contact-action-btn"
              >
                <Navigation size={16} />
                Get Directions
              </a>
            </div>

            {/* Google Maps Embed / Interactive Preview */}
            <div className="map-embed-wrapper">
              <iframe
                title="Grand Horizon Community Hall Location"
                src={contact.googleMapsEmbed || "https://maps.google.com/maps?q=Civic%20Center&t=&z=14&ie=UTF8&iwloc=&output=embed"}
                width="100%"
                height="220"
                style={{ border: 0, borderRadius: "12px" }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Quick Inquiry Form */}
          <div className="contact-form-card card">
            <h3 className="contact-form-title">Send Direct Inquiry</h3>
            <p className="contact-form-desc">
              Have questions regarding availability, catering options, or bulk bookings? Leave a message.
            </p>

            <form onSubmit={handleSubmitInquiry} className="inquiry-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    required
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    required
                    placeholder="+91 98765 00000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Your Message or Event Query</label>
                <textarea
                  className="form-control"
                  rows={5}
                  required
                  placeholder="Please state expected dates, guest count, and any particular requirements..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block btn-lg">
                <Send size={18} />
                Send Inquiry to Management
              </button>

              <div className="privacy-reassurance">
                <UserCheck size={14} />
                <span>Your contact information is confidential and used solely for venue inquiry responses.</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
