import React, { useState } from "react";
import {
  Calculator,
  Shield,
  CheckCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Info
} from "lucide-react";

export default function PricingSection({ pricing = {}, onOpenBookingWithDays }) {
  const dailyPrice = Number(pricing.dailyPrice || 35000);
  const weekendPrice = Number(pricing.weekendPrice || 45000);
  const cleaningCharge = Number(pricing.cleaningCharge || 3000);
  const securityDeposit = Number(pricing.securityDeposit || 10000);
  const advanceAmount = Number(pricing.advanceAmount || 15000);
  const additionalCharges = Number(pricing.additionalCharges || 2000);

  // Estimator State
  const [calcDays, setCalcDays] = useState(1);
  const [calcWeekendDays, setCalcWeekendDays] = useState(0);
  const [includeCleaning, setIncludeCleaning] = useState(true);

  // Calculations
  const weekdayDays = Math.max(0, calcDays - calcWeekendDays);
  const rentWeekday = weekdayDays * dailyPrice;
  const rentWeekend = calcWeekendDays * weekendPrice;
  const totalRent = rentWeekday + rentWeekend;
  const totalCleaning = includeCleaning ? cleaningCharge : 0;
  const subtotal = totalRent + totalCleaning + additionalCharges;
  const grandTotalWithDeposit = subtotal + securityDeposit;

  const handleStartBookingWithEst = () => {
    onOpenBookingWithDays(calcDays);
  };

  return (
    <section id="pricing" className="section pricing-section bg-light-alt">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Pricing & Estimates</span>
          <h2 className="section-title">Transparent & Structured Rates</h2>
          <p className="section-subtitle">
            Clear, honest pricing with zero hidden charges. Estimate your event budget instantly below.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="pricing-cards-grid">
          {/* Weekday Card */}
          <div className="pricing-card card">
            <div className="pricing-card-header">
              <span className="pricing-tier-badge">Standard Rate</span>
              <h3 className="pricing-tier-name">Weekday Booking</h3>
              <p className="pricing-tier-desc">Monday through Friday</p>
              <div className="pricing-price-box">
                <span className="currency-symbol">₹</span>
                <span className="price-amount">{dailyPrice.toLocaleString()}</span>
                <span className="price-unit">/ calendar day</span>
              </div>
            </div>

            <ul className="pricing-features-list">
              <li><CheckCircle size={16} /> Complete Hall Access (8:00 AM – 11:00 PM)</li>
              <li><CheckCircle size={16} /> Central Air Conditioning Included</li>
              <li><CheckCircle size={16} /> Stage & Ambient Sound System</li>
              <li><CheckCircle size={16} /> 2 Luxury Ensuite Green Rooms</li>
              <li><CheckCircle size={16} /> 100% Acoustic Generator Power Backup</li>
            </ul>

            <div className="pricing-card-footer">
              <button
                type="button"
                className="btn btn-secondary btn-block"
                onClick={() => onOpenBookingWithDays(1)}
              >
                Book Weekday
              </button>
            </div>
          </div>

          {/* Weekend Card (Featured) */}
          <div className="pricing-card card pricing-card-featured">
            <div className="featured-ribbon">Most Popular</div>
            <div className="pricing-card-header">
              <span className="pricing-tier-badge gold-badge">Weekend Prime</span>
              <h3 className="pricing-tier-name">Weekend Booking</h3>
              <p className="pricing-tier-desc">Saturday & Sunday</p>
              <div className="pricing-price-box">
                <span className="currency-symbol">₹</span>
                <span className="price-amount">{weekendPrice.toLocaleString()}</span>
                <span className="price-unit">/ calendar day</span>
              </div>
            </div>

            <ul className="pricing-features-list">
              <li><CheckCircle size={16} /> Prime Saturday/Sunday Slot Reservation</li>
              <li><CheckCircle size={16} /> Dedicated Valet & On-Site Parking Team</li>
              <li><CheckCircle size={16} /> Full Hall, Stage, Dining & Kitchen Access</li>
              <li><CheckCircle size={16} /> Priority Technical Crew On-Site</li>
              <li><CheckCircle size={16} /> 100% Generator Backup Guarantee</li>
            </ul>

            <div className="pricing-card-footer">
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={() => onOpenBookingWithDays(1)}
              >
                Reserve Weekend
              </button>
            </div>
          </div>

          {/* Additional Charges / Inclusions */}
          <div className="pricing-card card">
            <div className="pricing-card-header">
              <span className="pricing-tier-badge">Deposit & Utility</span>
              <h3 className="pricing-tier-name">Deposits & Services</h3>
              <p className="pricing-tier-desc">Refundable & Maintenance Items</p>
              <div className="pricing-price-box">
                <span className="currency-symbol">₹</span>
                <span className="price-amount">{advanceAmount.toLocaleString()}</span>
                <span className="price-unit">advance to block</span>
              </div>
            </div>

            <div className="pricing-breakdown-mini">
              <div className="breakdown-mini-row">
                <span>Refundable Security Deposit:</span>
                <strong>₹{securityDeposit.toLocaleString()}</strong>
              </div>
              <div className="breakdown-mini-row">
                <span>Sanitization & Post-Cleaning:</span>
                <strong>₹{cleaningCharge.toLocaleString()}</strong>
              </div>
              <div className="breakdown-mini-row">
                <span>Utility & Maintenance Surcharge:</span>
                <strong>₹{additionalCharges.toLocaleString()}</strong>
              </div>
            </div>

            <p className="pricing-deposit-note">
              <Shield size={14} /> The security deposit is fully refunded within 48 hours following hall inspection.
            </p>
          </div>
        </div>

        {/* Dynamic Interactive Budget Calculator */}
        <div className="estimator-container card">
          <div className="estimator-header">
            <div className="estimator-icon-box">
              <Calculator size={24} />
            </div>
            <div>
              <h3 className="estimator-title">Interactive Booking Cost Estimator</h3>
              <p className="estimator-subtitle">
                Select your required days to compute a transparent instant estimate.
              </p>
            </div>
          </div>

          <div className="estimator-grid">
            {/* Controls */}
            <div className="estimator-controls">
              <div className="form-group">
                <label className="form-label">
                  Total Duration (Number of Days): <strong>{calcDays} Day{calcDays > 1 ? "s" : ""}</strong>
                </label>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={calcDays}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setCalcDays(val);
                    if (calcWeekendDays > val) setCalcWeekendDays(val);
                  }}
                  className="range-slider"
                />
                <div className="range-markers">
                  <span>1 Day</span>
                  <span>2 Days</span>
                  <span>3 Days</span>
                  <span>4 Days</span>
                  <span>5 Days</span>
                  <span>6 Days</span>
                  <span>7 Days</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Of these, how many fall on a Weekend (Sat/Sun)?
                </label>
                <div className="day-select-buttons">
                  {[...Array(calcDays + 1).keys()].map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={`btn-day-chip ${calcWeekendDays === num ? "active" : ""}`}
                      onClick={() => setCalcWeekendDays(num)}
                    >
                      {num} {num === 1 ? "day" : "days"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="estimator-checkbox-row">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={includeCleaning}
                    onChange={(e) => setIncludeCleaning(e.target.checked)}
                  />
                  <span className="checkmark" />
                  Include Comprehensive Post-Event Cleaning (₹{cleaningCharge.toLocaleString()})
                </label>
              </div>
            </div>

            {/* Live Calculation Receipt */}
            <div className="estimator-receipt">
              <h4 className="receipt-title">Itemized Estimation Summary</h4>

              <div className="receipt-row">
                <span>
                  Weekday Rate ({weekdayDays} day{weekdayDays !== 1 ? "s" : ""} × ₹{dailyPrice.toLocaleString()})
                </span>
                <span>₹{rentWeekday.toLocaleString()}</span>
              </div>

              {calcWeekendDays > 0 && (
                <div className="receipt-row">
                  <span>
                    Weekend Rate ({calcWeekendDays} day{calcWeekendDays !== 1 ? "s" : ""} × ₹{weekendPrice.toLocaleString()})
                  </span>
                  <span>₹{rentWeekend.toLocaleString()}</span>
                </div>
              )}

              {includeCleaning && (
                <div className="receipt-row">
                  <span>Sanitization & Post-Cleaning</span>
                  <span>₹{cleaningCharge.toLocaleString()}</span>
                </div>
              )}

              <div className="receipt-row">
                <span>Utility & Energy Support</span>
                <span>₹{additionalCharges.toLocaleString()}</span>
              </div>

              <div className="receipt-divider" />

              <div className="receipt-row receipt-subtotal">
                <span>Estimated Event Total:</span>
                <strong>₹{subtotal.toLocaleString()}</strong>
              </div>

              <div className="receipt-row receipt-deposit">
                <span>+ Refundable Security Deposit:</span>
                <span>₹{securityDeposit.toLocaleString()}</span>
              </div>

              <div className="receipt-divider" />

              <div className="receipt-row receipt-grand-total">
                <span>Total Budget Estimate:</span>
                <span className="grand-price">₹{grandTotalWithDeposit.toLocaleString()}</span>
              </div>

              <div className="receipt-advance-badge">
                <span>Advance Required to Block: <strong>₹{advanceAmount.toLocaleString()}</strong></span>
              </div>

              <div className="estimator-cta-wrap">
                <button
                  type="button"
                  className="btn btn-primary btn-block btn-lg"
                  onClick={handleStartBookingWithEst}
                >
                  Proceed with this Estimate
                  <ArrowRight size={18} />
                </button>
                <p className="estimator-disclaimer">
                  <Info size={13} /> Official confirmation is subject to owner approval & receipt of advance payment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
