import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  X,
  Calendar,
  Users,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  FileText
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  checkDateAvailability,
  submitBookingRequest
} from "../../services/firebaseService";

export default function BookingWizardModal({
  isOpen,
  onClose,
  initialStartDate = "",
  initialEndDate = "",
  initialDuration = 1,
  pricing = {},
  hall = {},
  onBookingSuccess,
  onOpenAuth
}) {
  const { currentUser, userProfile } = useAuth();
  const { addToast } = useToast();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [bookingConfirmedData, setBookingConfirmedData] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Customer Info
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",

    // Step 2: Event Info
    eventType: "Wedding & Reception",
    guestCount: 350,
    eventDescription: "",

    // Step 3: Date & Timing
    startDate: initialStartDate || new Date().toISOString().split("T")[0],
    endDate: initialEndDate || initialStartDate || new Date().toISOString().split("T")[0],
    numberOfDays: initialDuration || 1,
    preferredTime: "Full Day (8:00 AM - 11:00 PM)",
    requirements: "",

    // Step 4: Terms
    agreedToRules: false
  });

  // Pre-fill user profile info when available
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        customerName: prev.customerName || userProfile?.name || currentUser.displayName || "",
        customerEmail: prev.customerEmail || currentUser.email || "",
        customerPhone: prev.customerPhone || userProfile?.phone || "",
        customerAddress: prev.customerAddress || userProfile?.address || ""
      }));
    }
  }, [currentUser, userProfile]);

  // Update dates if props change
  useEffect(() => {
    if (initialStartDate) {
      const s = initialStartDate;
      const e = initialEndDate || initialStartDate;
      const sDate = new Date(s);
      const eDate = new Date(e);
      const days = Math.max(1, Math.ceil(Math.abs(eDate - sDate) / (1000 * 60 * 60 * 24)) + 1);

      setFormData((prev) => ({
        ...prev,
        startDate: s,
        endDate: e,
        numberOfDays: days
      }));
    }
  }, [initialStartDate, initialEndDate, initialDuration]);

  if (!isOpen) return null;

  // Handle date changes with automatic duration recalculation
  const handleDateChange = (start, end) => {
    const sDate = new Date(start);
    const eDate = new Date(end);
    let days = 1;
    if (!isNaN(sDate.getTime()) && !isNaN(eDate.getTime()) && eDate >= sDate) {
      days = Math.ceil(Math.abs(eDate - sDate) / (1000 * 60 * 60 * 24)) + 1;
    }
    setFormData((prev) => ({
      ...prev,
      startDate: start,
      endDate: end,
      numberOfDays: days
    }));
  };

  // Cost calculation
  const dailyPrice = Number(pricing.dailyPrice || 35000);
  const cleaningCharge = Number(pricing.cleaningCharge || 3000);
  const securityDeposit = Number(pricing.securityDeposit || 10000);
  const advanceAmount = Number(pricing.advanceAmount || 15000);

  const estimatedRent = (formData.numberOfDays || 1) * dailyPrice;
  const estimatedTotal = estimatedRent + cleaningCharge;
  const grandTotalWithDeposit = estimatedTotal + securityDeposit;

  // Step 1 Validation
  const validateStep1 = () => {
    if (!formData.customerName.trim()) return "Please enter your full name.";
    if (!formData.customerEmail.trim()) return "Please enter your email address.";
    if (!formData.customerPhone.trim()) return "Please enter your contact phone number.";
    return null;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    if (!formData.eventType) return "Please choose an event type.";
    if (!formData.guestCount || formData.guestCount < 10) return "Please specify an expected guest count (minimum 10).";
    if (formData.guestCount > (hall.capacity || 850)) {
      return `Expected guest count exceeds maximum hall capacity of ${hall.capacity || 850} persons.`;
    }
    return null;
  };

  // Step 3 Validation & Live Availability check
  const validateStep3 = async () => {
    if (!formData.startDate) return "Please specify the start date.";
    if (!formData.endDate) return "Please specify the end date.";
    if (formData.endDate < formData.startDate) return "End date cannot be earlier than start date.";

    setSubmitting(true);
    try {
      const avail = await checkDateAvailability(formData.startDate, formData.endDate);
      if (!avail.available) {
        return avail.reason || "The hall is unavailable for the selected dates. Please choose another date.";
      }
    } catch (e) {
      return "Unable to verify availability right now. Please try again.";
    } finally {
      setSubmitting(false);
    }

    return null;
  };

  const handleNext = async () => {
    setValidationError("");
    if (step === 1) {
      const err = validateStep1();
      if (err) {
        setValidationError(err);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const err = validateStep2();
      if (err) {
        setValidationError(err);
        return;
      }
      setStep(3);
    } else if (step === 3) {
      const err = await validateStep3();
      if (err) {
        setValidationError(err);
        return;
      }
      setStep(4);
    }
  };

  const handleBack = () => {
    setValidationError("");
    if (step > 1) setStep(step - 1);
  };

  // Final Submission
  const handleSubmitBooking = async () => {
    setValidationError("");

    // Check Authentication
    if (!currentUser) {
      addToast("Please sign in or register to submit your booking request.", "warning");
      onOpenAuth("register");
      return;
    }

    if (!formData.agreedToRules) {
      setValidationError("Please read and agree to the booking rules and cancellation policy to proceed.");
      return;
    }

    setSubmitting(true);
    try {
      const bookingPayload = {
        userId: currentUser.uid,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        eventType: formData.eventType,
        guestCount: Number(formData.guestCount),
        eventDescription: formData.eventDescription || "",
        startDate: formData.startDate,
        endDate: formData.endDate,
        numberOfDays: Number(formData.numberOfDays),
        preferredTime: formData.preferredTime,
        requirements: formData.requirements || "",
        estimatedAmount: grandTotalWithDeposit,
        estimatedRent,
        cleaningCharge,
        securityDeposit,
        advancePayable: advanceAmount,
        hallName: hall.name || "Grand Horizon Community Hall"
      };

      const result = await submitBookingRequest(bookingPayload);
      setBookingConfirmedData(result);
      addToast("Booking request submitted successfully! Awaiting owner review.", "success");

      // Celebrate with confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      if (onBookingSuccess) onBookingSuccess(result);
    } catch (err) {
      setValidationError(err.message || "Failed to submit booking request. Please check availability and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content modal-content-lg booking-wizard-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header-wizard">
          <div className="wizard-title-box">
            <span className="wizard-tag">Online Reservation</span>
            <h3 className="wizard-title">Book {hall.name || "Community Hall"}</h3>
          </div>
          <button type="button" className="modal-close-icon" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Success View */}
        {bookingConfirmedData ? (
          <div className="booking-success-view animate-slide-in">
            <div className="success-icon-wrap">
              <CheckCircle2 size={54} className="success-check-icon" />
            </div>

            <h3 className="success-title">Booking Request Submitted!</h3>
            <p className="success-sub">
              Your reservation reference is <strong>{bookingConfirmedData.bookingRef || bookingConfirmedData.id}</strong>.
            </p>

            <div className="booking-summary-pill-box">
              <div className="pill-item">
                <span>Event:</span> <strong>{bookingConfirmedData.eventType}</strong>
              </div>
              <div className="pill-item">
                <span>Dates:</span> <strong>{bookingConfirmedData.startDate} to {bookingConfirmedData.endDate} ({bookingConfirmedData.numberOfDays} Days)</strong>
              </div>
              <div className="pill-item">
                <span>Status:</span> <span className="badge badge-pending">Pending Owner Approval</span>
              </div>
            </div>

            <p className="success-notice">
              The hall administration will review your event details and update the status within 24 hours. You can track this in your User Dashboard.
            </p>

            <div className="modal-actions-row">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  onClose();
                  if (onBookingSuccess) onBookingSuccess(bookingConfirmedData, true);
                }}
              >
                View in My Bookings
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Step Indicator Progress Bar */}
            <div className="wizard-steps-indicator">
              <div className={`step-node ${step >= 1 ? "active" : ""}`}>
                <div className="step-circle">1</div>
                <span className="step-label">Customer</span>
              </div>
              <div className={`step-connector ${step >= 2 ? "active" : ""}`} />
              <div className={`step-node ${step >= 2 ? "active" : ""}`}>
                <div className="step-circle">2</div>
                <span className="step-label">Event Details</span>
              </div>
              <div className={`step-connector ${step >= 3 ? "active" : ""}`} />
              <div className={`step-node ${step >= 3 ? "active" : ""}`}>
                <div className="step-circle">3</div>
                <span className="step-label">Dates & Slot</span>
              </div>
              <div className={`step-connector ${step >= 4 ? "active" : ""}`} />
              <div className={`step-node ${step >= 4 ? "active" : ""}`}>
                <div className="step-circle">4</div>
                <span className="step-label">Summary</span>
              </div>
            </div>

            {/* Error Banner */}
            {validationError && (
              <div className="wizard-error-banner">
                <AlertCircle size={18} />
                <span>{validationError}</span>
              </div>
            )}

            {/* Wizard Body Content */}
            <div className="wizard-body">
              {/* STEP 1: Customer Information */}
              {step === 1 && (
                <div className="wizard-step-pane animate-slide-in">
                  <h4 className="step-heading">Step 1: Primary Organizer Information</h4>
                  <p className="step-subheading">
                    Please provide the verified contact details of the host or organizing party.
                  </p>

                  <div className="form-group">
                    <label className="form-label">Full Name of Host / Organizer *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Ramesh Chandra Verma"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">Email Address *</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="organizer@example.com"
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Contact Phone Number *</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="+91 98765 00000"
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Postal / Residential Address</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Street, City, State"
                      value={formData.customerAddress}
                      onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Event Details */}
              {step === 2 && (
                <div className="wizard-step-pane animate-slide-in">
                  <h4 className="step-heading">Step 2: Event Type & Guest Specifications</h4>
                  <p className="step-subheading">
                    Specify the nature of your gathering to assist the management in seating preparation.
                  </p>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">Type of Event *</label>
                      <select
                        className="form-control"
                        value={formData.eventType}
                        onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                      >
                        <option value="Wedding & Reception">Wedding & Reception</option>
                        <option value="Engagement & Sangeet">Engagement Ceremony / Sangeet</option>
                        <option value="Birthday & Anniversary">Birthday Celebration / Anniversary</option>
                        <option value="Corporate Seminar">Corporate Seminar / Conference</option>
                        <option value="Cultural / Religious Program">Cultural / Religious Function</option>
                        <option value="Exhibition & Trade Fair">Exhibition / Trade Fair</option>
                        <option value="Other Social Gathering">Other Social Gathering</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Expected Guest Count (Max {hall.capacity || 850}) *</label>
                      <input
                        type="number"
                        min="10"
                        max={hall.capacity || 850}
                        className="form-control"
                        value={formData.guestCount}
                        onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Event Description / Occasion Details</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Briefly describe the ceremony schedule, themes, or program highlights..."
                      value={formData.eventDescription}
                      onChange={(e) => setFormData({ ...formData, eventDescription: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Dates & Requirements */}
              {step === 3 && (
                <div className="wizard-step-pane animate-slide-in">
                  <h4 className="step-heading">Step 3: Dates, Duration & Technical Needs</h4>
                  <p className="step-subheading">
                    Duration is automatically calculated based on your start and end dates.
                  </p>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label className="form-label">Event Start Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        min={new Date().toISOString().split("T")[0]}
                        value={formData.startDate}
                        onChange={(e) => handleDateChange(e.target.value, formData.endDate < e.target.value ? e.target.value : formData.endDate)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Event End Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        min={formData.startDate}
                        value={formData.endDate}
                        onChange={(e) => handleDateChange(formData.startDate, e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="duration-highlight-box">
                    <Calendar size={18} className="gold-icon" />
                    <span>
                      Booking Duration: <strong>{formData.numberOfDays} Calendar Day{formData.numberOfDays > 1 ? "s" : ""}</strong>
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Preferred Daily Slot</label>
                    <select
                      className="form-control"
                      value={formData.preferredTime}
                      onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                    >
                      <option value="Full Day (8:00 AM - 11:00 PM)">Full Day (8:00 AM – 11:00 PM)</option>
                      <option value="Morning & Afternoon (8:00 AM - 3:00 PM)">Morning & Afternoon (8:00 AM – 3:00 PM)</option>
                      <option value="Evening & Night (4:00 PM - 11:00 PM)">Evening & Night (4:00 PM – 11:00 PM)</option>
                      <option value="Multi-day Continuous">Multi-day Continuous (Overnight Security included)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Special Requirements / Audio-Visual / Catering Notes</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="e.g. Need podium mics, external decorator clearance, extra dining chairs..."
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: Summary & Cost Estimate */}
              {step === 4 && (
                <div className="wizard-step-pane animate-slide-in">
                  <h4 className="step-heading">Step 4: Booking Summary & Policy Agreement</h4>
                  <p className="step-subheading">
                    Please review your booking details and estimated charges before submitting.
                  </p>

                  <div className="summary-overview-card">
                    <div className="summary-grid">
                      <div className="summary-item">
                        <span className="summary-label">Hall Venue:</span>
                        <strong className="summary-val">{hall.name || "Grand Horizon Hall"}</strong>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Event:</span>
                        <strong className="summary-val">{formData.eventType} ({formData.guestCount} Guests)</strong>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Date Range:</span>
                        <strong className="summary-val">{formData.startDate} to {formData.endDate}</strong>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Duration:</span>
                        <strong className="summary-val">{formData.numberOfDays} Day{formData.numberOfDays > 1 ? "s" : ""}</strong>
                      </div>
                      <div className="summary-item">
                        <span className="summary-label">Organizer:</span>
                        <strong className="summary-val">{formData.customerName} ({formData.customerPhone})</strong>
                      </div>
                    </div>

                    <div className="summary-pricing-breakdown">
                      <h5 className="breakdown-title">Estimated Pricing Breakdown</h5>
                      <div className="breakdown-line">
                        <span>Hall Rent ({formData.numberOfDays} days × ₹{dailyPrice.toLocaleString()}):</span>
                        <span>₹{estimatedRent.toLocaleString()}</span>
                      </div>
                      <div className="breakdown-line">
                        <span>Post-Event Sanitization & Cleaning:</span>
                        <span>₹{cleaningCharge.toLocaleString()}</span>
                      </div>
                      <div className="breakdown-line">
                        <span>Refundable Security Deposit:</span>
                        <span>₹{securityDeposit.toLocaleString()}</span>
                      </div>
                      <div className="breakdown-divider" />
                      <div className="breakdown-total">
                        <span>Total Estimated Budget:</span>
                        <strong>₹{grandTotalWithDeposit.toLocaleString()}</strong>
                      </div>
                      <div className="breakdown-advance-note">
                        Advance Booking Amount to Reserve: <strong>₹{advanceAmount.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="terms-checkbox-wrap">
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={formData.agreedToRules}
                        onChange={(e) => setFormData({ ...formData, agreedToRules: e.target.checked })}
                      />
                      <span className="checkmark" />
                      I have read and agree to the <strong>Hall Booking Rules</strong>, <strong>Cancellation Policy</strong>, and <strong>10:30 PM Sound Restriction</strong>.
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="modal-actions-row wizard-actions">
              {step > 1 ? (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleBack}
                  disabled={submitting}
                >
                  <ArrowLeft size={16} /> Back
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleNext}
                  disabled={submitting}
                >
                  {submitting ? "Checking..." : <>Next Step <ArrowRight size={16} /></>}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={handleSubmitBooking}
                  disabled={submitting}
                >
                  {submitting ? "Submitting Request..." : <>Submit Booking Request <Sparkles size={18} /></>}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
