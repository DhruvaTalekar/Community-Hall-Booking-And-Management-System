import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Info
} from "lucide-react";
import {
  getAllBookings,
  getBlockedDatesList,
  getMaintenanceList
} from "../../services/firebaseService";

export default function AvailabilitySection({
  pricing = {},
  onSelectDateRangeForBooking,
  preselectedDates = null
}) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1)); // October 2026
  const [startDate, setStartDate] = useState(preselectedDates?.startDate || "");
  const [endDate, setEndDate] = useState(preselectedDates?.endDate || "");
  const [bookings, setBookings] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real-time schedule
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [bks, blks, maint] = await Promise.all([
        getAllBookings(),
        getBlockedDatesList(),
        getMaintenanceList()
      ]);
      setBookings(bks);
      setBlockedDates(blks);
      setMaintenance(maint);
      setLoading(false);
    }
    loadData();
  }, []);

  // Sync if preselectedDates changes from external hero widget
  useEffect(() => {
    if (preselectedDates?.startDate) {
      setStartDate(preselectedDates.startDate);
      setEndDate(preselectedDates.endDate || preselectedDates.startDate);
      const parsed = new Date(preselectedDates.startDate);
      if (!isNaN(parsed.getTime())) {
        setCurrentDate(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
      }
    }
  }, [preselectedDates]);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  // Format date helper: YYYY-MM-DD
  const formatDateString = (y, m, d) => {
    const mm = String(m + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${y}-${mm}-${dd}`;
  };

  // Determine status of any day: "booked" | "maintenance" | "blocked" | "available"
  const getDayScheduleStatus = (dateStr) => {
    // 1. Check approved bookings
    const booked = bookings.find(
      (b) => b.status === "approved" && dateStr >= b.startDate && dateStr <= b.endDate
    );
    if (booked) {
      return { type: "booked", label: "Booked", details: booked.eventType };
    }

    // 2. Check blocked dates
    const blocked = blockedDates.find(
      (b) => dateStr >= b.startDate && dateStr <= b.endDate
    );
    if (blocked) {
      return { type: "blocked", label: "Blocked", details: blocked.reason };
    }

    // 3. Check maintenance
    const maint = maintenance.find(
      (m) => m.status !== "completed" && dateStr >= m.startDate && dateStr <= m.endDate
    );
    if (maint) {
      return { type: "maintenance", label: "Maintenance", details: maint.reason };
    }

    return { type: "available", label: "Available" };
  };

  // Day click handler for interactive range selection
  const handleDayClick = (dateStr, status) => {
    if (status.type !== "available") return;

    if (!startDate || (startDate && endDate)) {
      setStartDate(dateStr);
      setEndDate("");
    } else if (startDate && !endDate) {
      if (dateStr < startDate) {
        setStartDate(dateStr);
        setEndDate(startDate);
      } else {
        setEndDate(dateStr);
      }
    }
  };

  // Check if a date string falls inside the user's selected range
  const isSelected = (dateStr) => {
    if (!startDate) return false;
    if (!endDate) return dateStr === startDate;
    return dateStr >= startDate && dateStr <= endDate;
  };

  // Calculate Duration and Validation for the selected range
  const rangeInfo = useMemo(() => {
    if (!startDate) return null;
    const effectiveEnd = endDate || startDate;
    const startObj = new Date(startDate);
    const endObj = new Date(effectiveEnd);
    const diffTime = Math.abs(endObj - startObj);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive calendar days

    // Verify if any day in the range is NOT available
    let hasConflict = false;
    let conflictReason = "";

    const cur = new Date(startObj);
    while (cur <= endObj) {
      const dStr = cur.toISOString().split("T")[0];
      const status = getDayScheduleStatus(dStr);
      if (status.type !== "available") {
        hasConflict = true;
        conflictReason = `Date ${dStr} is ${status.label} (${status.details || "Unavailable"})`;
        break;
      }
      cur.setDate(cur.getDate() + 1);
    }

    // Calculate estimated base cost
    const baseDaily = Number(pricing.dailyPrice || 35000);
    const estimatedCost = diffDays * baseDaily;

    return {
      duration: diffDays,
      start: startDate,
      end: effectiveEnd,
      hasConflict,
      conflictReason,
      estimatedCost
    };
  }, [startDate, endDate, bookings, blockedDates, maintenance, pricing]);

  return (
    <section id="availability" className="section availability-section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Interactive Calendar</span>
          <h2 className="section-title">Hall Real-Time Availability</h2>
          <p className="section-subtitle">
            Check open dates in real time. Select your start and end dates to calculate duration and reserve immediately.
          </p>
        </div>

        {/* Legend */}
        <div className="calendar-legend-bar">
          <div className="legend-item">
            <span className="legend-dot dot-available" />
            <span>Green = Available</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot dot-booked" />
            <span>Red = Booked</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot dot-maintenance" />
            <span>Yellow = Maintenance / Blocked</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot dot-selected" />
            <span>Blue = Selected Dates</span>
          </div>
        </div>

        <div className="availability-layout-grid">
          {/* Calendar Card */}
          <div className="calendar-card card">
            {/* Calendar Controls */}
            <div className="calendar-header-nav">
              <div className="cal-title-wrap">
                <CalendarIcon className="cal-icon" size={22} />
                <h3 className="cal-month-title">
                  {monthNames[month]} {year}
                </h3>
              </div>

              <div className="cal-nav-buttons">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleToday}
                >
                  Current
                </button>
                <button
                  type="button"
                  className="cal-arrow-btn"
                  onClick={handlePrevMonth}
                  aria-label="Previous Month"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  className="cal-arrow-btn"
                  onClick={handleNextMonth}
                  aria-label="Next Month"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Weekday headers */}
            <div className="cal-grid-days-header">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span className="weekend-header">Sat</span>
              <span className="weekend-header">Sun</span>
            </div>

            {/* Calendar Days */}
            <div className="cal-grid-cells">
              {/* Empty leading padding */}
              {[...Array(firstDayIndex).keys()].map((i) => (
                <div key={`empty-${i}`} className="cal-cell cal-cell-empty" />
              ))}

              {/* Month Days */}
              {[...Array(daysInMonth).keys()].map((i) => {
                const dayNum = i + 1;
                const dateStr = formatDateString(year, month, dayNum);
                const status = getDayScheduleStatus(dateStr);
                const selected = isSelected(dateStr);
                const isStart = dateStr === startDate;
                const isEnd = dateStr === (endDate || startDate);

                let cellClass = "cal-cell-available";
                if (status.type === "booked") cellClass = "cal-cell-booked";
                if (status.type === "maintenance" || status.type === "blocked")
                  cellClass = "cal-cell-maintenance";
                if (selected) cellClass += " cal-cell-selected";
                if (isStart) cellClass += " cal-cell-start";
                if (isEnd) cellClass += " cal-cell-end";

                return (
                  <button
                    key={dateStr}
                    type="button"
                    className={`cal-cell ${cellClass}`}
                    disabled={status.type !== "available"}
                    onClick={() => handleDayClick(dateStr, status)}
                    title={`${dateStr}: ${status.label} ${status.details ? `(${status.details})` : ""}`}
                  >
                    <span className="cal-date-number">{dayNum}</span>
                    <span className="cal-status-tag">{status.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selection & Action Panel */}
          <div className="calendar-sidebar-card card">
            <h3 className="cal-sidebar-title">Booking Date Selection</h3>
            <p className="cal-sidebar-desc">
              Click any green date to start, then click the end date for multi-day events.
            </p>

            <div className="date-picker-inputs-group">
              <div className="form-group">
                <label className="form-label">Selected Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (endDate && e.target.value > endDate) setEndDate(e.target.value);
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Selected End Date</label>
                <input
                  type="date"
                  className="form-control"
                  min={startDate}
                  value={endDate || startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Range Evaluation Info */}
            {rangeInfo ? (
              <div className="cal-selection-summary">
                {rangeInfo.hasConflict ? (
                  <div className="conflict-alert-box">
                    <AlertCircle size={20} className="conflict-icon" />
                    <div>
                      <strong>Dates Unavailable</strong>
                      <p>{rangeInfo.conflictReason}</p>
                    </div>
                  </div>
                ) : (
                  <div className="success-selection-box">
                    <div className="selection-status-badge">
                      <CheckCircle2 size={16} /> Dates Available
                    </div>

                    <div className="selection-specs-list">
                      <div className="selection-spec-row">
                        <span>Duration:</span>
                        <strong>{rangeInfo.duration} Calendar Day{rangeInfo.duration > 1 ? "s" : ""}</strong>
                      </div>
                      <div className="selection-spec-row">
                        <span>Period:</span>
                        <span>{rangeInfo.start} to {rangeInfo.end}</span>
                      </div>
                      <div className="selection-spec-row">
                        <span>Estimated Base Rent:</span>
                        <strong>₹{rangeInfo.estimatedCost.toLocaleString()}</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary btn-block btn-lg"
                      onClick={() =>
                        onSelectDateRangeForBooking(
                          rangeInfo.start,
                          rangeInfo.end,
                          rangeInfo.duration
                        )
                      }
                    >
                      Book These Dates Now
                      <ArrowRight size={18} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="cal-prompt-empty">
                <Clock size={32} className="empty-clock-icon" />
                <p>Please click an available date on the calendar to begin your reservation.</p>
              </div>
            )}

            <div className="cal-guarantee-note">
              <Sparkles size={14} className="gold-icon" />
              <span>We never double-book dates. Once approved, your dates are 100% reserved.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
