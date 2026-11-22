import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  Printer,
  User,
  Bell,
  ArrowRight,
  Shield,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Download,
  Filter,
  Search,
  BookmarkCheck,
  RotateCcw
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  getUserBookings,
  getUserNotifications,
  markNotificationRead,
  updateBookingStatus
} from "../../services/firebaseService";

export default function UserPortal({
  hall = {},
  onOpenBooking,
  onGoToPublic,
  initialTab = "dashboard"
}) {
  const { currentUser, userProfile, updateProfileData } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState(initialTab); // 'dashboard' | 'bookings' | 'profile' | 'notifications'
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states for My Bookings
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Profile Edit states
  const [profileName, setProfileName] = useState(userProfile?.name || "");
  const [profilePhone, setProfilePhone] = useState(userProfile?.phone || "");
  const [profileAddress, setProfileAddress] = useState(userProfile?.address || "");

  const loadUserData = async () => {
    if (!currentUser?.uid) return;
    setLoading(true);
    const [bks, notifs] = await Promise.all([
      getUserBookings(currentUser.uid),
      getUserNotifications(currentUser.uid)
    ]);
    setBookings(bks);
    setNotifications(notifs);
    setLoading(false);
  };

  useEffect(() => {
    loadUserData();
  }, [currentUser]);

  useEffect(() => {
    if (userProfile) {
      setProfileName(userProfile.name || "");
      setProfilePhone(userProfile.phone || "");
      setProfileAddress(userProfile.address || "");
    }
  }, [userProfile]);

  // Statistics
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const approvedCount = bookings.filter((b) => b.status === "approved").length;
  const completedCount = bookings.filter((b) => b.status === "completed").length;
  const cancelledCount = bookings.filter((b) => b.status === "cancelled").length;

  // Next Upcoming Approved or Pending Booking
  const upcomingBooking = bookings
    .filter((b) => b.status === "approved" || b.status === "pending")
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0];

  // Filtered bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    const matchesSearch =
      (b.bookingRef || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.eventType || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.startDate || "").includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  // Handle Cancellation Request
  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      await updateBookingStatus(
        selectedBooking.id,
        "cancelled",
        "",
        cancellationReason || "Cancelled by customer request"
      );
      addToast("Your booking has been cancelled.", "info");
      setShowCancelModal(false);
      setSelectedBooking(null);
      await loadUserData();
    } catch (e) {
      addToast("Could not cancel booking: " + e.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Mark Notification Read
  const handleMarkNotif = async (notifId) => {
    if (!currentUser) return;
    await markNotificationRead(currentUser.uid, notifId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
  };

  // Handle Profile Update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await updateProfileData({
        name: profileName,
        phone: profilePhone,
        address: profileAddress
      });
      addToast("Profile details updated successfully.", "success");
    } catch (e) {
      addToast("Failed to update profile: " + e.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="user-portal-container section">
      <div className="container">
        {/* Portal Header */}
        <div className="portal-header-card card">
          <div className="portal-user-meta">
            <div className="portal-user-avatar">
              {userProfile?.name?.charAt(0) || currentUser?.email?.charAt(0) || "U"}
            </div>
            <div>
              <span className="portal-welcome-tag">Customer Portal</span>
              <h2 className="portal-user-name">Welcome, {userProfile?.name || "Valued Guest"}</h2>
              <p className="portal-user-email">{currentUser?.email} • {userProfile?.phone || "Phone not added"}</p>
            </div>
          </div>

          <div className="portal-header-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={onOpenBooking}
            >
              <BookmarkCheck size={18} />
              Book The Hall
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onGoToPublic}
            >
              Back to Website
            </button>
          </div>
        </div>

        {/* Portal Tab Navigation */}
        <div className="portal-nav-tabs">
          <button
            type="button"
            className={`portal-tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard Overview
          </button>
          <button
            type="button"
            className={`portal-tab-btn ${activeTab === "bookings" ? "active" : ""}`}
            onClick={() => setActiveTab("bookings")}
          >
            My Bookings ({bookings.length})
          </button>
          <button
            type="button"
            className={`portal-tab-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            Profile & Settings
          </button>
          <button
            type="button"
            className={`portal-tab-btn ${activeTab === "notifications" ? "active" : ""}`}
            onClick={() => setActiveTab("notifications")}
          >
            Notifications ({notifications.filter((n) => !n.read).length})
          </button>
        </div>

        {/* TAB 1: DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="portal-tab-content animate-slide-in">
            {/* KPI Cards Grid */}
            <div className="portal-stats-grid">
              <div className="portal-stat-card card">
                <div className="p-stat-icon p-icon-blue"><Calendar size={22} /></div>
                <div className="p-stat-info">
                  <span className="p-stat-val">{bookings.length}</span>
                  <span className="p-stat-label">Total Reservations</span>
                </div>
              </div>

              <div className="portal-stat-card card">
                <div className="p-stat-icon p-icon-yellow"><Clock size={22} /></div>
                <div className="p-stat-info">
                  <span className="p-stat-val">{pendingCount}</span>
                  <span className="p-stat-label">Pending Approval</span>
                </div>
              </div>

              <div className="portal-stat-card card">
                <div className="p-stat-icon p-icon-green"><CheckCircle2 size={22} /></div>
                <div className="p-stat-info">
                  <span className="p-stat-val">{approvedCount}</span>
                  <span className="p-stat-label">Approved & Confirmed</span>
                </div>
              </div>

              <div className="portal-stat-card card">
                <div className="p-stat-icon p-icon-gray"><XCircle size={22} /></div>
                <div className="p-stat-info">
                  <span className="p-stat-val">{cancelledCount}</span>
                  <span className="p-stat-label">Cancelled / Declined</span>
                </div>
              </div>
            </div>

            {/* Upcoming Booking Feature Card */}
            {upcomingBooking ? (
              <div className="upcoming-booking-card card">
                <div className="upcoming-card-header">
                  <span className="upcoming-badge">
                    <Calendar size={14} /> Upcoming Hall Event
                  </span>
                  <span className={`badge badge-${upcomingBooking.status}`}>
                    {upcomingBooking.status.toUpperCase()}
                  </span>
                </div>

                <div className="upcoming-card-body">
                  <div className="upcoming-event-info">
                    <h3>{upcomingBooking.eventType}</h3>
                    <p className="upcoming-dates-highlight">
                      {upcomingBooking.startDate} to {upcomingBooking.endDate} ({upcomingBooking.numberOfDays} Days)
                    </p>
                    <div className="upcoming-details-row">
                      <span>Guests: <strong>{upcomingBooking.guestCount}</strong></span>
                      <span>Slot: <strong>{upcomingBooking.preferredTime || "Full Day"}</strong></span>
                      <span>Ref: <strong>{upcomingBooking.bookingRef || upcomingBooking.id}</strong></span>
                    </div>
                  </div>

                  <div className="upcoming-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setSelectedBooking(upcomingBooking);
                        setShowConfirmationModal(true);
                      }}
                    >
                      <FileText size={16} />
                      View Confirmation Slip
                    </button>
                    {upcomingBooking.status === "pending" && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => {
                          setSelectedBooking(upcomingBooking);
                          setShowCancelModal(true);
                        }}
                      >
                        Cancel Request
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-dashboard-card card">
                <Calendar size={40} className="empty-icon" />
                <h3>No upcoming active bookings</h3>
                <p>Plan your next family celebration, wedding, or corporate event with us.</p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onOpenBooking}
                >
                  <BookmarkCheck size={16} /> Check Dates & Book Now
                </button>
              </div>
            )}

            {/* Quick Actions Row */}
            <div className="dashboard-quick-actions-grid">
              <div
                className="quick-card card card-hover"
                onClick={() => setActiveTab("bookings")}
              >
                <div className="quick-icon-wrap"><FileText size={22} /></div>
                <h4>Manage Bookings</h4>
                <p>Track request statuses, download confirmations, or view history.</p>
              </div>

              <div
                className="quick-card card card-hover"
                onClick={onOpenBooking}
              >
                <div className="quick-icon-wrap"><Calendar size={22} /></div>
                <h4>Online Hall Reservation</h4>
                <p>Select event dates, verify live availability, and request a slot.</p>
              </div>

              <div
                className="quick-card card card-hover"
                onClick={() => setActiveTab("profile")}
              >
                <div className="quick-icon-wrap"><User size={22} /></div>
                <h4>Account Profile</h4>
                <p>Update phone number, postal address, and contact preferences.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY BOOKINGS */}
        {activeTab === "bookings" && (
          <div className="portal-tab-content animate-slide-in">
            {/* Filter & Search Bar */}
            <div className="bookings-toolbar card">
              <div className="toolbar-search">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by ID, event type or date..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="toolbar-search-input"
                />
              </div>

              <div className="toolbar-filter-tabs">
                {["all", "pending", "approved", "completed", "cancelled", "rejected"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`toolbar-chip ${statusFilter === st ? "active" : ""}`}
                    onClick={() => setStatusFilter(st)}
                  >
                    {st.charAt(0).toUpperCase() + st.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Bookings List */}
            {filteredBookings.length > 0 ? (
              <div className="user-bookings-grid">
                {filteredBookings.map((b) => (
                  <div key={b.id} className="user-booking-card card card-hover">
                    <div className="ubooking-header">
                      <div className="ubooking-id-tag">
                        Ref: <strong>{b.bookingRef || b.id}</strong>
                      </div>
                      <span className={`badge badge-${b.status}`}>
                        {b.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="ubooking-body">
                      <h3 className="ubooking-event-title">{b.eventType}</h3>
                      <div className="ubooking-specs-grid">
                        <div className="ubooking-spec-item">
                          <Calendar size={15} />
                          <span>
                            {b.startDate} to {b.endDate} (<strong>{b.numberOfDays} Day{b.numberOfDays > 1 ? "s" : ""}</strong>)
                          </span>
                        </div>
                        <div className="ubooking-spec-item">
                          <User size={15} />
                          <span>Expected Guests: <strong>{b.guestCount}</strong></span>
                        </div>
                        <div className="ubooking-spec-item">
                          <Clock size={15} />
                          <span>Slot: {b.preferredTime || "Full Day"}</span>
                        </div>
                        <div className="ubooking-spec-item">
                          <Shield size={15} />
                          <span>Estimated Amount: <strong>₹{Number(b.estimatedAmount || 0).toLocaleString()}</strong></span>
                        </div>
                      </div>

                      {b.adminNotes && (
                        <div className="ubooking-admin-note">
                          <span>Owner Note:</span> {b.adminNotes}
                        </div>
                      )}

                      {b.cancellationReason && (
                        <div className="ubooking-cancel-note">
                          <span>Reason:</span> {b.cancellationReason}
                        </div>
                      )}
                    </div>

                    <div className="ubooking-footer">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setSelectedBooking(b);
                          setShowConfirmationModal(true);
                        }}
                      >
                        <FileText size={14} />
                        View Confirmation Slip
                      </button>

                      {b.status === "pending" && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            setSelectedBooking(b);
                            setShowCancelModal(true);
                          }}
                        >
                          Cancel Request
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-bookings-box card">
                <Calendar size={48} className="empty-icon" />
                <h3>No bookings found</h3>
                <p>You do not have any reservations matching this filter.</p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onOpenBooking}
                >
                  Create Booking Request
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: USER PROFILE */}
        {activeTab === "profile" && (
          <div className="portal-tab-content animate-slide-in">
            <div className="profile-card card">
              <h3 className="profile-heading">Contact & Organizer Profile</h3>
              <p className="profile-sub">
                These details will automatically pre-fill your online reservation requests.
              </p>

              <form onSubmit={handleSaveProfile} className="profile-form">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Email Address (Managed by Auth)</label>
                    <input
                      type="email"
                      className="form-control"
                      disabled
                      value={currentUser?.email || ""}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+91 98765 00000"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Residential Address</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Street, City, Postal Code"
                    value={profileAddress}
                    onChange={(e) => setProfileAddress(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? "Saving..." : "Save Profile Updates"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: NOTIFICATIONS */}
        {activeTab === "notifications" && (
          <div className="portal-tab-content animate-slide-in">
            <div className="notifications-card card">
              <h3 className="notifs-heading">Activity & Status Alerts</h3>

              {notifications.length > 0 ? (
                <div className="notifs-list">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`notif-item ${!n.read ? "notif-unread" : ""}`}
                      onClick={() => !n.read && handleMarkNotif(n.id)}
                    >
                      <div className="notif-dot-wrap">
                        <span className={`notif-bullet notif-type-${n.type || "info"}`} />
                      </div>
                      <div className="notif-content-wrap">
                        <div className="notif-title-row">
                          <h4 className="notif-title">{n.title}</h4>
                          <span className="notif-time">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="notif-msg">{n.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-notifs">
                  <Bell size={40} className="empty-icon" />
                  <p>No alerts or notifications yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CONFIRMATION / PRINTABLE SLIP MODAL (PRD Section 23) */}
      {showConfirmationModal && selectedBooking && (
        <div className="modal-backdrop" onClick={() => setShowConfirmationModal(false)}>
          <div className="modal-content modal-content-lg" onClick={(e) => e.stopPropagation()}>
            <div className="no-print modal-header-confirmation">
              <h3>Official Booking Confirmation Slip</h3>
              <div className="confirmation-modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => window.print()}
                >
                  <Printer size={16} /> Print Confirmation
                </button>
                <button
                  type="button"
                  className="modal-close-icon"
                  onClick={() => setShowConfirmationModal(false)}
                >
                  <XCircle size={22} />
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="printable-document printable-letterhead">
              {/* Header Letterhead */}
              <div className="doc-letterhead">
                <div className="doc-brand">
                  <div className="doc-brand-logo">GH</div>
                  <div>
                    <h2 className="doc-hall-name">{hall.name || "Grand Horizon Community Hall"}</h2>
                    <p className="doc-hall-address">{hall.contact?.address || "Civic Enclave, City Ring Road"}</p>
                    <p className="doc-hall-contact">Phone: {hall.contact?.phone} | Email: {hall.contact?.email}</p>
                  </div>
                </div>

                <div className="doc-ref-box">
                  <div className="doc-status-stamp">
                    {selectedBooking.status.toUpperCase()}
                  </div>
                  <div className="doc-ref-num">
                    Ref: <strong>{selectedBooking.bookingRef || selectedBooking.id}</strong>
                  </div>
                  <div className="doc-date">
                    Date: {new Date(selectedBooking.createdAt || Date.now()).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <hr className="doc-divider" />

              {/* Customer & Event Details Table */}
              <div className="doc-details-grid">
                <div className="doc-detail-box">
                  <h4>Organizer / Host Information</h4>
                  <p><strong>Name:</strong> {selectedBooking.customerName}</p>
                  <p><strong>Phone:</strong> {selectedBooking.customerPhone}</p>
                  <p><strong>Email:</strong> {selectedBooking.customerEmail}</p>
                  <p><strong>Address:</strong> {selectedBooking.customerAddress || "N/A"}</p>
                </div>

                <div className="doc-detail-box">
                  <h4>Event & Reservation Specifications</h4>
                  <p><strong>Occasion:</strong> {selectedBooking.eventType}</p>
                  <p><strong>Event Dates:</strong> {selectedBooking.startDate} to {selectedBooking.endDate}</p>
                  <p><strong>Total Duration:</strong> {selectedBooking.numberOfDays} Calendar Day(s)</p>
                  <p><strong>Guest Count:</strong> {selectedBooking.guestCount} Persons</p>
                  <p><strong>Time Slot:</strong> {selectedBooking.preferredTime || "Full Day (8:00 AM - 11:00 PM)"}</p>
                </div>
              </div>

              {/* Financial Estimates Breakdown */}
              <div className="doc-financials-table">
                <h4>Financial Summary</h4>
                <table className="doc-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Terms</th>
                      <th className="text-right">Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Hall Rental Fee ({selectedBooking.numberOfDays} Days)</td>
                      <td>Daily Tariff</td>
                      <td className="text-right">₹{Number(selectedBooking.estimatedRent || selectedBooking.estimatedAmount || 0).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td>Post-Event Cleaning & Sanitization</td>
                      <td>Standard Service</td>
                      <td className="text-right">₹{Number(selectedBooking.cleaningCharge || 3000).toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td>Refundable Security Deposit</td>
                      <td>Refundable post-inspection</td>
                      <td className="text-right">₹{Number(selectedBooking.securityDeposit || 10000).toLocaleString()}</td>
                    </tr>
                    <tr className="doc-table-total">
                      <td colSpan="2"><strong>Total Event Value (Incl. Deposit)</strong></td>
                      <td className="text-right"><strong>₹{Number(selectedBooking.estimatedAmount || 0).toLocaleString()}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Terms and Signatures */}
              <div className="doc-terms-box">
                <h5>Essential Hall Regulations & Terms</h5>
                <ol>
                  <li>Bookings are confirmed only upon receipt of the advance booking deposit and owner authorization.</li>
                  <li>Civic sound decibel limits apply; amplification systems must conclude by 10:30 PM.</li>
                  <li>Security deposits are refunded within 48 hours post-event, subject to cleanliness inspection.</li>
                </ol>
              </div>

              <div className="doc-signatures-row">
                <div className="doc-sig-cell">
                  <div className="sig-line" />
                  <p>Authorized Signature (Hall Administration)</p>
                </div>
                <div className="doc-sig-cell">
                  <div className="sig-line" />
                  <p>Organizer Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CANCELLATION MODAL */}
      {showCancelModal && selectedBooking && (
        <div className="modal-backdrop" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Request Booking Cancellation</h3>
              <p>Please note that cancellation refund eligibility is subject to the hall's policy.</p>
            </div>

            <div className="modal-body">
              <p>
                Are you sure you want to cancel booking <strong>{selectedBooking.bookingRef || selectedBooking.id}</strong> for <strong>{selectedBooking.eventType}</strong> on <strong>{selectedBooking.startDate}</strong>?
              </p>

              <div className="form-group" style={{ marginTop: "1rem" }}>
                <label className="form-label">Reason for Cancellation</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="e.g. Event postponed, personal emergency..."
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                />
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCancelModal(false)}
                >
                  Keep Booking
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleConfirmCancel}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Cancelling..." : "Confirm Cancellation"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
