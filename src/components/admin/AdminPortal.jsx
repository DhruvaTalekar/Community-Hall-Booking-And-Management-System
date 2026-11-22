import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  Building,
  DollarSign,
  Sparkles,
  Images,
  CalendarX,
  Wrench,
  Users,
  MessageSquare,
  FileBarChart,
  Settings,
  LogOut,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Trash2,
  Edit,
  Eye,
  Filter,
  Save,
  ArrowRight,
  ShieldCheck,
  Check,
  X
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  getHallInfo,
  updateHallInfo,
  getPricingInfo,
  updatePricingInfo,
  getFacilitiesList,
  saveFacilityItem,
  removeFacilityItem,
  getGalleryList,
  addGalleryItem,
  deleteGalleryItem,
  getAllBookings,
  updateBookingStatus,
  updateBookingPayment,
  getBlockedDatesList,
  addBlockedDate,
  removeBlockedDate,
  getMaintenanceList,
  addMaintenanceSlot,
  removeMaintenanceSlot,
  getReviewsList,
  updateReviewStatus,
  deleteReviewItem,
  getRulesAndPolicies,
  updateRulesAndPolicies
} from "../../services/firebaseService";

export default function AdminPortal({ onGoToPublic, onHallUpdated, onPricingUpdated }) {
  const { currentUser, userProfile, logoutUser } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  // Data states
  const [hallData, setHallData] = useState({});
  const [pricingData, setPricingData] = useState({});
  const [facilities, setFacilities] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [rules, setRules] = useState([]);

  // Booking filtering & actions
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [adminNotesInput, setAdminNotesInput] = useState("");
  const [savingAction, setSavingAction] = useState(false);

  // New Items forms
  const [newFacility, setNewFacility] = useState({ name: "", description: "", icon: "Sparkles", order: 1 });
  const [showNewFacilityModal, setShowNewFacilityModal] = useState(false);

  const [newImage, setNewImage] = useState({ title: "", description: "", imageUrl: "", category: "Ballroom", order: 1 });
  const [showNewImageModal, setShowNewImageModal] = useState(false);

  const [newBlockDate, setNewBlockDate] = useState({ startDate: "", endDate: "", reason: "Private Hall Event" });
  const [showNewBlockModal, setShowNewBlockModal] = useState(false);

  const [newMaint, setNewMaint] = useState({ startDate: "", endDate: "", reason: "HVAC & Lighting Maintenance", description: "" });
  const [showNewMaintModal, setShowNewMaintModal] = useState(false);

  // Load all operational data
  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [h, p, f, g, b, bl, m, r, rls] = await Promise.all([
        getHallInfo(),
        getPricingInfo(),
        getFacilitiesList(),
        getGalleryList(),
        getAllBookings(),
        getBlockedDatesList(),
        getMaintenanceList(),
        getReviewsList(false), // all reviews including pending
        getRulesAndPolicies()
      ]);
      setHallData(h);
      setPricingData(p);
      setFacilities(f);
      setGallery(g);
      setBookings(b);
      setBlockedDates(bl);
      setMaintenance(m);
      setReviews(r);
      setRules(rls);
    } catch (e) {
      console.error("Admin load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  // Quick Stats
  const totalBookingsCount = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const approvedBookings = bookings.filter((b) => b.status === "approved");
  const totalEstimatedRevenue = approvedBookings.reduce((sum, b) => sum + (Number(b.estimatedAmount) || 0), 0);

  // Booking filtering
  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = bookingStatusFilter === "all" || b.status === bookingStatusFilter;
    const matchesSearch =
      (b.bookingRef || "").toLowerCase().includes(bookingSearch.toLowerCase()) ||
      (b.customerName || "").toLowerCase().includes(bookingSearch.toLowerCase()) ||
      (b.customerEmail || "").toLowerCase().includes(bookingSearch.toLowerCase()) ||
      (b.customerPhone || "").includes(bookingSearch) ||
      (b.eventType || "").toLowerCase().includes(bookingSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Handle Approve Booking
  const handleApproveBooking = async (booking) => {
    setSavingAction(true);
    try {
      await updateBookingStatus(booking.id, "approved", adminNotesInput || "Approved by Administration");
      addToast(`Booking ${booking.bookingRef || booking.id} approved! Dates reserved.`, "success");
      setAdminNotesInput("");
      setSelectedBooking(null);
      await loadAllAdminData();
    } catch (e) {
      addToast("Failed to approve: " + e.message, "error");
    } finally {
      setSavingAction(false);
    }
  };

  // Handle Reject Booking
  const handleRejectBooking = async () => {
    if (!selectedBooking) return;
    setSavingAction(true);
    try {
      await updateBookingStatus(
        selectedBooking.id,
        "rejected",
        adminNotesInput,
        rejectReason || "Selected dates unavailable"
      );
      addToast(`Booking ${selectedBooking.bookingRef || selectedBooking.id} rejected.`, "info");
      setShowRejectModal(false);
      setSelectedBooking(null);
      setRejectReason("");
      await loadAllAdminData();
    } catch (e) {
      addToast("Failed to reject: " + e.message, "error");
    } finally {
      setSavingAction(false);
    }
  };

  // Handle Payment Status Toggle
  const handlePaymentStatusChange = async (bookingId, newStatus) => {
    try {
      await updateBookingPayment(bookingId, newStatus);
      addToast("Payment status recorded.", "success");
      await loadAllAdminData();
    } catch (e) {
      addToast("Could not update payment: " + e.message, "error");
    }
  };

  // Handle Hall Save
  const handleSaveHall = async (e) => {
    e.preventDefault();
    setSavingAction(true);
    try {
      await updateHallInfo(hallData);
      addToast("Hall details and contact information updated successfully.", "success");
      if (onHallUpdated) onHallUpdated(hallData);
    } catch (e) {
      addToast("Failed to update hall: " + e.message, "error");
    } finally {
      setSavingAction(false);
    }
  };

  // Handle Pricing Save
  const handleSavePricing = async (e) => {
    e.preventDefault();
    setSavingAction(true);
    try {
      await updatePricingInfo(pricingData);
      addToast("Pricing structure updated successfully.", "success");
      if (onPricingUpdated) onPricingUpdated(pricingData);
    } catch (e) {
      addToast("Failed to update pricing: " + e.message, "error");
    } finally {
      setSavingAction(false);
    }
  };

  // Handle Facility Add/Delete
  const handleAddFacility = async (e) => {
    e.preventDefault();
    try {
      await saveFacilityItem(newFacility);
      addToast("Facility added.", "success");
      setShowNewFacilityModal(false);
      setNewFacility({ name: "", description: "", icon: "Sparkles", order: facilities.length + 1 });
      await loadAllAdminData();
    } catch (e) {
      addToast("Error adding facility: " + e.message, "error");
    }
  };

  const handleDeleteFacility = async (id) => {
    if (!window.confirm("Remove this facility?")) return;
    await removeFacilityItem(id);
    addToast("Facility removed.", "info");
    await loadAllAdminData();
  };

  // Handle Gallery Add/Delete
  const handleAddImage = async (e) => {
    e.preventDefault();
    if (!newImage.imageUrl) {
      addToast("Please provide an image URL.", "warning");
      return;
    }
    try {
      await addGalleryItem(newImage);
      addToast("Image added to gallery.", "success");
      setShowNewImageModal(false);
      setNewImage({ title: "", description: "", imageUrl: "", category: "Ballroom", order: gallery.length + 1 });
      await loadAllAdminData();
    } catch (e) {
      addToast("Error adding image: " + e.message, "error");
    }
  };

  const handleDeleteGallery = async (id) => {
    if (!window.confirm("Delete this gallery image?")) return;
    await deleteGalleryItem(id);
    addToast("Image removed.", "info");
    await loadAllAdminData();
  };

  // Handle Block Date Add/Remove
  const handleAddBlockDate = async (e) => {
    e.preventDefault();
    if (!newBlockDate.startDate || !newBlockDate.endDate) return;
    try {
      await addBlockedDate(newBlockDate);
      addToast("Dates successfully blocked on availability calendar.", "success");
      setShowNewBlockModal(false);
      setNewBlockDate({ startDate: "", endDate: "", reason: "Private Hall Event" });
      await loadAllAdminData();
    } catch (e) {
      addToast("Could not block dates: " + e.message, "error");
    }
  };

  const handleDeleteBlock = async (id) => {
    await removeBlockedDate(id);
    addToast("Blocked date released.", "info");
    await loadAllAdminData();
  };

  // Handle Maintenance Add/Remove
  const handleAddMaintenance = async (e) => {
    e.preventDefault();
    if (!newMaint.startDate || !newMaint.endDate) return;
    try {
      await addMaintenanceSlot(newMaint);
      addToast("Maintenance schedule recorded.", "success");
      setShowNewMaintModal(false);
      setNewMaint({ startDate: "", endDate: "", reason: "HVAC & Lighting Maintenance", description: "" });
      await loadAllAdminData();
    } catch (e) {
      addToast("Could not record maintenance: " + e.message, "error");
    }
  };

  const handleDeleteMaint = async (id) => {
    await removeMaintenanceSlot(id);
    addToast("Maintenance schedule removed.", "info");
    await loadAllAdminData();
  };

  // Handle Review Moderation
  const handleModerateReview = async (id, status) => {
    await updateReviewStatus(id, status);
    addToast(`Review marked as ${status}.`, "info");
    await loadAllAdminData();
  };

  const handleDeleteReview = async (id) => {
    await deleteReviewItem(id);
    addToast("Review deleted.", "info");
    await loadAllAdminData();
  };

  return (
    <div className="admin-portal-wrapper">
      {/* Admin Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-brand-icon">GH</div>
          <div className="admin-brand-text">
            <h3>Admin Portal</h3>
            <span>Management Console</span>
          </div>
        </div>

        <nav className="admin-nav-menu">
          <button
            type="button"
            className={`admin-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === "bookings" ? "active" : ""}`}
            onClick={() => setActiveTab("bookings")}
          >
            <CalendarDays size={18} />
            <span>Bookings</span>
            {pendingBookings.length > 0 && (
              <span className="admin-badge-count">{pendingBookings.length}</span>
            )}
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === "hall" ? "active" : ""}`}
            onClick={() => setActiveTab("hall")}
          >
            <Building size={18} />
            <span>Hall Information</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === "pricing" ? "active" : ""}`}
            onClick={() => setActiveTab("pricing")}
          >
            <DollarSign size={18} />
            <span>Pricing & Tariffs</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === "facilities" ? "active" : ""}`}
            onClick={() => setActiveTab("facilities")}
          >
            <Sparkles size={18} />
            <span>Facilities</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === "gallery" ? "active" : ""}`}
            onClick={() => setActiveTab("gallery")}
          >
            <Images size={18} />
            <span>Photo Gallery</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === "blocked" ? "active" : ""}`}
            onClick={() => setActiveTab("blocked")}
          >
            <CalendarX size={18} />
            <span>Block Dates</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === "maintenance" ? "active" : ""}`}
            onClick={() => setActiveTab("maintenance")}
          >
            <Wrench size={18} />
            <span>Maintenance</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === "reviews" ? "active" : ""}`}
            onClick={() => setActiveTab("reviews")}
          >
            <MessageSquare size={18} />
            <span>Review Moderation</span>
          </button>

          <button
            type="button"
            className={`admin-nav-item ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            <FileBarChart size={18} />
            <span>Analytics & Reports</span>
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <button
            type="button"
            className="admin-footer-btn"
            onClick={onGoToPublic}
          >
            <ArrowRight size={16} /> Public Website
          </button>
          <button
            type="button"
            className="admin-footer-btn logout"
            onClick={async () => {
              await logoutUser();
              onGoToPublic();
            }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Admin Content Body */}
      <main className="admin-main-content">
        {/* Top Header Bar */}
        <header className="admin-topbar">
          <div className="admin-topbar-title">
            <h2>
              {activeTab === "dashboard" && "Executive Dashboard"}
              {activeTab === "bookings" && "Booking Requests & Approvals"}
              {activeTab === "hall" && "Hall Information & Profile"}
              {activeTab === "pricing" && "Pricing & Charges Configuration"}
              {activeTab === "facilities" && "Amenities & Facilities"}
              {activeTab === "gallery" && "Photo Gallery Management"}
              {activeTab === "blocked" && "Blocked Dates Management"}
              {activeTab === "maintenance" && "Maintenance Schedule"}
              {activeTab === "reviews" && "Customer Review Moderation"}
              {activeTab === "reports" && "Performance & Revenue Reports"}
            </h2>
          </div>

          <div className="admin-topbar-profile">
            <div className="admin-avatar">A</div>
            <div>
              <p className="admin-name">{userProfile?.name || "Administrator"}</p>
              <span className="admin-role">Super Admin</span>
            </div>
          </div>
        </header>

        <div className="admin-page-scrollable">
          {/* TAB 1: ADMIN DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="admin-dashboard-view animate-slide-in">
              {/* KPI Cards */}
              <div className="admin-kpi-grid">
                <div className="admin-kpi-card card">
                  <div className="kpi-icon-box kpi-blue"><CalendarDays size={24} /></div>
                  <div className="kpi-info">
                    <span className="kpi-val">{totalBookingsCount}</span>
                    <span className="kpi-title">Total Bookings</span>
                  </div>
                </div>

                <div className="admin-kpi-card card">
                  <div className="kpi-icon-box kpi-yellow"><Clock size={24} /></div>
                  <div className="kpi-info">
                    <span className="kpi-val">{pendingBookings.length}</span>
                    <span className="kpi-title">Pending Review</span>
                  </div>
                </div>

                <div className="admin-kpi-card card">
                  <div className="kpi-icon-box kpi-green"><CheckCircle size={24} /></div>
                  <div className="kpi-info">
                    <span className="kpi-val">{approvedBookings.length}</span>
                    <span className="kpi-title">Confirmed & Approved</span>
                  </div>
                </div>

                <div className="admin-kpi-card card">
                  <div className="kpi-icon-box kpi-gold"><DollarSign size={24} /></div>
                  <div className="kpi-info">
                    <span className="kpi-val">₹{totalEstimatedRevenue.toLocaleString()}</span>
                    <span className="kpi-title">Approved Pipeline Value</span>
                  </div>
                </div>
              </div>

              {/* Pending Approvals Table */}
              <div className="admin-section-box card">
                <div className="admin-box-header">
                  <h3>Pending Booking Requests ({pendingBookings.length})</h3>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setBookingStatusFilter("pending");
                      setActiveTab("bookings");
                    }}
                  >
                    View All Bookings
                  </button>
                </div>

                {pendingBookings.length > 0 ? (
                  <div className="admin-table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Ref ID</th>
                          <th>Customer</th>
                          <th>Event</th>
                          <th>Dates</th>
                          <th>Days</th>
                          <th>Guests</th>
                          <th>Est. Amount</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingBookings.slice(0, 5).map((b) => (
                          <tr key={b.id}>
                            <td><strong>{b.bookingRef || b.id}</strong></td>
                            <td>
                              <div className="table-cust-cell">
                                <strong>{b.customerName}</strong>
                                <span>{b.customerPhone}</span>
                              </div>
                            </td>
                            <td>{b.eventType}</td>
                            <td>{b.startDate} to {b.endDate}</td>
                            <td>{b.numberOfDays}</td>
                            <td>{b.guestCount}</td>
                            <td>₹{Number(b.estimatedAmount || 0).toLocaleString()}</td>
                            <td>
                              <div className="table-actions-cell">
                                <button
                                  type="button"
                                  className="btn btn-success btn-xs"
                                  onClick={() => handleApproveBooking(b)}
                                  title="Approve"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-danger btn-xs"
                                  onClick={() => {
                                    setSelectedBooking(b);
                                    setShowRejectModal(true);
                                  }}
                                  title="Reject"
                                >
                                  Reject
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-xs"
                                  onClick={() => setSelectedBooking(b)}
                                  title="View Details"
                                >
                                  <Eye size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="empty-table-state">
                    <CheckCircle size={36} className="empty-check" />
                    <p>All booking requests are processed. No pending items!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: BOOKING MANAGEMENT */}
          {activeTab === "bookings" && (
            <div className="admin-bookings-view animate-slide-in">
              {/* Search & Filter Toolbar */}
              <div className="admin-filter-bar card">
                <div className="filter-search-box">
                  <Search size={18} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search customer name, phone, email, reference ID..."
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    className="admin-search-input"
                  />
                </div>

                <div className="filter-status-chips">
                  {["all", "pending", "approved", "completed", "cancelled", "rejected"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      className={`filter-chip ${bookingStatusFilter === st ? "active" : ""}`}
                      onClick={() => setBookingStatusFilter(st)}
                    >
                      {st.charAt(0).toUpperCase() + st.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bookings Table */}
              <div className="admin-section-box card">
                <div className="admin-table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Ref</th>
                        <th>Customer</th>
                        <th>Event</th>
                        <th>Dates</th>
                        <th>Duration</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Payment</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((b) => (
                        <tr key={b.id}>
                          <td><strong>{b.bookingRef || b.id}</strong></td>
                          <td>
                            <div className="table-cust-cell">
                              <strong>{b.customerName}</strong>
                              <span>{b.customerPhone}</span>
                              <span className="cust-email">{b.customerEmail}</span>
                            </div>
                          </td>
                          <td>{b.eventType} ({b.guestCount}p)</td>
                          <td>{b.startDate} to {b.endDate}</td>
                          <td>{b.numberOfDays} Days</td>
                          <td>₹{Number(b.estimatedAmount || 0).toLocaleString()}</td>
                          <td>
                            <span className={`badge badge-${b.status}`}>
                              {b.status}
                            </span>
                          </td>
                          <td>
                            <select
                              className="table-select-payment"
                              value={b.paymentStatus || "not_paid"}
                              onChange={(e) => handlePaymentStatusChange(b.id, e.target.value)}
                            >
                              <option value="not_paid">Not Paid</option>
                              <option value="advance_paid">Advance Paid</option>
                              <option value="fully_paid">Fully Paid</option>
                            </select>
                          </td>
                          <td>
                            <div className="table-actions-cell">
                              <button
                                type="button"
                                className="btn btn-secondary btn-xs"
                                onClick={() => setSelectedBooking(b)}
                              >
                                View
                              </button>
                              {b.status === "pending" && (
                                <>
                                  <button
                                    type="button"
                                    className="btn btn-success btn-xs"
                                    onClick={() => handleApproveBooking(b)}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-danger btn-xs"
                                    onClick={() => {
                                      setSelectedBooking(b);
                                      setShowRejectModal(true);
                                    }}
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredBookings.length === 0 && (
                  <div className="empty-table-state">
                    <p>No bookings match the specified filters.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: HALL INFORMATION & PROFILE */}
          {activeTab === "hall" && (
            <div className="admin-hall-view animate-slide-in">
              <form onSubmit={handleSaveHall} className="card admin-form-card">
                <div className="form-card-header">
                  <h3>Hall Details & Public Information</h3>
                  <p>Changes saved here automatically update the public website and contact pages.</p>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Hall Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={hallData.name || ""}
                      onChange={(e) => setHallData({ ...hallData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Hall Size</label>
                    <input
                      type="text"
                      className="form-control"
                      value={hallData.hallSize || ""}
                      onChange={(e) => setHallData({ ...hallData, hallSize: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Hero Tagline</label>
                  <input
                    type="text"
                    className="form-control"
                    value={hallData.tagline || ""}
                    onChange={(e) => setHallData({ ...hallData, tagline: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Hall Overview / Description</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={hallData.description || ""}
                    onChange={(e) => setHallData({ ...hallData, description: e.target.value })}
                  />
                </div>

                <div className="form-row-3">
                  <div className="form-group">
                    <label className="form-label">Maximum Guest Capacity</label>
                    <input
                      type="number"
                      className="form-control"
                      value={hallData.capacity || 800}
                      onChange={(e) => setHallData({ ...hallData, capacity: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Parking Capacity (Cars)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={hallData.parkingCapacity || 200}
                      onChange={(e) => setHallData({ ...hallData, parkingCapacity: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Years of Service</label>
                    <input
                      type="number"
                      className="form-control"
                      value={hallData.yearsOfService || 10}
                      onChange={(e) => setHallData({ ...hallData, yearsOfService: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <h4 className="form-subheading">Contact & Location Settings</h4>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Owner / Management Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={hallData.contact?.ownerName || ""}
                      onChange={(e) =>
                        setHallData({
                          ...hallData,
                          contact: { ...hallData.contact, ownerName: e.target.value }
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Public Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={hallData.contact?.email || ""}
                      onChange={(e) =>
                        setHallData({
                          ...hallData,
                          contact: { ...hallData.contact, email: e.target.value }
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Phone Hotline</label>
                    <input
                      type="text"
                      className="form-control"
                      value={hallData.contact?.phone || ""}
                      onChange={(e) =>
                        setHallData({
                          ...hallData,
                          contact: { ...hallData.contact, phone: e.target.value }
                        })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">WhatsApp Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={hallData.contact?.whatsapp || ""}
                      onChange={(e) =>
                        setHallData({
                          ...hallData,
                          contact: { ...hallData.contact, whatsapp: e.target.value }
                        })
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Physical Street Address</label>
                  <input
                    type="text"
                    className="form-control"
                    value={hallData.contact?.address || ""}
                    onChange={(e) =>
                      setHallData({
                        ...hallData,
                        contact: { ...hallData.contact, address: e.target.value }
                      })
                    }
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={savingAction}
                >
                  <Save size={18} />
                  {savingAction ? "Saving Changes..." : "Save Hall Information"}
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: PRICING CONFIGURATION */}
          {activeTab === "pricing" && (
            <div className="admin-pricing-view animate-slide-in">
              <form onSubmit={handleSavePricing} className="card admin-form-card">
                <div className="form-card-header">
                  <h3>Pricing & Tariff Structure</h3>
                  <p>All prices dynamically update the live cost estimator on the public website.</p>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Standard Daily Rate (Mon–Fri) (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={pricingData.dailyPrice || 35000}
                      onChange={(e) => setPricingData({ ...pricingData, dailyPrice: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Weekend Daily Rate (Sat–Sun) (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={pricingData.weekendPrice || 45000}
                      onChange={(e) => setPricingData({ ...pricingData, weekendPrice: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="form-row-3">
                  <div className="form-group">
                    <label className="form-label">Post-Event Cleaning Charge (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={pricingData.cleaningCharge || 3000}
                      onChange={(e) => setPricingData({ ...pricingData, cleaningCharge: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Refundable Security Deposit (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={pricingData.securityDeposit || 10000}
                      onChange={(e) => setPricingData({ ...pricingData, securityDeposit: Number(e.target.value) })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Advance Payable to Reserve (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={pricingData.advanceAmount || 15000}
                      onChange={(e) => setPricingData({ ...pricingData, advanceAmount: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={savingAction}
                >
                  <Save size={18} />
                  {savingAction ? "Saving Pricing..." : "Save Pricing Configuration"}
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: FACILITIES */}
          {activeTab === "facilities" && (
            <div className="admin-facilities-view animate-slide-in">
              <div className="admin-section-header-row">
                <h3>Venue Amenities & Facilities ({facilities.length})</h3>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowNewFacilityModal(true)}
                >
                  <Plus size={16} /> Add Facility
                </button>
              </div>

              <div className="admin-facilities-grid">
                {facilities.map((fac) => (
                  <div key={fac.id} className="admin-fac-card card">
                    <div className="fac-card-top">
                      <span className="fac-icon-pill">{fac.icon}</span>
                      <button
                        type="button"
                        className="btn-delete-icon"
                        onClick={() => handleDeleteFacility(fac.id)}
                        title="Delete Facility"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <h4>{fac.name}</h4>
                    <p>{fac.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: GALLERY */}
          {activeTab === "gallery" && (
            <div className="admin-gallery-view animate-slide-in">
              <div className="admin-section-header-row">
                <h3>Gallery Photos ({gallery.length})</h3>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowNewImageModal(true)}
                >
                  <Plus size={16} /> Add Image
                </button>
              </div>

              <div className="admin-gallery-grid">
                {gallery.map((img) => (
                  <div key={img.id} className="admin-gal-card card">
                    <img src={img.imageUrl} alt={img.title} className="admin-gal-img" />
                    <div className="admin-gal-body">
                      <span className="badge badge-blue">{img.category}</span>
                      <h4>{img.title}</h4>
                      <p>{img.description}</p>
                      <button
                        type="button"
                        className="btn btn-danger btn-xs"
                        onClick={() => handleDeleteGallery(img.id)}
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: BLOCKED DATES */}
          {activeTab === "blocked" && (
            <div className="admin-blocked-view animate-slide-in">
              <div className="admin-section-header-row">
                <div>
                  <h3>Blocked Dates ({blockedDates.length})</h3>
                  <p>Blocked dates show up as unavailable (yellow) on the calendar.</p>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowNewBlockModal(true)}
                >
                  <Plus size={16} /> Block New Date Range
                </button>
              </div>

              <div className="card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Reason</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blockedDates.map((b) => (
                      <tr key={b.id}>
                        <td>{b.startDate}</td>
                        <td>{b.endDate}</td>
                        <td>{b.reason}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-danger btn-xs"
                            onClick={() => handleDeleteBlock(b.id)}
                          >
                            Unblock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {blockedDates.length === 0 && (
                  <p className="empty-p">No dates currently blocked.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 8: MAINTENANCE */}
          {activeTab === "maintenance" && (
            <div className="admin-maintenance-view animate-slide-in">
              <div className="admin-section-header-row">
                <div>
                  <h3>Scheduled Maintenance ({maintenance.length})</h3>
                  <p>Hall maintenance will mark the dates as unavailable to avoid booking overlaps.</p>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowNewMaintModal(true)}
                >
                  <Plus size={16} /> Schedule Maintenance
                </button>
              </div>

              <div className="card">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenance.map((m) => (
                      <tr key={m.id}>
                        <td>{m.startDate} to {m.endDate}</td>
                        <td>{m.reason}</td>
                        <td><span className="badge badge-yellow">{m.status}</span></td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-danger btn-xs"
                            onClick={() => handleDeleteMaint(m.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {maintenance.length === 0 && (
                  <p className="empty-p">No maintenance scheduled.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 9: REVIEWS MODERATION */}
          {activeTab === "reviews" && (
            <div className="admin-reviews-view animate-slide-in">
              <div className="admin-section-header-row">
                <h3>Customer Reviews ({reviews.length})</h3>
              </div>

              <div className="admin-reviews-list">
                {reviews.map((r) => (
                  <div key={r.id} className="admin-review-card card">
                    <div className="rev-head">
                      <div>
                        <strong>{r.userName}</strong> ({r.eventType}) • {r.rating} ⭐
                      </div>
                      <span className={`badge badge-${r.status === "approved" ? "green" : "yellow"}`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="rev-quote">"{r.review}"</p>
                    <div className="rev-actions">
                      {r.status !== "approved" && (
                        <button
                          type="button"
                          className="btn btn-success btn-xs"
                          onClick={() => handleModerateReview(r.id, "approved")}
                        >
                          Approve Publicly
                        </button>
                      )}
                      {r.status === "approved" && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-xs"
                          onClick={() => handleModerateReview(r.id, "pending")}
                        >
                          Unpublish
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-danger btn-xs"
                        onClick={() => handleDeleteReview(r.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: REPORTS & ANALYTICS */}
          {activeTab === "reports" && (
            <div className="admin-reports-view animate-slide-in">
              <div className="reports-grid">
                <div className="report-card card">
                  <h4>Booking Status Distribution</h4>
                  <div className="report-stat-list">
                    <div className="stat-line"><span>Approved Bookings:</span> <strong>{approvedBookings.length}</strong></div>
                    <div className="stat-line"><span>Pending Approvals:</span> <strong>{pendingBookings.length}</strong></div>
                    <div className="stat-line"><span>Cancelled / Declined:</span> <strong>{bookings.filter(b => b.status === "cancelled" || b.status === "rejected").length}</strong></div>
                  </div>
                </div>

                <div className="report-card card">
                  <h4>Financial Metrics</h4>
                  <div className="report-stat-list">
                    <div className="stat-line"><span>Estimated Total Pipeline:</span> <strong>₹{totalEstimatedRevenue.toLocaleString()}</strong></div>
                    <div className="stat-line"><span>Average Booking Value:</span> <strong>₹{approvedBookings.length ? Math.round(totalEstimatedRevenue / approvedBookings.length).toLocaleString() : 0}</strong></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* DETAIL MODAL FOR BOOKINGS */}
      {selectedBooking && !showRejectModal && (
        <div className="modal-backdrop" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Booking Details: {selectedBooking.bookingRef || selectedBooking.id}</h3>
              <button
                type="button"
                className="modal-close-icon"
                onClick={() => setSelectedBooking(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="admin-detail-grid">
                <div><strong>Organizer:</strong> {selectedBooking.customerName}</div>
                <div><strong>Phone:</strong> {selectedBooking.customerPhone}</div>
                <div><strong>Email:</strong> {selectedBooking.customerEmail}</div>
                <div><strong>Address:</strong> {selectedBooking.customerAddress || "N/A"}</div>
                <div><strong>Event:</strong> {selectedBooking.eventType}</div>
                <div><strong>Guests:</strong> {selectedBooking.guestCount}</div>
                <div><strong>Dates:</strong> {selectedBooking.startDate} to {selectedBooking.endDate} ({selectedBooking.numberOfDays} days)</div>
                <div><strong>Time Slot:</strong> {selectedBooking.preferredTime}</div>
                <div><strong>Estimated Total:</strong> ₹{Number(selectedBooking.estimatedAmount || 0).toLocaleString()}</div>
                <div><strong>Status:</strong> <span className={`badge badge-${selectedBooking.status}`}>{selectedBooking.status}</span></div>
              </div>

              {selectedBooking.requirements && (
                <div style={{ marginTop: "1rem" }}>
                  <strong>Special Requirements:</strong>
                  <p>{selectedBooking.requirements}</p>
                </div>
              )}

              {selectedBooking.status === "pending" && (
                <div style={{ marginTop: "1.25rem" }}>
                  <label className="form-label">Internal Admin Note / Message to Customer</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Deposit verified. Welcome to our venue!"
                    value={adminNotesInput}
                    onChange={(e) => setAdminNotesInput(e.target.value)}
                  />
                </div>
              )}

              <div className="modal-actions-row" style={{ marginTop: "1.5rem" }}>
                {selectedBooking.status === "pending" ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() => handleApproveBooking(selectedBooking)}
                      disabled={savingAction}
                    >
                      Approve Booking
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => setShowRejectModal(true)}
                    >
                      Reject Request
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setSelectedBooking(null)}
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && selectedBooking && (
        <div className="modal-backdrop" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Decline Booking Request</h3>
              <button
                type="button"
                className="modal-close-icon"
                onClick={() => setShowRejectModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p>State the reason for declining booking {selectedBooking.bookingRef || selectedBooking.id}:</p>
              <div className="form-group" style={{ marginTop: "1rem" }}>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="e.g. Dates reserved for municipal maintenance, or guest count exceeded..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowRejectModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleRejectBooking}
                  disabled={savingAction}
                >
                  Confirm Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD FACILITY */}
      {showNewFacilityModal && (
        <div className="modal-backdrop" onClick={() => setShowNewFacilityModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Facility</h3>
            </div>
            <form onSubmit={handleAddFacility} className="modal-body">
              <div className="form-group">
                <label className="form-label">Facility Name</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={newFacility.name}
                  onChange={(e) => setNewFacility({ ...newFacility, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  required
                  value={newFacility.description}
                  onChange={(e) => setNewFacility({ ...newFacility, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Icon Identifier</label>
                <select
                  className="form-control"
                  value={newFacility.icon}
                  onChange={(e) => setNewFacility({ ...newFacility, icon: e.target.value })}
                >
                  <option value="Sparkles">Sparkles / Grand</option>
                  <option value="Wind">Wind / Air Conditioning</option>
                  <option value="Utensils">Utensils / Dining</option>
                  <option value="Zap">Zap / Generator Power</option>
                  <option value="Car">Car / Parking</option>
                  <option value="Volume2">Volume2 / Sound System</option>
                  <option value="ShieldCheck">ShieldCheck / Security</option>
                  <option value="Coffee">Coffee / Kitchen</option>
                </select>
              </div>
              <div className="modal-actions-row">
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewFacilityModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Facility</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD IMAGE */}
      {showNewImageModal && (
        <div className="modal-backdrop" onClick={() => setShowNewImageModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Gallery Image</h3>
            </div>
            <form onSubmit={handleAddImage} className="modal-body">
              <div className="form-group">
                <label className="form-label">Image Title</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={newImage.title}
                  onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input
                  type="url"
                  className="form-control"
                  required
                  placeholder="https://images.unsplash.com/... or /assets/..."
                  value={newImage.imageUrl}
                  onChange={(e) => setNewImage({ ...newImage, imageUrl: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-control"
                  value={newImage.category}
                  onChange={(e) => setNewImage({ ...newImage, category: e.target.value })}
                >
                  <option value="Ballroom">Main Ballroom</option>
                  <option value="Dining">Dining Pavilion</option>
                  <option value="Stage">Stage & Decor</option>
                  <option value="Outdoor">Outdoor & Parking</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Caption / Description</label>
                <input
                  type="text"
                  className="form-control"
                  value={newImage.description}
                  onChange={(e) => setNewImage({ ...newImage, description: e.target.value })}
                />
              </div>
              <div className="modal-actions-row">
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewImageModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Image</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BLOCK DATES */}
      {showNewBlockModal && (
        <div className="modal-backdrop" onClick={() => setShowNewBlockModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Block Date Range</h3>
            </div>
            <form onSubmit={handleAddBlockDate} className="modal-body">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  required
                  value={newBlockDate.startDate}
                  onChange={(e) => setNewBlockDate({ ...newBlockDate, startDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-control"
                  required
                  min={newBlockDate.startDate}
                  value={newBlockDate.endDate}
                  onChange={(e) => setNewBlockDate({ ...newBlockDate, endDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Reason for Blocking</label>
                <select
                  className="form-control"
                  value={newBlockDate.reason}
                  onChange={(e) => setNewBlockDate({ ...newBlockDate, reason: e.target.value })}
                >
                  <option value="Private Hall Event">Private Hall Event</option>
                  <option value="Government / Civic Function">Government / Civic Function</option>
                  <option value="Holiday Closure">Holiday Closure</option>
                  <option value="Renovation & Upgrades">Renovation & Upgrades</option>
                </select>
              </div>
              <div className="modal-actions-row">
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewBlockModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Block Dates</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SCHEDULE MAINTENANCE */}
      {showNewMaintModal && (
        <div className="modal-backdrop" onClick={() => setShowNewMaintModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Schedule Hall Maintenance</h3>
            </div>
            <form onSubmit={handleAddMaintenance} className="modal-body">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  required
                  value={newMaint.startDate}
                  onChange={(e) => setNewMaint({ ...newMaint, startDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-control"
                  required
                  min={newMaint.startDate}
                  value={newMaint.endDate}
                  onChange={(e) => setNewMaint({ ...newMaint, endDate: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Maintenance Scope / Reason</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={newMaint.reason}
                  onChange={(e) => setNewMaint({ ...newMaint, reason: e.target.value })}
                />
              </div>
              <div className="modal-actions-row">
                <button type="button" className="btn btn-secondary" onClick={() => setShowNewMaintModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Schedule Maintenance</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
